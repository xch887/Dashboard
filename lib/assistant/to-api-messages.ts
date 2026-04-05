import type { AssistantStructuredResponse } from "@/lib/assistant/types";

/** Thread shape for POST /api/assistant (ids optional; stripped before send). */
export type IntelligenceThreadMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; structured: AssistantStructuredResponse };

export function structuredToConversationContent(
  s: AssistantStructuredResponse
): string {
  return [
    s.explanation,
    "",
    "Contributing factors:",
    ...s.likely_reasons.map((r) => `• ${r}`),
    "",
    `Reasoning label: ${s.reasoning_label}`,
    `Confidence: ${s.confidence}`,
  ].join("\n");
}

export function intelligenceThreadToApiMessages(
  messages: IntelligenceThreadMessage[]
): { role: "user" | "assistant"; content: string }[] {
  return messages.map((m) =>
    m.role === "user"
      ? { role: "user", content: m.text }
      : {
          role: "assistant",
          content: structuredToConversationContent(m.structured),
        }
  );
}

/** Compact text for small UIs (e.g. FAB). */
export function formatIntelligenceFabSummary(
  s: AssistantStructuredResponse
): string {
  const slice = s.likely_reasons.slice(0, 3);
  const tail =
    slice.length > 0
      ? `\n\n${slice.map((r) => `• ${r}`).join("\n")}${
          s.likely_reasons.length > 3 ? "\n• …" : ""
        }`
      : "";
  return `${s.explanation}${tail}`;
}
