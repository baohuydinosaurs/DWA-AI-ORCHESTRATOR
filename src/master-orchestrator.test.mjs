import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildWorkerRegistry } from "./worker-registry.mjs";
import { validateTournamentRules, createMasterPlan, assignTask, validateWorkerResult, validateFeatureContribution, recordFeatureContribution, evaluateFeatureForIntegration, buildCompositeChampion } from "./master-orchestrator.mjs";

const roles = JSON.parse(await readFile(new URL("../config/worker-roles.json", import.meta.url),"utf8"));
const rules = JSON.parse(await readFile(new URL("../config/tournament-rules.json", import.meta.url),"utf8"));

test("locks the original DWA tournament and scoring rules",()=>{
  assert.deepEqual(validateTournamentRules(rules),{entrants:100,stages:[100,20,8,4,2,1],scoreTotal:100,groups:10,workersPerGroup:10,durationMinutes:60,scheduledMinutes:60});
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

const feature = {
  featureId:"fx-unique-camera-001",
  workerId:"visuals-007",
  title:"Adaptive cinematic camera",
  description:"A reusable camera transition feature.",
  sourceFiles:["src/camera.mjs"],
  testsRun:[{name:"camera unit tests",status:"passed"}],
  compatibility:"compatible",
  artifactRef:"artifacts/camera.patch"
};

test("60-minute schedule sums exactly and contains all 7 stages",()=>{
  assert.equal(rules.competition.schedule.length,7);
  assert.equal(rules.competition.schedule.reduce((n,s)=>n+s.minutes,0),60);
  assert.equal(rules.competition.durationMinutes,60);
});
test("retains a valid unique feature contribution in registry regardless of rank",()=>{
  assert.equal(validateFeatureContribution(feature),true);
  const registry=recordFeatureContribution([],{...feature,rank:99});
  assert.equal(registry.length,1);
  assert.equal(registry[0].retainedRegardlessOfRank,true);
});
test("rejects feature integration without compatibility and test evidence",()=>{
  assert.equal(evaluateFeatureForIntegration({...feature,compatibility:"pending"},{regressionPassed:true,conflictFree:true}).accepted,false);
  assert.equal(evaluateFeatureForIntegration({...feature,testsRun:[]},{regressionPassed:true,conflictFree:true}).accepted,false);
});
test("approves only compatible, tested, regression-safe, conflict-free features",()=>{
  assert.equal(evaluateFeatureForIntegration(feature,{regressionPassed:true,conflictFree:true}).accepted,true);
  assert.equal(evaluateFeatureForIntegration(feature,{regressionPassed:false,conflictFree:true}).accepted,false);
  assert.equal(evaluateFeatureForIntegration(feature,{regressionPassed:true,conflictFree:false}).accepted,false);
});
test("composite champion can combine features from different workers",()=>{
  const champion=buildCompositeChampion([
    {featureId:"f1",workerId:"visuals-007",decision:{accepted:true}},
    {featureId:"f2",workerId:"combat-003",decision:{accepted:true}},
    {featureId:"f3",workerId:"qa-001",decision:{accepted:false}}
  ]);
  assert.deepEqual(champion.sourceWorkerIds,["visuals-007","combat-003"]);
  assert.deepEqual(champion.acceptedFeatureIds,["f1","f2"]);
  assert.equal(champion.status,"requires-final-end-to-end-validation");
});
