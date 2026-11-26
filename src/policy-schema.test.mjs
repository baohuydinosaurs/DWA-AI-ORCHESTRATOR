import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateCombatPolicy, validatePolicyBundle, serializePolicyBundle } from "./policy-schema.mjs";

test("normalizes defaults into a safe balanced policy",()=>{
  assert.deepEqual(validateCombatPolicy({}),{
    targetMode:"nearest",
    tactic:"balanced",
    retreatBelowHpRatio:0.3,
    skillPriority:[]
  });
});

test("accepts policy modes and preserves ordered skill priorities",()=>{
  const policy=validateCombatPolicy({
    targetMode:"weakest",
    tactic:"evasive",
    retreatBelowHpRatio:0.42,
    skillPriority:["heal-aoe","buff-power"]
  });
  assert.equal(policy.targetMode,"weakest");
  assert.deepEqual(policy.skillPriority,["heal-aoe","buff-power"]);
});

test("rejects unknown fields and invalid policy values",()=>{
  assert.throws(()=>validateCombatPolicy({targetMode:"random"}),/targetMode/);
  assert.throws(()=>validateCombatPolicy({tactic:"teleport"}),/tactic/);
  assert.throws(()=>validateCombatPolicy({retreatBelowHpRatio:0.95}),/between 0.1 and 0.8/);
  assert.throws(()=>validateCombatPolicy({script:"alert(1)"}),/Unknown policy fields/);
  assert.throws(()=>validateCombatPolicy({skillPriority:["buff-power","buff-power"]}),/duplicate/);
});

test("validates bundle structure, worker provenance and unique dino IDs",()=>{
  const bundle=validatePolicyBundle({
    schemaVersion:1,
    policies:[
      {dinoId:0,workerId:"combat-001",policy:{targetMode:"weakest"}},
      {dinoId:"dino-b",workerId:"combat-002",policy:{tactic:"aggressive"}}
    ]
  });
  assert.equal(bundle.policies.length,2);
  assert.equal(bundle.policies[0].workerId,"combat-001");
  assert.equal(bundle.policies[1].policy.tactic,"aggressive");
});

test("rejects duplicate dino IDs and missing worker attribution",()=>{
  assert.throws(()=>validatePolicyBundle({schemaVersion:1,policies:[
    {dinoId:1,workerId:"a",policy:{}},
    {dinoId:"1",workerId:"b",policy:{}}
  ]}),/Duplicate dinoId/);
  assert.throws(()=>validatePolicyBundle({schemaVersion:1,policies:[
    {dinoId:1,policy:{}}
  ]}),/workerId is required/);
});

test("serializes only validated bundle data without mutating input",()=>{
  const input={schemaVersion:1,policies:[{dinoId:2,workerId:"combat-003",policy:{}}]};
  const json=serializePolicyBundle(input);
  assert.match(json,/"schemaVersion": 1/);
  assert.equal(input.policies[0].policy.targetMode,undefined);
  assert.deepEqual(JSON.parse(json).policies[0].policy,{
    targetMode:"nearest",tactic:"balanced",retreatBelowHpRatio:0.3,skillPriority:[]
  });
});


test("validates the checked-in demo bundle used by the mobile preview loader",async()=>{
  const raw=await readFile(new URL("../config/demo-policy-bundle.json",import.meta.url),"utf8");
  const bundle=validatePolicyBundle(JSON.parse(raw));
  assert.equal(bundle.policies.length,4);
  assert.ok(bundle.policies.every((entry)=>entry.workerId.startsWith("demo-policy-not-live-ai-")));
});
