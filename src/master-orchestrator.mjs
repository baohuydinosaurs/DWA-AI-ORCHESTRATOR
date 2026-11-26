import { buildWorkerRegistry } from "./worker-registry.mjs";

export function validateTournamentRules(rules) {
  if (rules?.competition?.entrants !== 100) throw new Error("DWA competition must start with 100 entrants.");
  if (JSON.stringify(rules?.competition?.stages) !== JSON.stringify([100, 20, 8, 4, 2, 1])) {
    throw new Error("DWA tournament stages are locked: 100 → 20 → 8 → 4 → 2 → 1.");
  }
  const total = (rules?.scoring ?? []).reduce((sum, item) => sum + item.points, 0);
  if (total !== 100) throw new Error(`Scoring rubric must total 100; received ${total}.`);
  if (rules.competition.groups !== 10 || rules.competition.workersPerGroup !== 10) {
    throw new Error("DWA must retain 10 groups of 10 workers.");
  }
  return { entrants:100, stages:[100,20,8,4,2,1], scoreTotal:total, groups:10, workersPerGroup:10 };
}

export function createMasterPlan(roles, rules) {
  validateTournamentRules(rules);
  const workers = buildWorkerRegistry(roles);
  if (workers.length !== 100) throw new Error("Master plan requires exactly 100 worker identities.");
  return {
    schemaVersion:1,
    authority:"DWA-CORE-DIRECTIVE",
    mode:"orchestrator-foundation",
    masterAI:{id:"dwa-master-001",status:"coordination-engine-ready",modelInference:"not-configured"},
    teamLeads:roles.map((role) => ({id:`${role.id}-lead`,roleId:role.id,roleName:role.name,workerCount:10})),
    workerCount:workers.length,
    tournamentStages:rules.competition.stages,
    scoringTotal:rules.scoring.reduce((sum,item)=>sum+item.points,0),
    executionGates:rules.gates,
    workers
  };
}

export function assignTask({workers, taskId, roleId, description}) {
  if (!taskId || !roleId || !description?.trim()) throw new Error("taskId, roleId and description are required.");
  const worker = workers.find((item) => item.roleId === roleId && item.status === "registered" && !item.taskId);
  if (!worker) throw new Error(`No available registered worker for role: ${roleId}`);
  return {
    workers:workers.map((item)=>item.id===worker.id?{...item,status:"assigned",taskId}:item),
    assignment:{taskId,workerId:worker.id,roleId,description,status:"assigned"}
  };
}

export function validateWorkerResult(result) {
  const required = ["workerId","taskId","summary","filesInspected","testsRun","limitations"];
  for (const key of required) {
    if (!(key in (result ?? {}))) throw new Error(`Worker result missing required field: ${key}`);
  }
  if (!Array.isArray(result.filesInspected) || !Array.isArray(result.testsRun) || !Array.isArray(result.limitations)) {
    throw new Error("filesInspected, testsRun and limitations must be arrays.");
  }
  if (!result.summary.trim()) throw new Error("Worker result summary cannot be empty.");
  return true;
}
