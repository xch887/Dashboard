/**
 * JSON Schema for OpenAI Responses API structured outputs (strict).
 * @see https://platform.openai.com/docs/guides/structured-outputs
 */
export const OPERATIONS_COPILOT_JSON_SCHEMA = {
  name: "operations_copilot",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      headline: {
        type: "string",
        description:
          "HEADLINE: One decisive line — what they should do now. Not a data summary (e.g. prioritize DEV-1004 CT offline before end of shift because it blocks the imaging slate).",
      },
      situation: {
        type: "string",
        description:
          "SITUATION: 2–3 sentences. Only context needed to understand the headline. No filler, no restating the user question.",
      },
      key_factors: {
        type: "array",
        description:
          "KEY FACTORS: 2–3 short strings. Each must pair evidence with “so what” (metric + implication). Not a data dump.",
        items: { type: "string" },
      },
      reasoning_label: {
        type: "string",
        description:
          "One line naming what you prioritized first using the framework: patient safety → revenue/throughput → compliance → cost.",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description:
          "high = clear call; medium = recommendation with tradeoff; low = two real options to weigh (not clinical certainty).",
      },
      suggested_actions: {
        type: "array",
        description:
          "2–4 decisions framed as actions: Escalate, Page, Reassign, Approve, Defer. Each description must imply who, what, and when.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: {
              type: "string",
              description: "Stable id slug, e.g. act_page_biomed_ct",
            },
            label: {
              type: "string",
              description: "Short imperative button label (e.g. Page ICU biomed)",
            },
            workflow: {
              type: "string",
              enum: [
                "generate_report",
                "notify_team",
                "assign_issue",
                "apply_filters",
                "open_analytics",
              ],
            },
            description: {
              type: "string",
              description:
                "One line: what happens in-product; include timing if relevant (before shift change, by Monday, etc.).",
            },
          },
          required: ["id", "label", "workflow", "description"],
        },
      },
      follow_up_questions: {
        type: "array",
        description:
          "2–3 sharp follow-ups that force a decision (e.g. escalate to vendor now vs give biomed 2 more hours). Not generic detail requests.",
        items: { type: "string" },
      },
    },
    required: [
      "headline",
      "situation",
      "key_factors",
      "reasoning_label",
      "confidence",
      "suggested_actions",
      "follow_up_questions",
    ],
  },
} as const;
