import { NextResponse } from "next/server";
import { buildMockAssistantResponse } from "@/lib/assistant/mock-response";
import { callOperationsCopilot } from "@/lib/assistant/openai-responses";
import type {
  ApiAssistantResponse,
  ApiAssistantRequestBody,
} from "@/lib/assistant/types";

export async function POST(
  req: Request
): Promise<NextResponse<ApiAssistantResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const parsed = body as ApiAssistantRequestBody;
  if (!Array.isArray(parsed.messages)) {
    return NextResponse.json(
      { ok: false, error: "Field `messages` must be an array", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const messages = parsed.messages.filter(
    (m): m is { role: "user" | "assistant"; content: string } =>
      !!m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
  );

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "A non-empty user message is required",
        code: "BAD_REQUEST",
      },
      { status: 400 }
    );
  }

  const key = process.env.OPENAI_API_KEY;

  try {
    if (!key?.trim()) {
      const structured = buildMockAssistantResponse(lastUser.content);
      return NextResponse.json({
        ok: true,
        structured,
        demo: true,
      });
    }

    const structured = await callOperationsCopilot(messages, key.trim());
    return NextResponse.json({ ok: true, structured });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Assistant request failed";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        code: "ASSISTANT_UPSTREAM",
      },
      { status: 502 }
    );
  }
}
