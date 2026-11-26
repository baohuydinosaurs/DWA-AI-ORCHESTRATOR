import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "./task-store.mjs";
import { runOneTask } from "./task-runner.mjs";

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), "dwa-task-runner-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return new TaskStore({ filePath: join(dir, "queue.json") });
}

test("worker claims, executes and completes exactly one assigned task", async (t) => {
  const store = await fixture(t);
  await store.enqueue({ taskId: "task-1", workerId: "worker-1", roleId: "qa", description: "Run QA" });
  const result = await runOneTask({
    store,
    workerId: "worker-1",
    executeTask: async (task) => ({ summary: "passed", receivedTask: task.taskId })
  });
  assert.equal(result.status, "completed");
  assert.equal(result.result.receivedTask, "task-1");
  const snapshot = await store.snapshot();
  assert.equal(snapshot.tasks[0].status, "completed");
});

test("worker does not claim another worker's task", async (t) => {
  const store = await fixture(t);
  await store.enqueue({ taskId: "task-2", workerId: "worker-2", roleId: "qa", description: "Other task" });
  const result = await runOneTask({ store, workerId: "worker-1", executeTask: async () => "should not run" });
  assert.equal(result.status, "idle");
  assert.equal((await store.snapshot()).tasks[0].status, "queued");
});

test("executor failures are persisted as failed task outcomes", async (t) => {
  const store = await fixture(t);
  await store.enqueue({ taskId: "task-3", workerId: "worker-3", roleId: "qa", description: "Fail deliberately" });
  const result = await runOneTask({
    store,
    workerId: "worker-3",
    executeTask: async () => { throw new Error("simulated provider outage"); }
  });
  assert.equal(result.status, "failed");
  assert.match(result.error, /simulated provider outage/);
  assert.equal((await store.snapshot()).tasks[0].status, "failed");
});

test("empty executor results are rejected and recorded", async (t) => {
  const store = await fixture(t);
  await store.enqueue({ taskId: "task-4", workerId: "worker-4", roleId: "qa", description: "Empty result" });
  const result = await runOneTask({ store, workerId: "worker-4", executeTask: async () => null });
  assert.equal(result.status, "failed");
  assert.match(result.error, /no result/i);
});

test("renews a long-running task lease while its executor is active",async(t)=>{
  const dir=await mkdtemp(join(tmpdir(),"dwa-runner-heartbeat-"));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new TaskStore({filePath:join(dir,"queue.json"),leaseMs:150});
  await store.enqueue({taskId:"long-task",workerId:"worker-long",roleId:"qa",description:"long operation"});
  const result=await runOneTask({
    store,
    workerId:"worker-long",
    leaseRenewalMs:30,
    executeTask:async()=>{
      await new Promise(resolve=>setTimeout(resolve,280));
      return {ok:true};
    }
  });
  assert.equal(result.status,"completed");
  const state=await store.snapshot();
  assert.ok(state.events.some((event)=>event.type==="task-lease-renewed"),"heartbeat should persist at least one lease renewal");
  assert.equal(state.tasks[0].status,"completed");
});

test("rejects lease renewal by a worker that does not own the task",async(t)=>{
  const dir=await mkdtemp(join(tmpdir(),"dwa-runner-lease-owner-"));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new TaskStore({filePath:join(dir,"queue.json")});
  await store.enqueue({taskId:"owned-task",workerId:"owner",roleId:"qa",description:"owned"});
  await store.claimNext("owner");
  await assert.rejects(store.renewLease("owned-task","intruder"),/cannot be renewed/);
});
