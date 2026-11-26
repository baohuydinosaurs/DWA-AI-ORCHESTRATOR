import { TaskStore } from "./task-store.mjs";

/**
 * Executes at most one task assigned to workerId.
 * The executor is injected so model providers can be tested independently.
 */
export async function runOneTask({
  store = new TaskStore(),
  workerId,
  executeTask
} = {}) {
  if (!workerId) throw new Error("workerId is required.");
  if (typeof executeTask !== "function") throw new TypeError("executeTask must be a function.");

  const task = await store.claimNext(workerId);
  if (!task) return { status: "idle", workerId };

  try {
    const result = await executeTask({
      taskId: task.taskId,
      workerId,
      roleId: task.roleId,
      description: task.description,
      payload: task.payload,
      attempt: task.attempts
    });
    if (result === undefined || result === null) {
      throw new Error("Task executor returned no result.");
    }
    await store.complete(task.taskId, workerId, result);
    return { status: "completed", taskId: task.taskId, workerId, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await store.fail(task.taskId, workerId, message);
    return { status: "failed", taskId: task.taskId, workerId, error: message };
  }
}
