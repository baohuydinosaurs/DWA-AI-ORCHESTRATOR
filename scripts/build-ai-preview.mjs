import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(new URL("..", import.meta.url).pathname);
const sources = [
  ["BAOHUY_Dinosaur_War_Arena_Enhanced.html", "DWA_AI_Preview_Enhanced.html"],
  ["BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html", "DWA_AI_Preview_VFX_Shader_Audio.html"]
];

const bridge = `
  // DWA AI policy bridge. Policies are local data; no network call occurs in the frame loop.
  const DWA_AI_POLICIES = new Map();
  window.DWA_AI = Object.freeze({
    setPolicy(dinoId, policy, workerId = "manual-policy") {
      if (dinoId === undefined || dinoId === null || !policy || typeof policy !== "object") {
        throw new TypeError("dinoId and policy object are required.");
      }
      const targetMode = policy.targetMode ?? "nearest";
      const tactic = policy.tactic ?? "balanced";
      const retreatBelowHpRatio = policy.retreatBelowHpRatio ?? 0.3;
      const skillPriority = policy.skillPriority ?? [];
      if (!["nearest", "weakest", "strongest"].includes(targetMode)) throw new Error("Invalid targetMode.");
      if (!["balanced", "aggressive", "evasive"].includes(tactic)) throw new Error("Invalid tactic.");
      if (!Number.isFinite(retreatBelowHpRatio) || retreatBelowHpRatio < 0.1 || retreatBelowHpRatio > 0.8) {
        throw new RangeError("retreatBelowHpRatio must be between 0.1 and 0.8.");
      }
      if (!Array.isArray(skillPriority) || !skillPriority.every((item) => typeof item === "string")) {
        throw new TypeError("skillPriority must be an array of skill IDs.");
      }
      DWA_AI_POLICIES.set(String(dinoId), Object.freeze({
        workerId: String(workerId),
        targetMode,
        tactic,
        retreatBelowHpRatio,
        skillPriority: [...skillPriority]
      }));
      return true;
    },
    loadPolicyBundle(bundle) {
      if (!bundle || !Array.isArray(bundle.policies)) throw new TypeError("Policy bundle must contain a policies array.");
      const seen = new Set();
      for (const entry of bundle.policies) {
        if (!entry || entry.dinoId === undefined || seen.has(String(entry.dinoId))) {
          throw new Error("Policy bundle contains a missing or duplicate dinoId.");
        }
        seen.add(String(entry.dinoId));
        this.setPolicy(entry.dinoId, entry.policy, entry.workerId);
      }
      return { loaded: seen.size };
    },
    clearPolicies() {
      const count = DWA_AI_POLICIES.size;
      DWA_AI_POLICIES.clear();
      return count;
    },
    getSnapshot() {
      return {
        running,
        elapsedSeconds: seconds,
        viewMode,
        roster: dinos.map((d) => ({
          id: d.id,
          name: d.name,
          species: d.species,
          teamIdx: d.teamIdx,
          hp: d.hp,
          maxHp: d.maxHp,
          atk: d.atk,
          x: d.x,
          y: d.y,
          alive: d.alive,
          skills: [...d.movePool]
        }))
      };
    },
    getPolicyAssignments() {
      return [...DWA_AI_POLICIES.entries()].map(([dinoId, policy]) => ({
        dinoId,
        workerId: policy.workerId,
        targetMode: policy.targetMode,
        tactic: policy.tactic
      }));
    }
  });
`;

export function integrateGameHtml(html) {
  if (typeof html !== "string" || !html.includes("<script>")) {
    throw new Error("Expected a game HTML file with an inline script.");
  }
  const stepMarker = "  function stepCombat(dt) {";
  const skillMarker = "  function triggerDinoSkill(caster, livingEnemies) {";
  const closeMarker = "})();";
  if (html.split(stepMarker).length !== 2) throw new Error("Expected exactly one stepCombat integration point.");
  if (html.split(skillMarker).length !== 2) throw new Error("Expected exactly one triggerDinoSkill integration point.");
  const closeIndex = html.lastIndexOf(closeMarker);
  if (closeIndex < 0 || html.indexOf(closeMarker) === closeIndex) throw new Error("Could not identify the game IIFE closing point.");

  let output = html.replace(
    stepMarker,
    "  const DWA_AI_POLICIES = new Map();\n\n" + stepMarker
  );

  const nearestBlock = `      let nearest = enemies[0];
      let bestDist = Infinity;
      for (let en of enemies) {
        const dist = Math.hypot(en.x - d.x, en.y - d.y);
        if (dist < bestDist) {
          bestDist = dist;
          nearest = en;
        }
      }`;
  const policyTargetBlock = `${nearestBlock}
      const aiPolicy = DWA_AI_POLICIES.get(String(d.id)) ?? null;
      if (aiPolicy?.targetMode === "weakest") {
        nearest = enemies.reduce((best, candidate) => candidate.hp < best.hp ? candidate : best);
      } else if (aiPolicy?.targetMode === "strongest") {
        nearest = enemies.reduce((best, candidate) => candidate.atk > best.atk ? candidate : best);
      }`;
  if (!output.includes(nearestBlock)) throw new Error("Combat target-selection block was not found.");
  output = output.replace(nearestBlock, policyTargetBlock);

  const distanceMarker = "      const dist = Math.max(1, Math.hypot(dx, dy));";
  output = output.replace(
    distanceMarker,
    distanceMarker + `
      const retreating = aiPolicy?.tactic === "evasive" &&
        d.hp / Math.max(1, d.maxHp) <= aiPolicy.retreatBelowHpRatio;`
  );

  output = output.replace(
    /const spd = ([^;]+);/,
    "const spd = ($1) * (aiPolicy?.tactic === \"aggressive\" ? 1.15 : 1);"
  );
  const movementMarker = "      if (dist > 38) {";
  if (!output.includes(movementMarker)) throw new Error("Combat movement block was not found.");
  output = output.replace(
    movementMarker,
    `      if (retreating) {
        d.vx = -(dx / dist) * spd;
        d.vy = -(dy / dist) * spd;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      } else if (dist > 38) {`
  );

  output = output.replace(
    "      triggerDinoSkill(d, enemies);",
    "      const preferredSkill = aiPolicy?.skillPriority.find((skillId) => d.movePool.includes(skillId));\n      triggerDinoSkill(d, enemies, preferredSkill);"
  );
  output = output.replace(
    "  function triggerDinoSkill(caster, livingEnemies) {",
    "  function triggerDinoSkill(caster, livingEnemies, preferredSkillId = null) {"
  );
  output = output.replace(
    "    const moveId = pick(caster.movePool);",
    "    const moveId = preferredSkillId && caster.movePool.includes(preferredSkillId) ? preferredSkillId : pick(caster.movePool);"
  );

  const end = output.lastIndexOf(closeMarker);
  output = output.slice(0, end) + bridge + "\n  " + output.slice(end);
  return output;
}

async function main() {
  const outputDir = resolve(root, "artifacts/dwa-ai-preview");
  await mkdir(outputDir, { recursive: true });
  for (const [sourceName, outputName] of sources) {
    const sourcePath = resolve(root, sourceName);
    const original = await readFile(sourcePath, "utf8");
    const preview = integrateGameHtml(original);
    const outputPath = resolve(outputDir, outputName);
    await writeFile(outputPath, preview, "utf8");
    console.log(`Built ${basename(outputPath)} (${Buffer.byteLength(preview)} bytes); source unchanged.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
