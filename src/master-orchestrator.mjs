import { buildWorkerRegistry } from "./worker-registry.mjs";

export function validateTournamentRules(rules) {
  if (rules?.competition?.entrants !== 100) throw new Error("DWA competition must start with 100 entrants.");
  if (JSON.stringify(rules?.competition?.stages) !== JSON.stringify([100, 20, 8, 4, 2, 1])) {
    throw new Error("DWA tournament stages are locked: 100 → 20 → 8 → 4 → 2 → 1.");
  }
  const total = (rules?.scoring ?? []).reduce((sum, item) => sum + item.points, 0);
  if (total !== 100) throw new Error(`Scoring rubric must total 100; received ${total}.`);
  if (rules.competition.durationMinutes !== 60) throw new Error("DWA competition duration must remain 60 minutes.");
  const scheduledMinutes = (rules.competition.schedule ?? []).reduce((sum, stage) => sum + stage.minutes, 0);
  if (scheduledMinutes !== 60) throw new Error(`Competition schedule must total 60 minutes; received ${scheduledMinutes}.`);
  if (rules.competition.selectionPolicy !== "rankings-do-not-delete-unique-capabilities") throw new Error("Unique capability retention policy is required.");
  if (rules.competition.groups !== 10 || rules.competition.workersPerGroup !== 10) {
    throw new Error("DWA must retain 10 groups of 10 workers.");
  }
  return { entrants:100, stages:[100,20,8,4,2,1], scoreTotal:total, groups:10, workersPerGroup:10, durationMinutes:60, scheduledMinutes };
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
    durationMinutes:rules.competition.durationMinutes,
    schedule:rules.competition.schedule,
    featureHarvest:rules.featureHarvest,
    championDefinition:rules.competition.championDefinition,
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

export function validateFeatureContribution(feature) {
  const required = ["featureId","workerId","title","description","sourceFiles","testsRun","compatibility","artifactRef"];
  for (const key of required) {
    if (!(key in (feature ?? {}))) throw new Error(`Feature contribution missing required field: ${key}`);
  }
  if (!feature.featureId.trim() || !feature.workerId.trim() || !feature.title.trim() || !feature.description.trim()) {
    throw new Error("Feature identifiers, title and description must be non-empty.");
  }
  if (!Array.isArray(feature.sourceFiles) || !Array.isArray(feature.testsRun)) {
    throw new Error("sourceFiles and testsRun must be arrays.");
  }
  if (!["pending","compatible","incompatible"].includes(feature.compatibility)) {
    throw new Error("compatibility must be pending, compatible or incompatible.");
  }
  return true;
}

export function recordFeatureContribution(registry, feature) {
  validateFeatureContribution(feature);
  const existing = registry.find((item) => item.featureId === feature.featureId);
  if (existing) {
    if (existing.workerId !== feature.workerId) throw new Error(`Feature ID collision: ${feature.featureId}`);
    return registry.map((item) => item.featureId === feature.featureId ? {...item,...feature,updatedAt:new Date().toISOString()} : item);
  }
  return [...registry, {...feature,recordedAt:new Date().toISOString(),retainedRegardlessOfRank:true,mergeStatus:"not-merged"}];
}

export function evaluateFeatureForIntegration(feature, {regressionPassed, conflictFree}) {
  validateFeatureContribution(feature);
  if (feature.compatibility !== "compatible") return {accepted:false,reason:"Feature has not passed compatibility review."};
  if (!Array.isArray(feature.testsRun) || feature.testsRun.length === 0) return {accepted:false,reason:"No test evidence supplied."};
  if (!feature.testsRun.every((item) => item && item.status === "passed")) return {accepted:false,reason:"Feature-specific tests have not all passed."};
  if (!regressionPassed) return {accepted:false,reason:"Composite regression tests have not passed."};
  if (!conflictFree) return {accepted:false,reason:"Integration conflict must be resolved before merging."};
  return {accepted:true,reason:"Feature is eligible for controlled integration.",mergeStatus:"approved-for-integration"};
}

export function buildCompositeChampion(featureDecisions) {
  const accepted = featureDecisions.filter((item) => item.decision?.accepted);
  return {
    definition:"verified-composite-build",
    acceptedFeatureIds:accepted.map((item)=>item.featureId),
    rejectedFeatureIds:featureDecisions.filter((item)=>!item.decision?.accepted).map((item)=>item.featureId),
    sourceWorkerIds:[...new Set(accepted.map((item)=>item.workerId))],
    status:"requires-final-end-to-end-validation",
    note:"Tournament rank never automatically deletes a verified feature. The composite champion is not declared release-ready until full integration and end-to-end tests pass."
  };
}
