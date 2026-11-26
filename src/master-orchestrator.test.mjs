import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildWorkerRegistry } from "./worker-registry.mjs";
import { validateTournamentRules, createMasterPlan, assignTask, validateWorkerResult } from "./master-orchestrator.mjs";

const roles = JSON.parse(await readFile(new URL("../config/worker-roles.json", import.meta.url),"utf8"));
const rules = JSON.parse(await readFile(new URL("../config/tournament-rules.json", import.meta.url),"utf8"));

test("locks the original DWA tournament and scoring rules",()=>{
  assert.deepEqual(validateTournamentRules(rules),{entrants:100,stages:[100,20,8,4,2,1],scoreTotal:100,groups:10,workersPerGroup:10});
});
test("builds one master plan with 10 leads and 100 unique worker identities",()=>{
  const plan=createMasterPlan(roles,rules);
  assert.equal(plan.masterAI.id,"dwa-master-001");
  assert.equal(plan.teamLeads.length,10);
  assert.equal(plan.workerCount,100);
  assert.equal(new Set(plan.workers.map(w=>w.id)).size,100);
  assert.equal(plan.masterAI.modelInference,"not-configured");
});
test("assigns a task only to a registered worker in the requested specialty",()=>{
  const workers=buildWorkerRegistry(roles);
  const result=assignTask({workers,taskId:"task-001",roleId:"combat",description:"Audit combat skill logic"});
  assert.equal(result.assignment.workerId,"combat-001");
  assert.equal(result.workers.find(w=>w.id==="combat-001").status,"assigned");
});
test("rejects a tournament rule change that would alter the original format",()=>{
  assert.throws(()=>validateTournamentRules({...rules,competition:{...rules.competition,stages:[100,50,10,1]}}),/stages are locked/);
});
test("rejects incomplete worker results",()=>{
  assert.throws(()=>validateWorkerResult({workerId:"x"}),/taskId/);
});
test("accepts a fully auditable worker result",()=>{
  assert.equal(validateWorkerResult({workerId:"combat-001",taskId:"task-001",summary:"Audit completed",filesInspected:[],testsRun:[],limitations:[]}),true);
});
