import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "./task-store.mjs";

async function fixture(t, options={}) {
  const dir=await mkdtemp(join(tmpdir(),"dwa-task-store-"));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  return new TaskStore({filePath:join(dir,"queue.json"),...options});
}

test("enqueues, claims, completes and persists task events",async(t)=>{
  const store=await fixture(t);
  await store.enqueue({taskId:"t-1",workerId:"combat-001",roleId:"combat",description:"Review combat"});
  const task=await store.claimNext("combat-001");
  assert.equal(task.status,"running");
  assert.equal(task.attempts,1);
  await store.complete("t-1","combat-001",{summary:"done"});
  const state=await store.snapshot();
  assert.equal(state.tasks[0].status,"completed");
  assert.equal(state.tasks[0].result.summary,"done");
  assert.ok(state.events.length>=3);
});
test("prevents another worker from completing a leased task",async(t)=>{
  const store=await fixture(t);
  await store.enqueue({taskId:"t-2",workerId:"qa-001",roleId:"qa",description:"test"});
  await store.claimNext("qa-001");
  await assert.rejects(store.complete("t-2","other-worker",{}),/not leased/);
});
test("requeues expired leases and permits retry",async(t)=>{
  let now=1000;
  const store=await fixture(t,{leaseMs:100,now:()=>now});
  await store.enqueue({taskId:"t-3",workerId:"qa-002",roleId:"qa",description:"test"});
  await store.claimNext("qa-002");
  now=1200;
  const retried=await store.claimNext("qa-002");
  assert.equal(retried.status,"running");
  assert.equal(retried.attempts,2);
});
test("writes and restores a durable checkpoint",async(t)=>{
  const store=await fixture(t);
  await store.enqueue({taskId:"t-4",workerId:"visuals-001",roleId:"visuals",description:"inspect"});
  await store.claimNext("visuals-001");
  const checkpoint=await store.checkpoint({reason:"test"});
  assert.equal(checkpoint.sha256.length,64);
  await store.complete("t-4","visuals-001",{summary:"after checkpoint"});
  const restored=await store.restoreCheckpoint();
  assert.equal(restored.taskCount,1);
  const state=await store.snapshot();
  assert.equal(state.tasks[0].status,"running");
  assert.equal(state.tasks[0].lease.owner,"visuals-001");
});
test("rejects duplicate task ids",async(t)=>{
  const store=await fixture(t);
  const task={taskId:"dup",workerId:"x",roleId:"x",description:"x"};
  await store.enqueue(task);
  await assert.rejects(store.enqueue(task),/Duplicate taskId/);
});

test("concurrent claims cannot lease the same task more than once",async(t)=>{
  const store=await fixture(t);
  await store.enqueue({taskId:"t-concurrent",workerId:"qa-parallel",roleId:"qa",description:"concurrent claim safety"});
  const claims=await Promise.all(
    Array.from({length:8},()=>store.claimNext("qa-parallel"))
  );
  const successful=claims.filter(Boolean);
  assert.equal(successful.length,1);
  assert.equal(successful[0].taskId,"t-concurrent");
  assert.equal((await store.snapshot()).tasks[0].attempts,1);
});
