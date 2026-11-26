/**
 * Extracts user-facing text from Gemini Interactions API responses.
 * Supports the documented Interaction.steps model_output shape and
 * compatibility shapes returned by earlier API adapters.
 */
export function extractGeminiText(payload) {
  const textFromParts = (parts) => {
    if (!Array.isArray(parts)) return "";
    return parts.map((part) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    }).filter(Boolean).join("\n");
  };

  const interactionSteps = Array.isArray(payload?.steps)
    ? payload.steps
        .filter((step) => step?.type === "model_output")
        .map((step) => textFromParts(step.content))
        .filter(Boolean)
        .join("\n")
    : "";

  const responseOutputText = Array.isArray(payload?.output)
    ? payload.output
        .filter((item) => item?.type === "message")
        .map((item) => textFromParts(item.content))
        .filter(Boolean)
        .join("\n")
    : "";

  const choice = payload?.choices?.[0];
  const message = choice?.message;
  const choiceContent = typeof message?.content === "string"
    ? message.content
    : textFromParts(message?.content);

  const candidates = [
    interactionSteps,
    typeof payload?.output_text === "string" ? payload.output_text : "",
    responseOutputText,
    choiceContent,
    typeof message?.refusal === "string" ? message.refusal : "",
    typeof payload?.raw === "string" && !/^\\s*</.test(payload.raw) ? payload.raw : ""
  ];

  return candidates.find((value) => value.trim())?.trim() ?? "";
}
