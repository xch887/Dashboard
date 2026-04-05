"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AIResponseCard } from "@/components/assistant/ai-response-card";
import {
  ASSISTANT_PROMPT_OPTIONS,
  EmptyState,
} from "@/components/assistant/empty-state";
import { LoadingState } from "@/components/assistant/loading-state";
import type {
  ApiAssistantResponse,
  AssistantStructuredResponse,
  SuggestedAction,
} from "@/lib/assistant/types";
import { intelligenceThreadToApiMessages } from "@/lib/assistant/to-api-messages";
import { SHOW_DASHBOARD_IN_NAV } from "@/lib/nav-config";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowUp, Search } from "lucide-react";

/** Squircle clinical AI mark — update file in public/brand when replacing asset. */
const ASSISTANT_HERO_ICON = "/brand/medisync-assistant-icon.png";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      structured: AssistantStructuredResponse;
      demo?: boolean;
    };

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

const composerFocusRing =
  "transition-[box-shadow,filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] focus-within:shadow-[0_0_0_3px_rgb(59_130_246/0.14),0_20px_50px_-18px_rgb(37_99_235/0.35)]";

const emptyComposerGlow =
  "rounded-[999px] bg-gradient-to-r from-blue-500/45 via-indigo-500/35 to-sky-500/40 p-px shadow-[0_16px_56px_-20px_rgb(37_99_235/0.55)] transition-[box-shadow,filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] focus-within:shadow-[0_20px_64px_-16px_rgb(37_99_235/0.6),0_0_0_1px_rgb(255_255_255/0.6)_inset]";

export function ChatPanel() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<SuggestedAction | null>(
    null
  );
  const [pendingForMessageId, setPendingForMessageId] = useState<string | null>(
    null
  );
  const [outcome, setOutcome] = useState<string | null>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setOutcome(null);
      setPendingAction(null);
      setPendingForMessageId(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
      };
      const nextThread = [...messages, userMsg];
      setMessages(nextThread);
      setInput("");
      setLoading(true);
      scrollToEnd();

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: intelligenceThreadToApiMessages(
              nextThread.map((m) =>
                m.role === "user"
                  ? { role: "user", text: m.text }
                  : { role: "assistant", structured: m.structured }
              )
            ),
          }),
        });
        const json = (await res.json()) as ApiAssistantResponse;

        if (!json.ok) {
          setError(json.error ?? "Request failed");
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            structured: json.structured,
            demo: json.demo === true,
          },
        ]);
        scrollToEnd();
      } catch {
        setError("Network error — try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, scrollToEnd]
  );

  const executeWorkflow = useCallback(
    (action: SuggestedAction) => {
      setOutcome(null);
      switch (action.workflow) {
        case "apply_filters":
          router.push(
            SHOW_DASHBOARD_IN_NAV
              ? "/dashboard?filter=attention"
              : "/fleet"
          );
          setOutcome(
            SHOW_DASHBOARD_IN_NAV
              ? `Opened dashboard with filters: ${action.label}`
              : `Opened fleet (dashboard hidden): ${action.label}`
          );
          break;
        case "open_analytics":
          router.push("/analytics");
          setOutcome(`Opened analytics: ${action.label}`);
          break;
        case "generate_report":
          setOutcome(
            `Report queued (placeholder): ${action.label} — connect CMMS export in production.`
          );
          break;
        case "notify_team":
          setOutcome(
            `Notification draft prepared (placeholder): ${action.label}`
          );
          break;
        case "assign_issue":
          setOutcome(
            `Assignment workflow started (placeholder): ${action.label}`
          );
          break;
        default:
          setOutcome(`Action recorded: ${action.label}`);
      }
      setPendingAction(null);
      setPendingForMessageId(null);
    },
    [router]
  );

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <AnimatePresence>
        {outcome ? (
          <motion.div
            key="outcome"
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={motionTransition(reduceMotion, "fast")}
            className="mb-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs font-medium text-emerald-950 ring-1 ring-emerald-100"
          >
            {outcome}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {messages.length === 0 ? (
          <motion.div
            key="empty"
            className="flex w-full min-w-0 flex-1 flex-col overflow-visible"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={motionTransition(reduceMotion, "base")}
          >
          <div className="relative w-full min-w-0">
            <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_50px_-24px_rgb(37_99_235/0.2)] ring-1 ring-slate-200/80">
              <AssistantCardBackdrop />
              <div className="relative z-10 flex flex-col rounded-3xl border border-slate-200/90 bg-white/95">
                <div className="flex flex-col gap-5 px-4 pb-6 pt-6 sm:gap-6 sm:px-6 sm:pb-7 sm:pt-7 lg:px-8 lg:pb-8 lg:pt-8">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex justify-center sm:mb-4">
                      <Image
                        src={ASSISTANT_HERO_ICON}
                        alt="MediSync assistant"
                        width={96}
                        height={96}
                        priority
                        className="h-16 w-16 object-contain drop-shadow-md sm:h-20 sm:w-20"
                      />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[1.65rem]">
                      Operations intelligence
                    </h1>
                    <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                      Structured answers for fleet, maintenance, and
                      incidents — with executable next steps.
                    </p>
                  </div>

                  <div className="w-full min-w-0">
                    <div className={cn(emptyComposerGlow, composerFocusRing)}>
                      <div
                        className={cn(
                          "flex w-full items-center gap-2 rounded-full border border-slate-200/60 bg-white/95",
                          "px-2 py-2 pl-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-sm sm:py-2.5 sm:pl-4"
                        )}
                      >
                        <Search
                          className="h-4 w-4 shrink-0 text-blue-500/70"
                          aria-hidden
                        />
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void sendText(input);
                            }
                          }}
                          placeholder="Describe the operational question…"
                          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] leading-snug text-slate-900 placeholder:text-slate-400/90 focus:outline-none md:text-base"
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => void sendText(input)}
                          disabled={!input.trim() || loading}
                          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md shadow-blue-900/30 hover:from-blue-500 hover:to-blue-500 active:scale-[0.97] disabled:opacity-40 sm:h-11 sm:w-11"
                          aria-label="Send"
                        >
                          <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
                        </Button>
                      </div>
                    </div>

                    <div
                      className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5"
                      role="group"
                      aria-label="Quick suggestions"
                    >
                      {ASSISTANT_PROMPT_OPTIONS.map(({ chip, prompt }) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendText(prompt)}
                          className={cn(
                            "motion-interactive rounded-full border border-slate-200/90 bg-slate-50/90 px-3.5 py-2 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-100/80 sm:text-xs",
                            "hover:border-blue-200/90 hover:bg-blue-50/70 hover:text-slate-800 hover:ring-blue-100/60",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                          )}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full">
                    <EmptyState
                      onSelectSuggestion={(s) => void sendText(s)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
      ) : (
        <motion.div
          key="thread"
          className="flex min-h-0 w-full flex-1 flex-col px-1 py-4 sm:px-2 md:px-4"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
          transition={motionTransition(reduceMotion, "base")}
        >
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 md:hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <Image
                src={ASSISTANT_HERO_ICON}
                alt="MediSync assistant"
                width={36}
                height={36}
                className="h-9 w-9 object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Operations intelligence
              </p>
              <p className="text-[11px] text-slate-500">Structured thread</p>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div
                ref={listRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6"
              >
                {error ? (
                  <motion.p
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                    role="alert"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={motionTransition(reduceMotion, "fast")}
                  >
                    {error}
                  </motion.p>
                ) : null}

                {messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <motion.div
                        key={m.id}
                        className="flex justify-end"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={motionTransition(reduceMotion, "fast")}
                      >
                        <div className="max-w-[min(85%,42rem)] rounded-2xl border border-blue-600 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 shadow-sm">
                          {m.text}
                        </div>
                      </motion.div>
                    );
                  }

                  const showPending =
                    pendingForMessageId === m.id ? pendingAction : null;

                  return (
                    <motion.div
                      key={m.id}
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={motionTransition(reduceMotion, "fast")}
                    >
                      <div className="w-full max-w-[min(100%,44rem)]">
                        <AIResponseCard
                          data={m.structured}
                          demo={m.demo}
                          pendingAction={showPending}
                          onActionSelect={(a) => {
                            setPendingForMessageId(m.id);
                            setPendingAction(a);
                          }}
                          onActionConfirm={(action) => {
                            executeWorkflow(action);
                          }}
                          onActionCancel={() => {
                            setPendingAction(null);
                            setPendingForMessageId(null);
                          }}
                          onFollowUp={(q) => void sendText(q)}
                          interactionsDisabled={loading}
                        />
                      </div>
                    </motion.div>
                  );
                })}

                <AnimatePresence>
                  {loading ? (
                    <LoadingState key="loading" />
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-4 w-full shrink-0">
            <div
              className={cn(
                "flex w-full items-center gap-2 rounded-full border border-slate-200/90 bg-white px-2 py-1.5 pl-3 shadow-md shadow-slate-900/[0.04]",
                composerFocusRing
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
                    void sendText(input);
                  }
                }}
                placeholder="Ask a follow-up…"
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void sendText(input)}
                disabled={!input.trim() || loading}
                className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.97] disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Responses are generated server-side. Do not paste PHI.
            </p>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
