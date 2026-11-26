# DWA Task Runner

## Purpose
The task runner connects one registered worker identity to the persistent JSON TaskStore. It claims no more than one task per invocation, executes an injected task function, and persists either a completed result or a failure.

## Contract
- Tasks are routed to the exact `workerId` recorded at enqueue time.
- An executor must return a non-null result before a task can be marked completed.
- Exceptions and empty results are recorded as failed outcomes; they are never reported as success.
- A runner invocation processes at most one task and then exits.
- The JSON store uses a filesystem lock intended for one local Node.js host. It is not a distributed queue and must not be shared across independent GitHub-hosted runners.

## Usage
```js
import { TaskStore } from "./task-store.mjs";
import { runOneTask } from "./task-runner.mjs";

const store = new TaskStore({ filePath: ".runtime/tasks.json" });
const outcome = await runOneTask({
  store,
  workerId: "dwa-worker-qa-001",
  executeTask: async (task) => {
    // Connect a verified model/provider adapter here.
    return { summary: "Task result", taskId: task.taskId };
  }
});
console.log(outcome);
```

The injected executor above is an interface example, not a live AI provider. A worker is only considered a real AI worker when its executor calls a configured model successfully and the resulting response is persisted.

## Tests
Run `npm test`. Tests cover successful execution, worker isolation, persisted failures, and rejection of empty results.
