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
      explanation: {
        type: "string",
        description:
          "Concise summary of what is happening operationally (2–4 sentences, enterprise tone).",
      },
      likely_reasons: {
        type: "array",
        description: "Contributing factors or likely root causes as short bullets.",
        items: { type: "string" },
      },
      reasoning_label: {
        type: "string",
        description:
          "Single line, e.g. Based on fleet telemetry, PM backlog, and open alerts (demo context).",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Confidence in the analysis (not clinical certainty).",
      },
      suggested_actions: {
        type: "array",
        description: "Concrete next steps the product could execute.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: {
              type: "string",
              description: "Stable id slug, e.g. act_open_pm_radiology",
            },
            label: { type: "string", description: "Short button label" },
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
              description: "One line — what this action will do in the product.",
            },
          },
          required: ["id", "label", "workflow", "description"],
        },
      },
      follow_up_questions: {
        type: "array",
        description: "2–4 short questions the user might ask next.",
        items: { type: "string" },
      },
    },
    required: [
      "explanation",
      "likely_reasons",
      "reasoning_label",
      "confidence",
      "suggested_actions",
      "follow_up_questions",
    ],
  },
} as const;
