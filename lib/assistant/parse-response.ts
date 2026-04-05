import {
  type AssistantStructuredResponse,
  isWorkflowId,
  type SuggestedAction,
} from "@/lib/assistant/types";

function isConfidence(
  s: string
): s is AssistantStructuredResponse["confidence"] {
  return s === "high" || s === "medium" || s === "low";
}

function parseSuggestedAction(raw: unknown): SuggestedAction | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return null;
  if (typeof o.workflow !== "string" || !isWorkflowId(o.workflow)) return null;
  if (typeof o.description !== "string") return null;
  return {
    id: o.id,
    label: o.label,
    workflow: o.workflow,
    description: o.description,
  };
}

export function parseAssistantStructuredResponse(
  jsonText: string
): AssistantStructuredResponse | null {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const o = data as Record<string, unknown>;

  if (typeof o.explanation !== "string") return null;
  if (typeof o.reasoning_label !== "string") return null;
  if (typeof o.confidence !== "string" || !isConfidence(o.confidence))
    return null;

  if (!Array.isArray(o.likely_reasons)) return null;
  const likely_reasons = o.likely_reasons.filter(
    (x): x is string => typeof x === "string"
  );
  if (likely_reasons.length !== o.likely_reasons.length) return null;

  if (!Array.isArray(o.suggested_actions)) return null;
  const suggested_actions: SuggestedAction[] = [];
  for (const item of o.suggested_actions) {
    const a = parseSuggestedAction(item);
    if (!a) return null;
    suggested_actions.push(a);
  }

  if (!Array.isArray(o.follow_up_questions)) return null;
  const follow_up_questions = o.follow_up_questions.filter(
    (x): x is string => typeof x === "string"
  );
  if (follow_up_questions.length !== o.follow_up_questions.length) return null;

  return {
    explanation: o.explanation,
    likely_reasons,
    reasoning_label: o.reasoning_label,
    confidence: o.confidence,
    suggested_actions,
    follow_up_questions,
  };
}
