import { TaskStore } from "./task-store.mjs";

/**
 * Executes at most one task assigned to workerId.
 * The executor is injected so model providers can be tested independently.
 */
export async function runOneTask({
  store = new TaskStore(),
  workerId,
  executeTask,
  leaseRenewalMs
} = {}) {
  if (!workerId) throw new Error("workerId is required.");
  if (typeof executeTask !== "function") throw new TypeError("executeTask must be a function.");

  const task = await store.claimNext(workerId);
  if (!task) return { status: "idle", workerId };

  const renewalInterval = leaseRenewalMs ?? Math.max(250, Math.floor((store.leaseMs ?? 300_000) / 3));
  let renewalError = null;
  let renewalInFlight = false;
  const heartbeat = typeof store.renewLease === "function" && Number.isInteger(renewalInterval) && renewalInterval > 0
    ? setInterval(async () => {
        if (renewalInFlight || renewalError) return;
        renewalInFlight = true;
        try {
          await store.renewLease(task.taskId, workerId);
        } catch (error) {
          renewalError = error;
        } finally {
          renewalInFlight = false;
        }
      }, renewalInterval)
    : null;
  heartbeat?.unref?.();

  try {
    const result = await executeTask({
      taskId: task.taskId,
      workerId,
      roleId: task.roleId,
      description: task.description,
      payload: task.payload,
      attempt: task.attempts
    });
    if (renewalError) throw new Error(`Task lease renewal failed: ${renewalError.message}`);
    if (result === undefined || result === null) {
      throw new Error("Task executor returned no result.");
    }
    await store.complete(task.taskId, workerId, result);
    return { status: "completed", taskId: task.taskId, workerId, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await store.fail(task.taskId, workerId, message);
    } catch (persistError) {
      return { status: "failed", taskId: task.taskId, workerId, error: message, persistenceError: persistError.message };
    }
    return { status: "failed", taskId: task.taskId, workerId, error: message };
  } finally {
    if (heartbeat) clearInterval(heartbeat);
    if (renewalInFlight) await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
