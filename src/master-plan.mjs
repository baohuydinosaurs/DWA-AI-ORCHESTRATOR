import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMasterPlan } from "./master-orchestrator.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const roles=JSON.parse(await readFile(resolve(root,"config/worker-roles.json"),"utf8"));
const rules=JSON.parse(await readFile(resolve(root,"config/tournament-rules.json"),"utf8"));
const plan=createMasterPlan(roles,rules);
const output=resolve(root,".runtime/master-plan.json");
await mkdir(dirname(output),{recursive:true});
await writeFile(output,JSON.stringify({...plan,generatedAt:new Date().toISOString()},null,2)+"\n");
console.log(`Master plan generated: ${plan.workerCount} worker identities, ${plan.teamLeads.length} team leads. Model inference remains unconfigured.`);
