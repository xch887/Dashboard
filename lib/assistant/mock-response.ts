import type { AssistantStructuredResponse } from "@/lib/assistant/types";

export function buildMockAssistantResponse(
  userMessage: string
): AssistantStructuredResponse {
  const q = userMessage.trim();
  const preview =
    q.length > 100 ? `${q.slice(0, 100).trim()}…` : q || "your message";

  return {
    explanation: `This is demo mode (no OPENAI_API_KEY on the server). You asked about: "${preview}". With a key set, answers use the same layout but come from the live model and the demo facts in the system prompt.`,
    likely_reasons: [
      "Demo responses are fixed so you can test the UI without calling OpenAI.",
      "Numbers and device IDs in answers should match the Regency Medical demo data.",
    ],
    reasoning_label: "Demo / offline",
    confidence: "low",
    suggested_actions: [
      {
        id: "demo_fleet",
        label: "Open Fleet",
        workflow: "apply_filters",
        description: "Review device list and connectivity for the site.",
      },
      {
        id: "demo_analytics",
        label: "Open Analytics",
        workflow: "open_analytics",
        description: "See trends for uptime, PMs, and backlog.",
      },
      {
        id: "demo_report",
        label: "Generate summary",
        workflow: "generate_report",
        description: "Queue an executive-style report (placeholder in this build).",
      },
    ],
    follow_up_questions: [
      "Do you care most about patient-facing devices or the whole fleet?",
      "Should we focus on this week or the full month?",
    ],
  };
}
