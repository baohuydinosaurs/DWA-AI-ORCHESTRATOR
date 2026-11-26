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

  // Providers may return plain text, content-part arrays, or a Responses-style output.
  const message = payload?.choices?.[0]?.message;
  const contentParts = Array.isArray(message?.content)
    ? message.content.map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      }).join("\n")
    : "";
  const responseOutputText = Array.isArray(payload?.output)
    ? payload.output
        .filter((item) => item?.type === "message")
        .flatMap((item) => Array.isArray(item.content) ? item.content : [])
        .filter((part) => part?.type === "output_text" || typeof part?.text === "string")
        .map((part) => part.text || "")
        .join("\n")
    : "";
  const answerCandidates = [
    message?.content,
    contentParts,
    payload?.output_text,
    responseOutputText,
    message?.refusal
  ];
  const answer = answerCandidates.find((value) => typeof value === "string" && value.trim());

  if (!answer) {
    const choice = payload?.choices?.[0];
    const details = {
      responseId: payload?.id ?? null,
      returnedModel: payload?.model ?? null,
      finishReason: choice?.finish_reason ?? null,
      messageKeys: message && typeof message === "object" ? Object.keys(message) : [],
      choiceCount: Array.isArray(payload?.choices) ? payload.choices.length : null,
      outputTypes: Array.isArray(payload?.output) ? payload.output.map((item) => item?.type).filter(Boolean) : [],
      usage: payload?.usage ?? null
    };
    console.error("Model response contained no extractable text:", JSON.stringify(details));
    throw new Error(
      `The model returned HTTP ${response.status} but no readable text. ` +
      `Inspect the response metadata above; finish_reason=${details.finishReason ?? "n/a"}.`
    );
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
