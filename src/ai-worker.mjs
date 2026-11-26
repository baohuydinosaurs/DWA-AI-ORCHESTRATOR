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
const timeout = setTimeout(() => controller.abort(), 240_000);
const retryableStatuses = new Set([429, 500, 502, 503, 504]);

try {
  let response;
  let raw = "";
  let payload;
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = await fetch(endpoint, {
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
        ].join("\\n")
      }),
      signal: controller.signal
    });

    raw = await response.text();
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { raw };
    }

    if (response.ok || !retryableStatuses.has(response.status) || attempt === maxAttempts) break;

    const retryAfter = Number(response.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 60_000)
      : Math.min(5_000 * (2 ** (attempt - 1)), 60_000);
    console.warn(`Temporary Gemini API HTTP ${response.status}; retry ${attempt}/${maxAttempts} in ${Math.ceil(delayMs / 1000)}s.`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || raw.slice(0, 1200);
    throw new Error(`Gemini API request failed after ${maxAttempts} attempt(s) (HTTP ${response.status}): ${detail}`);
  }

  const message = payload?.choices?.[0]?.message;
  const contentParts = Array.isArray(message?.content)
    ? message.content.map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      }).filter(Boolean).join("\\n")
    : "";
  const responseOutputText = Array.isArray(payload?.output)
    ? payload.output
        .filter((item) => item?.type === "message")
        .flatMap((item) => Array.isArray(item.content) ? item.content : [])
        .filter((part) => part?.type === "output_text" || typeof part?.text === "string")
        .map((part) => part.text || "")
        .filter(Boolean)
        .join("\\n")
    : "";
  const streamText = Array.isArray(payload?.streamEvents)
    ? payload.streamEvents.map((event) => {
        const choice = event?.choices?.[0];
        const delta = choice?.delta;
        const content = delta?.content ?? choice?.message?.content ?? event?.text;
        if (typeof content === "string") return content;
        if (Array.isArray(content)) return content.map((part) => part?.text || "").join("");
        return "";
      }).join("")
    : "";
  const answerCandidates = [
    message?.content,
    contentParts,
    payload?.output_text,
    responseOutputText,
    streamText,
    message?.refusal,
    typeof payload?.raw === "string" && !/^\\s*</.test(payload.raw) ? payload.raw : null
  ];
  const answer = answerCandidates.find((value) => typeof value === "string" && value.trim());

  if (!answer) {
    const choice = payload?.choices?.[0];
    const details = {
      contentType,
      responseId: payload?.id ?? null,
      returnedModel: payload?.model ?? null,
      finishReason: choice?.finish_reason ?? null,
      messageKeys: message && typeof message === "object" ? Object.keys(message) : [],
      choiceCount: Array.isArray(payload?.choices) ? payload.choices.length : null,
      outputTypes: Array.isArray(payload?.output) ? payload.output.map((item) => item?.type).filter(Boolean) : [],
      streamEventCount: Array.isArray(payload?.streamEvents) ? payload.streamEvents.length : 0,
      rawPreview: typeof payload?.raw === "string" ? payload.raw.slice(0, 800) : null,
      usage: payload?.usage ?? null
    };
    console.error("Model response contained no extractable text:", JSON.stringify(details));
    throw new Error(
      `The model returned HTTP ${response.status} but no readable text. ` +
      `Content-Type=${contentType || "unknown"}; finish_reason=${details.finishReason ?? "n/a"}.`
    );
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
