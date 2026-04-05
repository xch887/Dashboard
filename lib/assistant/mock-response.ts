import type { AssistantStructuredResponse } from "@/lib/assistant/types";

export function buildMockAssistantResponse(
  userMessage: string
): AssistantStructuredResponse {
  const q = userMessage.trim();
  const preview =
    q.length > 80 ? `${q.slice(0, 80).trim()}…` : q || "your question";

  return {
    headline:
      "Add OPENAI_API_KEY to .env.local and restart the dev server — then you get live decision-style answers instead of this fixed preview.",
    situation: `Demo mode is on, so the server never called the model. You asked about “${preview}”. The layout below matches what production returns: headline first, then context, factors, and actions.`,
    key_factors: [
      "No API key → every reply uses this same structured placeholder (so what: you can still test buttons and navigation).",
      "With a key, the copilot uses Regency Medical demo facts and the decision-driving rules in the system prompt.",
    ],
    reasoning_label:
      "Throughput of your evaluation first — unblock real answers before tuning copy.",
    confidence: "low",
    suggested_actions: [
      {
        id: "demo_open_fleet",
        label: "Open Fleet",
        workflow: "apply_filters",
        description:
          "Jump to the device list now to cross-check IDs while you wire the API key.",
      },
      {
        id: "demo_open_analytics",
        label: "Open Analytics",
        workflow: "open_analytics",
        description:
          "Review trends in the demo dataset before your next leadership readout this week.",
      },
      {
        id: "demo_summary",
        label: "Queue executive summary",
        workflow: "generate_report",
        description:
          "Placeholder report action — connect CMMS export when you go beyond demo.",
      },
    ],
    follow_up_questions: [
      "Do you want answers scoped to one department or the whole hospital this week?",
      "After the key works, should we tune tone for your COO or for bedside ops leads?",
    ],
  };
}
