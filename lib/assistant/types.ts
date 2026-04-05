/** Workflows the UI can map to routes, modals, or server jobs. */
export const WORKFLOW_IDS = [
  "generate_report",
  "notify_team",
  "assign_issue",
  "apply_filters",
  "open_analytics",
] as const;

export type WorkflowId = (typeof WORKFLOW_IDS)[number];

export type SuggestedAction = {
  id: string;
  label: string;
  workflow: WorkflowId;
  description: string;
};

/** Structured output from Operations Copilot (matches JSON schema + UI sections). */
export type AssistantStructuredResponse = {
  /** HEADLINE: one decisive recommendation (what to do now). */
  headline: string;
  /** SITUATION: 2–3 sentences of context only. */
  situation: string;
  /** KEY FACTORS: 2–3 bullets; each ties a metric to a “so what.” */
  key_factors: string[];
  /** One line: what you prioritized first (safety, throughput, compliance, cost) and why. */
  reasoning_label: string;
  confidence: "high" | "medium" | "low";
  /** SUGGESTED ACTIONS: decisions with who / what / when; use Escalate, Page, Reassign, etc. */
  suggested_actions: SuggestedAction[];
  /** FOLLOW-UPS: sharper tradeoff questions, not “want more detail?” */
  follow_up_questions: string[];
};

export type ApiAssistantRequestBody = {
  messages: { role: "user" | "assistant"; content: string }[];
};

export type ApiAssistantSuccess = {
  ok: true;
  structured: AssistantStructuredResponse;
  /** Present when OPENAI_API_KEY is missing — same contract, demo payload. */
  demo?: boolean;
};

export type ApiAssistantError = {
  ok: false;
  error: string;
  code?: string;
};

export type ApiAssistantResponse = ApiAssistantSuccess | ApiAssistantError;

export function isWorkflowId(s: string): s is WorkflowId {
  return (WORKFLOW_IDS as readonly string[]).includes(s);
}
