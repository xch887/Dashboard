"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Mic, Paperclip, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  "Are there any delays today?",
  "How are devices performing?",
  "Summarize open alerts for the ICU.",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Soft teal wash only behind the centered card — no rotating blobs, no page-wide blur. */
function AssistantCardBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/35 via-white/80 to-sky-100/25" />
      <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-12 h-36 w-36 rounded-full bg-sky-300/15 blur-3xl" />
    </div>
  );
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "assistant",
        content:
          "I found 3 devices with critical battery levels:\n\n• **DEV-1004** — TempGuard Mini in ER Bay 3 (12% battery, last sync 45 min ago)\n• **DEV-1003** — OxygenSense Elite in ICU Room 208 (34% battery)\n• **DEV-1006** — NeuroLink Patch in Storage (0% battery, inactive)\n\nI'd recommend prioritizing DEV-1004 first since it's actively monitoring a patient in the ER.",
      },
    ]);
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex min-h-0 min-w-0 w-full max-w-3xl flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center px-2 py-6 sm:px-4 md:px-5">
          <div className="relative mx-auto w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_50px_-24px_rgb(37_99_235/0.2)] ring-1 ring-slate-200/80">
              <AssistantCardBackdrop />
              <div className="relative z-10 rounded-3xl border border-slate-200/90 bg-white/95">
                <div className="flex flex-col px-5 pb-8 pt-10 sm:px-8 sm:pt-12">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/25">
                      <Sparkles className="h-6 w-6" aria-hidden />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[1.65rem]">
                      AI Operations Intelligence
                    </h1>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
                      Ask about device performance, patient flow, or operational
                      risks.
                    </p>
                  </div>

                  <div className="w-full">
                    <div
                      className={cn(
                        "flex w-full items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90",
                        "px-2 py-1.5 pl-3 shadow-inner shadow-slate-900/[0.03] ring-1 ring-white"
                      )}
                    >
                      <Search
                        className="h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask me anything..."
                        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Voice input"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white shadow-md shadow-blue-900/25 hover:bg-blue-500 disabled:opacity-40"
                        aria-label="Send"
                      >
                        <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSuggestion(s)}
                          className="rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-900"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-3 pt-4">
                    <p className="text-center text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-left">
                      Suggested views
                    </p>
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-20 rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 ring-1 ring-slate-100 sm:h-24"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col self-center px-2 py-4 sm:px-4 md:px-5">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI Operations Intelligence
              </p>
              <p className="text-[11px] text-slate-500">Conversation</p>
            </div>
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[min(85%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm",
                        msg.role === "user"
                          ? "border border-blue-600 bg-white text-slate-900"
                          : "border border-slate-100 bg-slate-50 text-slate-800"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-4 w-full shrink-0">
            <div
              className={cn(
                "flex w-full items-center gap-2 rounded-full border border-slate-200/90 bg-white px-2 py-1.5 pl-3 shadow-md shadow-slate-900/[0.04]"
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a follow-up..."
                className="min-w-0 flex-1 bg-transparent py-2 text-sm focus:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
              >
                <Paperclip className="h-4 w-4 text-slate-400" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full"
              >
                <Mic className="h-4 w-4 text-slate-400" />
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
