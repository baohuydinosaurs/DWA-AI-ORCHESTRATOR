import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname);
const sources = [
  ["BAOHUY_Dinosaur_War_Arena_Enhanced.html", "DWA_AI_Preview_Enhanced.html"],
  ["BAOHUY_Dinosaur_War_Arena_VFX_Shader_Audio.html", "DWA_AI_Preview_VFX_Shader_Audio.html"]
];

const bridge = `
  // DWA AI policy bridge. Policies are local data; no network call occurs in the frame loop.
  window.DWA_AI = Object.freeze({
    setPolicy(dinoId, policy, workerId = "manual-policy") {
      if (dinoId === undefined || dinoId === null || !policy || typeof policy !== "object") {
        throw new TypeError("dinoId and policy object are required.");
      }
      const allowedPolicyFields = new Set(["targetMode", "tactic", "retreatBelowHpRatio", "skillPriority"]);
      const unknownPolicyFields = Object.keys(policy).filter((key) => !allowedPolicyFields.has(key));
      if (unknownPolicyFields.length) throw new Error("Unknown policy fields: " + unknownPolicyFields.join(", "));
      if (typeof workerId !== "string" || !workerId.trim()) throw new Error("workerId is required.");
      const targetMode = policy.targetMode ?? "nearest";
      const tactic = policy.tactic ?? "balanced";
      const retreatBelowHpRatio = policy.retreatBelowHpRatio ?? 0.3;
      const skillPriority = policy.skillPriority ?? [];
      if (!["nearest", "weakest", "strongest"].includes(targetMode)) throw new Error("Invalid targetMode.");
      if (!["balanced", "aggressive", "evasive"].includes(tactic)) throw new Error("Invalid tactic.");
      if (!Number.isFinite(retreatBelowHpRatio) || retreatBelowHpRatio < 0.1 || retreatBelowHpRatio > 0.8) {
        throw new RangeError("retreatBelowHpRatio must be between 0.1 and 0.8.");
      }
      if (!Array.isArray(skillPriority) || !skillPriority.every((item) => typeof item === "string" && item.trim())) {
        throw new TypeError("skillPriority must contain non-empty skill IDs.");
      }
      if (new Set(skillPriority).size !== skillPriority.length) throw new Error("Duplicate skill IDs are not allowed.");
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
      if (!bundle || bundle.schemaVersion !== 1 || !Array.isArray(bundle.policies)) {
        throw new TypeError("Policy bundle must use schemaVersion 1 and contain a policies array.");
      }
      const seen = new Set();
      for (const entry of bundle.policies) {
        if (!entry || entry.dinoId === undefined || seen.has(String(entry.dinoId))) {
          throw new Error("Policy bundle contains a missing or duplicate dinoId.");
        }
        if (typeof entry.workerId !== "string" || !entry.workerId.trim()) {
          throw new Error("Every policy entry must include workerId provenance.");
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

  const dwaPolicyPanel = document.createElement("div");
  dwaPolicyPanel.setAttribute("aria-label", "DWA AI policy controls");
  dwaPolicyPanel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99999;display:flex;flex-wrap:wrap;gap:6px;align-items:center;max-width:calc(100vw - 24px);padding:8px;background:rgba(8,15,28,.94);border:1px solid rgba(125,211,252,.55);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.4);";
  const dwaLoadPolicyButton = document.createElement("button");
  dwaLoadPolicyButton.type = "button";
  dwaLoadPolicyButton.textContent = "🧠 Nạp AI policy";
  dwaLoadPolicyButton.style.cssText = "padding:9px 12px;border:0;border-radius:8px;background:#0ea5e9;color:white;font-weight:700;font-size:13px;";
  const dwaClearPolicyButton = document.createElement("button");
  dwaClearPolicyButton.type = "button";
  dwaClearPolicyButton.textContent = "Xóa policy";
  dwaClearPolicyButton.style.cssText = "padding:9px 12px;border:1px solid #64748b;border-radius:8px;background:#1e293b;color:white;font-size:13px;";
  const dwaPolicyFileInput = document.createElement("input");
  dwaPolicyFileInput.type = "file";
  dwaPolicyFileInput.accept = ".json,application/json";
  dwaPolicyFileInput.style.display = "none";
  const dwaPolicyStatus = document.createElement("span");
  dwaPolicyStatus.setAttribute("role", "status");
  dwaPolicyStatus.style.cssText = "flex-basis:100%;color:#bae6fd;font:12px/1.35 system-ui,sans-serif;";
  dwaPolicyStatus.textContent = "Chưa nạp policy — game vẫn dùng AI mặc định.";
  dwaLoadPolicyButton.addEventListener("click", () => dwaPolicyFileInput.click());
  dwaClearPolicyButton.addEventListener("click", () => {
    const removed = window.DWA_AI.clearPolicies();
    dwaPolicyStatus.textContent = "Đã xóa " + removed + " policy; game trở về chiến thuật mặc định.";
  });
  dwaPolicyFileInput.addEventListener("change", async () => {
    const file = dwaPolicyFileInput.files && dwaPolicyFileInput.files[0];
    if (!file) return;
    try {
      const bundle = JSON.parse(await file.text());
      const result = window.DWA_AI.loadPolicyBundle(bundle);
      dwaPolicyStatus.textContent = "Đã nạp " + result.loaded + " policy từ " + file.name + ". Nhấn Bắt đầu để thử.";
    } catch (error) {
      dwaPolicyStatus.textContent = "Không nạp được policy: " + error.message;
    }
  });
  dwaPolicyPanel.append(dwaLoadPolicyButton, dwaClearPolicyButton, dwaPolicyFileInput, dwaPolicyStatus);
  document.body.appendChild(dwaPolicyPanel);
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
  if (closeIndex < 0) throw new Error("Could not identify the game IIFE closing point.");

  let output = html.replace(
    stepMarker,
    `  const DWA_AI_POLICIES = new Map();\n\n${stepMarker}`
  );

  const stepEndMarker = "  function checkMatchEnded() {";
  const stepStart = output.indexOf(stepMarker);
  const stepEnd = output.indexOf(stepEndMarker, stepStart);
  if (stepEnd < 0) throw new Error("Could not locate end of stepCombat.");

  let stepSection = output.slice(stepStart, stepEnd);
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
  if (!stepSection.includes(nearestBlock)) throw new Error("Combat target-selection block was not found.");
  stepSection = stepSection.replace(nearestBlock, policyTargetBlock);

  const distanceMarker = "      const dist = Math.max(1, Math.hypot(dx, dy));";
  if (!stepSection.includes(distanceMarker)) throw new Error("Combat distance calculation was not found.");
  stepSection = stepSection.replace(
    distanceMarker,
    distanceMarker + `
      const retreating = aiPolicy?.tactic === "evasive" &&
        d.hp / Math.max(1, d.maxHp) <= aiPolicy.retreatBelowHpRatio;`
  );

  if (!/const spd = [^;]+;/.test(stepSection)) throw new Error("Combat speed calculation was not found.");
  stepSection = stepSection.replace(
    /const spd = ([^;]+);/,
    `const spd = ($1) * (aiPolicy?.tactic === "aggressive" ? 1.15 : 1);`
  );
  const movementMarker = "      if (dist > 38) {";
  if (!stepSection.includes(movementMarker)) throw new Error("Combat movement block was not found.");
  stepSection = stepSection.replace(
    movementMarker,
    `      if (retreating) {
        d.vx = -(dx / dist) * spd;
        d.vy = -(dy / dist) * spd;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      } else if (dist > 38) {`
  );

  const skillCall = "      triggerDinoSkill(d, enemies);";
  if (!stepSection.includes(skillCall)) throw new Error("Combat skill invocation was not found.");
  stepSection = stepSection.replace(
    skillCall,
    `      const preferredSkill = aiPolicy?.skillPriority.find((skillId) => d.movePool.includes(skillId));\n      triggerDinoSkill(d, enemies, preferredSkill);`
  );
  output = output.slice(0, stepStart) + stepSection + output.slice(stepEnd);

  const skillStart = output.indexOf(skillMarker);
  const skillEnd = output.indexOf(stepMarker, skillStart);
  if (skillEnd < 0) throw new Error("Could not locate triggerDinoSkill body.");
  let skillSection = output.slice(skillStart, skillEnd);
  skillSection = skillSection.replace(
    skillMarker,
    "  function triggerDinoSkill(caster, livingEnemies, preferredSkillId = null) {"
  );
  const randomSkill = "    const moveId = pick(caster.movePool);";
  if (!skillSection.includes(randomSkill)) throw new Error("Random skill selection was not found.");
  skillSection = skillSection.replace(
    randomSkill,
    "    const moveId = preferredSkillId && caster.movePool.includes(preferredSkillId) ? preferredSkillId : pick(caster.movePool);"
  );
  output = output.slice(0, skillStart) + skillSection + output.slice(skillEnd);
  const end = output.lastIndexOf(closeMarker);
  output = output.slice(0, end) + bridge + "\n  " + output.slice(end);
  const inlineStart = output.indexOf("<script>");
  const inlineEnd = output.indexOf("</script>", inlineStart);
  const inlineScript = inlineStart >= 0 && inlineEnd > inlineStart ? output.slice(inlineStart + 8, inlineEnd) : null;
  if (!inlineScript) throw new Error("Integrated preview inline script was not found.");
  new Script(inlineScript, { filename: "dwa-ai-preview.js" });
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
