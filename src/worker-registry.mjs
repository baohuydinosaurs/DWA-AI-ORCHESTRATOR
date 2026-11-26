import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rolesPath = resolve(root, "config/worker-roles.json");
const outputPath = resolve(root, ".runtime/workers.json");

export function buildWorkerRegistry(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("Worker roles must be a non-empty array.");
  }

  const ids = new Set();
  const workers = [];

  for (const role of roles) {
    if (!role.id || !role.name || !Number.isInteger(role.workers) || role.workers < 1) {
      throw new Error("Each role needs id, name, and a positive integer workers count.");
    }

    for (let index = 1; index <= role.workers; index += 1) {
      const id = `${role.id}-${String(index).padStart(3, "0")}`;
      if (ids.has(id)) throw new Error(`Duplicate worker id: ${id}`);
      ids.add(id);
      workers.push({
        id,
        roleId: role.id,
        roleName: role.name,
        ordinal: index,
        status: "registered",
        executionMode: "not-configured",
        taskId: null,
        createdAt: new Date().toISOString()
      });
    }
  }

  return workers;
}

async function main() {
  const roles = JSON.parse(await readFile(rolesPath, "utf8"));
  const workers = buildWorkerRegistry(roles);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    count: workers.length,
    note: "Registry records only; these entries are not running AI agents.",
    workers
  }, null, 2) + "\n");
  process.stdout.write(`Registered ${workers.length} worker records in ${outputPath}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
