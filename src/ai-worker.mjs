import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
const apiKey = process.env.GEMINI_API_KEY;
const prompt = (process.env.DWA_TASK ?? "").trim();
const model = process.env.DWA_MODEL || "gemini-3.8-flash";
const outputDir = process.env.DWA_OUTPUT_DIR || "artifacts";

if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it as a repository Actions secret before running this worker.");
if (!prompt) throw new Error("DWA_TASK is empty. Supply a task using the workflow_dispatch form.");
if (prompt.length > 12000) throw new Error("DWA_TASK is too long (maximum 12,000 characters).");

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120_000);

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        "You are one task-focused AI worker for the Dinosaur War Arena software project.",
        "Work only on the task supplied by the user. Do not claim to have edited files, run tests, or accessed systems unless the task and tools actually allow it.",
        "Return a clear, actionable result in Vietnamese.",
        "",
        "USER TASK:",
        prompt
      ].join("\n")
    }),
    signal: controller.signal
  });

  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); } catch { payload = { raw }; }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || raw.slice(0, 1200);
    throw new Error(`Gemini API request failed (HTTP ${response.status}): ${detail}`);
  }

  const answer = Array.isArray(payload?.steps)
    ? payload.steps
        .filter((step) => step?.type === "model_output")
        .flatMap((step) => Array.isArray(step.content) ? step.content : [])
        .filter((part) => part?.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("\n")
    : "";

  if (!answer.trim()) {
    const details = {
      interactionId: payload?.id ?? null,
      status: payload?.status ?? null,
      returnedModel: payload?.model ?? null,
      stepTypes: Array.isArray(payload?.steps) ? payload.steps.map((step) => step?.type).filter(Boolean) : [],
      outputTypes: Array.isArray(payload?.steps)
        ? payload.steps.flatMap((step) => Array.isArray(step.content) ? step.content.map((part) => part?.type) : [])
        : [],
      error: payload?.error ?? null
    };
    console.error("Gemini returned no extractable model output:", JSON.stringify(details));
    throw new Error(`Gemini returned HTTP ${response.status} but no text output. Interaction status: ${details.status ?? "unknown"}.`);
  }

  await mkdir(outputDir, { recursive: true });
  const result = {
    workerId: "qa-integration-001",
    provider: "Google Gemini API",
    model: payload.model || model,
    interactionId: payload.id ?? null,
    completedAt: new Date().toISOString(),
    task: prompt,
    answer: answer.trim(),
    usage: payload.usage ?? null
  };

  await writeFile(`${outputDir}/worker-result.json`, JSON.stringify(result, null, 2) + "\n");
  await writeFile(`${outputDir}/worker-result.md`,
    `# DWA AI Worker result\n\n- Worker: ${result.workerId}\n- Provider: ${result.provider}\n- Model: ${result.model}\n- Interaction: ${result.interactionId ?? "n/a"}\n- Completed: ${result.completedAt}\n\n## Task\n\n${prompt}\n\n## AI response\n\n${answer.trim()}\n`
  );
  console.log("AI inference succeeded.");
  console.log(`Provider: ${result.provider}`);
  console.log(`Model: ${result.model}`);
  console.log(`Saved: ${outputDir}/worker-result.json and worker-result.md`);
} finally {
  clearTimeout(timeout);
}
