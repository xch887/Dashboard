import type { AssistantStructuredResponse } from "@/lib/assistant/types";

export function buildMockAssistantResponse(
  userMessage: string
): AssistantStructuredResponse {
  const snippet =
    userMessage.trim().slice(0, 120) + (userMessage.length > 120 ? "…" : "");

  return {
    explanation: `No live model is configured (missing OPENAI_API_KEY). This is a structured preview for: “${snippet || "your question"}”. In production, the server calls the OpenAI Responses API with your thread and returns the same JSON shape for the UI.`,
    likely_reasons: [
      "API key not set on the server — responses are deterministic placeholders.",
      "Operational data would be merged from CMMS, telemetry, and ticketing in a full integration.",
    ],
    reasoning_label: "Offline / demo copilot",
    confidence: "low",
    suggested_actions: [
      {
        id: "demo_report",
        label: "Generate executive summary",
        workflow: "generate_report",
        description:
          "Queue a PDF/email report: open alerts, PM overdue, offline capital.",
      },
      {
        id: "demo_notify",
        label: "Notify on-call biomed",
        workflow: "notify_team",
        description: "Send a prioritized digest to the Clinical Engineering channel.",
      },
      {
        id: "demo_filters",
        label: "Apply dashboard filters",
        workflow: "apply_filters",
        description: "Open Dashboard with action-required and overdue PM filters.",
      },
      {
        id: "demo_analytics",
        label: "Open analytics",
        workflow: "open_analytics",
        description: "Jump to Analytics for SLA and fleet health trends.",
      },
    ],
    follow_up_questions: [
      "Which site or hospital should we scope this to?",
      "Do you want patient-facing devices only?",
      "Should we include vendor-managed assets?",
      "What time window matters for compliance — this week or this month?",
    ],
  };
}
