const TARGET_MODES = new Set(["nearest", "weakest", "strongest"]);
const TACTICS = new Set(["balanced", "aggressive", "evasive"]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateCombatPolicy(input) {
  if (!isRecord(input)) throw new TypeError("policy must be an object.");
  const allowed = new Set(["targetMode", "tactic", "retreatBelowHpRatio", "skillPriority"]);
  const unknown = Object.keys(input).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`Unknown policy fields: ${unknown.join(", ")}`);

  const targetMode = input.targetMode ?? "nearest";
  const tactic = input.tactic ?? "balanced";
  const retreatBelowHpRatio = input.retreatBelowHpRatio ?? 0.3;
  const skillPriority = input.skillPriority ?? [];

  if (!TARGET_MODES.has(targetMode)) throw new Error("targetMode must be nearest, weakest, or strongest.");
  if (!TACTICS.has(tactic)) throw new Error("tactic must be balanced, aggressive, or evasive.");
  if (!Number.isFinite(retreatBelowHpRatio) || retreatBelowHpRatio < 0.1 || retreatBelowHpRatio > 0.8) {
    throw new RangeError("retreatBelowHpRatio must be between 0.1 and 0.8.");
  }
  if (!Array.isArray(skillPriority) || !skillPriority.every((id) => typeof id === "string" && id.trim())) {
    throw new TypeError("skillPriority must contain non-empty skill ID strings.");
  }
  if (new Set(skillPriority).size !== skillPriority.length) {
    throw new Error("skillPriority cannot contain duplicate skill IDs.");
  }

  return Object.freeze({
    targetMode,
    tactic,
    retreatBelowHpRatio,
    skillPriority: Object.freeze([...skillPriority])
  });
}

export function validatePolicyBundle(input) {
  if (!isRecord(input)) throw new TypeError("policy bundle must be an object.");
  if (input.schemaVersion !== 1) throw new Error("policy bundle schemaVersion must be 1.");
  if (!Array.isArray(input.policies) || input.policies.length === 0) {
    throw new Error("policy bundle must contain at least one policy.");
  }

  const seen = new Set();
  const policies = input.policies.map((entry, index) => {
    if (!isRecord(entry)) throw new TypeError(`policies[${index}] must be an object.`);
    if (!(typeof entry.dinoId === "string" && entry.dinoId.trim()) &&
        !(typeof entry.dinoId === "number" && Number.isFinite(entry.dinoId))) {
      throw new Error(`policies[${index}].dinoId must be a non-empty string or finite number.`);
    }
    const dinoId = String(entry.dinoId);
    if (seen.has(dinoId)) throw new Error(`Duplicate dinoId: ${dinoId}`);
    seen.add(dinoId);
    if (typeof entry.workerId !== "string" || !entry.workerId.trim()) {
      throw new Error(`policies[${index}].workerId is required.`);
    }
    return Object.freeze({
      dinoId: entry.dinoId,
      workerId: entry.workerId,
      policy: validateCombatPolicy(entry.policy)
    });
  });

  return Object.freeze({ schemaVersion: 1, policies: Object.freeze(policies) });
}

export function serializePolicyBundle(input) {
  return JSON.stringify(validatePolicyBundle(input), null, 2) + "\n";
}
