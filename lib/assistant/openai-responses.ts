import { OPERATIONS_COPILOT_JSON_SCHEMA } from "@/lib/assistant/json-schema";
import { OPERATIONS_COPILOT_SYSTEM } from "@/lib/assistant/system-prompt";
import { parseAssistantStructuredResponse } from "@/lib/assistant/parse-response";
import type { AssistantStructuredResponse } from "@/lib/assistant/types";

type InputMessage = { role: "system" | "user" | "assistant"; content: string };

function extractOutputText(data: Record<string, unknown>): string | null {
  if (typeof data.output_text === "string" && data.output_text.length > 0) {
    return data.output_text;
  }
  const output = data.output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (typeof item !== "object" || item === null) continue;
    const t = (item as { type?: string }).type;
    if (t !== "message") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (typeof part !== "object" || part === null) continue;
      const p = part as { type?: string; text?: string };
      if (p.type === "output_text" && typeof p.text === "string") {
        return p.text;
      }
    }
  }
  return null;
}

export async function callOperationsCopilot(
  messages: { role: "user" | "assistant"; content: string }[],
  apiKey: string
): Promise<AssistantStructuredResponse> {
  const input: InputMessage[] = [
    { role: "system", content: OPERATIONS_COPILOT_SYSTEM },
    ...messages,
  ];

  const body = {
    model: process.env.OPENAI_OPERATIONS_MODEL ?? "gpt-4o-mini",
    input,
    text: {
      format: {
        type: "json_schema",
        name: OPERATIONS_COPILOT_JSON_SCHEMA.name,
        strict: OPERATIONS_COPILOT_JSON_SCHEMA.strict,
        schema: OPERATIONS_COPILOT_JSON_SCHEMA.schema,
      },
    },
    temperature: 0.35,
    max_output_tokens: 1200,
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI returned non-JSON (${res.status})`);
  }

  if (!res.ok) {
    const err = json as { error?: { message?: string } };
    const msg = err?.error?.message ?? raw.slice(0, 200);
    throw new Error(`OpenAI error ${res.status}: ${msg}`);
  }

  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid OpenAI response shape");
  }

  const data = json as Record<string, unknown>;
  const status = data.status;
  if (status === "failed" || status === "cancelled") {
    throw new Error(`OpenAI response status: ${String(status)}`);
  }

  const text = extractOutputText(data);
  if (!text) {
    throw new Error("No output text in OpenAI response");
  }

  const parsed = parseAssistantStructuredResponse(text);
  if (!parsed) {
    throw new Error("Model output failed schema validation");
  }
  return parsed;
}
