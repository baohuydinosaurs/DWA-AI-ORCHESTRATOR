import { mkdir, writeFile } from "node:fs/promises";

const endpoint = "https://models.github.ai/inference/chat/completions";
const token = process.env.GITHUB_TOKEN;
const prompt = (process.env.DWA_TASK ?? "").trim();
const model = process.env.DWA_MODEL || "openai/gpt-4o";
const outputDir = process.env.DWA_OUTPUT_DIR || "artifacts";

if (!token) throw new Error("GITHUB_TOKEN is missing. Run this worker inside the configured GitHub Actions workflow.");
if (!prompt) throw new Error("DWA_TASK is empty. Supply a task using the workflow_dispatch form.");
if (prompt.length > 12000) throw new Error("DWA_TASK is too long (maximum 12,000 characters).");

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120_000);

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are one task-focused AI worker for the Dinosaur War Arena software project. Work only on the task supplied by the user. Do not claim to have edited files, run tests, or accessed systems unless the task and tools actually allow it. Return a clear, actionable result in Vietnamese."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2500
    }),
    signal: controller.signal
  });

  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); } catch { payload = { raw }; }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || raw.slice(0, 1200);
    throw new Error(`GitHub Models request failed (HTTP ${response.status}): ${detail}`);
  }

  const answer = payload?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("The model returned no text content. Check the selected model and response format.");
  }

  await mkdir(outputDir, { recursive: true });
  const result = {
    workerId: "qa-integration-001",
    provider: "GitHub Models",
    model,
    completedAt: new Date().toISOString(),
    task: prompt,
    answer: answer.trim(),
    usage: payload.usage ?? null
  };

  await writeFile(`${outputDir}/worker-result.json`, JSON.stringify(result, null, 2) + "\n");
  await writeFile(`${outputDir}/worker-result.md`,
    `# DWA AI Worker result\n\n- Worker: ${result.workerId}\n- Provider: ${result.provider}\n- Model: ${result.model}\n- Completed: ${result.completedAt}\n\n## Task\n\n${prompt}\n\n## AI response\n\n${answer.trim()}\n`
  );
  console.log("AI inference succeeded.");
  console.log(`Provider: ${result.provider}`);
  console.log(`Model: ${result.model}`);
  console.log(`Saved: ${outputDir}/worker-result.json and worker-result.md`);
} finally {
  clearTimeout(timeout);
}
