export type AIResponseFeedbackSource =
  | "assistant-response"
  | "insight-hover"
  | "composer-prompt"
  | "decision-flow"
  | "workflow-setup";

export type AIResponseFeedbackData = {
  responseId: string;
  helpful: boolean;
  reason?: string;
  timestamp: string;
  source?: AIResponseFeedbackSource;
};

const STORAGE_KEY = "med-dash:ai-response-feedback";

type FeedbackStore = Record<string, AIResponseFeedbackData>;

function readStore(): FeedbackStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as FeedbackStore;
  } catch {
    return {};
  }
}

function writeStore(store: FeedbackStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function loadAIResponseFeedback(
  responseId: string
): AIResponseFeedbackData | null {
  return readStore()[responseId] ?? null;
}

export function saveAIResponseFeedback(
  feedback: AIResponseFeedbackData
): void {
  const store = readStore();
  store[feedback.responseId] = feedback;
  writeStore(store);
}

/** Log feedback locally; swap body for fetch() when an API endpoint exists. */
export function trackAIResponseFeedback(
  feedback: AIResponseFeedbackData
): void {
  console.log("[ai-response-feedback]", feedback);

  // Future API hook-up:
  // void fetch("/api/assistant/feedback", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(feedback),
  // });
}
