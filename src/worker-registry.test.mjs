import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildWorkerRegistry } from "./worker-registry.mjs";

test("creates exactly 100 uniquely identified worker records across 10 groups", async () => {
  const roles = JSON.parse(await readFile(new URL("../config/worker-roles.json", import.meta.url), "utf8"));
  const workers = buildWorkerRegistry(roles);
  assert.equal(roles.length, 10);
  assert.equal(workers.length, 100);
  assert.equal(new Set(workers.map((worker) => worker.id)).size, 100);
  for (const role of roles) {
    assert.equal(workers.filter((worker) => worker.roleId === role.id).length, 10);
  }
});

test("rejects invalid worker group definitions", () => {
  assert.throws(() => buildWorkerRegistry([{ id: "broken", name: "Broken", workers: 0 }]));
});
