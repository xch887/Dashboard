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

export type AssistantStructuredResponse = {
  explanation: string;
  likely_reasons: string[];
  reasoning_label: string;
  confidence: "high" | "medium" | "low";
  suggested_actions: SuggestedAction[];
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
