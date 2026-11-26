import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";

/**
 * Durable JSON-backed queue for a single-writer Node process.
 * For multiple independent runners, move this interface to a transactional DB.
 */
export class TaskStore {
  constructor({ filePath = ".runtime/task-store.json", leaseMs = 5 * 60_000, now = () => Date.now() } = {}) {
    this.filePath = resolve(filePath);
    this.lockPath = `${this.filePath}.lock`;
    this.leaseMs = leaseMs;
    this.now = now;
  }

  async #read() {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8"));
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.events)) {
        throw new Error("Task store schema is invalid.");
      }
      return parsed;
    } catch (error) {
      if (error.code === "ENOENT") return { schemaVersion:1, revision:0, tasks:[], events:[] };
      throw error;
    }
  }

  async #withLock(action) {
    await mkdir(dirname(this.filePath), { recursive:true });
    let handle;
    const deadline = this.now() + 10_000;
    while (!handle) {
      try {
        await mkdir(this.lockPath);
        handle = true;
        await writeFile(resolve(this.lockPath,"owner.json"), JSON.stringify({ pid:process.pid, createdAt:this.now() }));
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        if (this.now() > deadline) throw new Error("Task store is locked; retry later. Lock is not removed automatically.");
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    try { return await action(); }
    finally { await rm(this.lockPath,{recursive:true,force:true}); }
  }

  async #write(state) {
    state.revision += 1;
    const temp = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(state,null,2)+"\n",{flag:"wx"});
    await rename(temp,this.filePath);
  }

  async enqueue({ taskId = randomUUID(), workerId, roleId, description, payload = null }) {
    if (!workerId || !roleId || !description?.trim()) throw new Error("workerId, roleId and description are required.");
    return this.#withLock(async () => {
      const state = await this.#read();
      if (state.tasks.some((task) => task.taskId === taskId)) throw new Error(`Duplicate taskId: ${taskId}`);
      const task = { taskId, workerId, roleId, description, payload, status:"queued", attempts:0, createdAt:new Date(this.now()).toISOString(), lease:null, result:null, error:null };
      state.tasks.push(task);
      state.events.push({ type:"task-enqueued", taskId, at:new Date(this.now()).toISOString() });
      await this.#write(state);
      return task;
    });
  }

  async claimNext(workerId) {
    if (!workerId) throw new Error("workerId is required.");
    return this.#withLock(async () => {
      const state = await this.#read();
      const now = this.now();
      for (const task of state.tasks) {
        if (task.status === "running" && task.lease?.expiresAt <= now) {
          task.status = "queued";
          task.lease = null;
          state.events.push({type:"task-lease-expired",taskId:task.taskId,at:new Date(now).toISOString()});
        }
      }
      const task = state.tasks.find((item) => item.status === "queued" && item.workerId === workerId);
      if (!task) { await this.#write(state); return null; }
      task.status = "running";
      task.attempts += 1;
      task.lease = { owner:workerId, claimedAt:new Date(now).toISOString(), expiresAt:now+this.leaseMs };
      state.events.push({type:"task-claimed",taskId:task.taskId,workerId,attempt:task.attempts,at:new Date(now).toISOString()});
      await this.#write(state);
      return task;
    });
  }

  async renewLease(taskId, workerId) {
    return this.#withLock(async () => {
      const state=await this.#read();
      const task=state.tasks.find((item)=>item.taskId===taskId);
      if (!task) throw new Error(`Unknown taskId: ${taskId}`);
      if (task.status!=="running" || task.lease?.owner!==workerId) {
        throw new Error("Task lease cannot be renewed by this worker.");
      }
      const now=this.now();
      task.lease.expiresAt=now+this.leaseMs;
      task.lease.renewedAt=new Date(now).toISOString();
      state.events.push({type:"task-lease-renewed",taskId,workerId,at:new Date(now).toISOString()});
      await this.#write(state);
      return task.lease.expiresAt;
    });
  }

  async complete(taskId, workerId, result) {
    return this.#finish(taskId,workerId,{status:"completed",result,error:null});
  }

  async fail(taskId, workerId, error) {
    return this.#finish(taskId,workerId,{status:"failed",result:null,error:String(error)});
  }

  async #finish(taskId, workerId, outcome) {
    return this.#withLock(async () => {
      const state=await this.#read();
      const task=state.tasks.find((item)=>item.taskId===taskId);
      if (!task) throw new Error(`Unknown taskId: ${taskId}`);
      if (task.status!=="running" || task.lease?.owner!==workerId) throw new Error("Task is not leased by this worker.");
      Object.assign(task,outcome,{finishedAt:new Date(this.now()).toISOString(),lease:null});
      state.events.push({type:`task-${outcome.status}`,taskId,workerId,at:new Date(this.now()).toISOString()});
      await this.#write(state);
      return task;
    });
  }

  async checkpoint(metadata = {}) {
    return this.#withLock(async () => {
      const state=await this.#read();
      const body=JSON.stringify({schemaVersion:1,revision:state.revision,timestamp:new Date(this.now()).toISOString(),metadata,state},null,2)+"\n";
      const checkpointPath=`${this.filePath}.checkpoint.json`;
      const temp=`${checkpointPath}.${randomUUID()}.tmp`;
      await writeFile(temp,body,{flag:"wx"});
      await rename(temp,checkpointPath);
      return {path:checkpointPath,sha256:createHash("sha256").update(body).digest("hex"),revision:state.revision};
    });
  }

  async restoreCheckpoint() {
    return this.#withLock(async () => {
      const checkpointPath=`${this.filePath}.checkpoint.json`;
      const wrapper=JSON.parse(await readFile(checkpointPath,"utf8"));
      if (wrapper.schemaVersion!==1 || wrapper.state?.schemaVersion!==1) throw new Error("Checkpoint schema is invalid.");
      const temp=`${this.filePath}.${randomUUID()}.tmp`;
      await writeFile(temp,JSON.stringify(wrapper.state,null,2)+"\n",{flag:"wx"});
      await rename(temp,this.filePath);
      return {revision:wrapper.state.revision,taskCount:wrapper.state.tasks.length};
    });
  }

  async snapshot() { return this.#read(); }
}
