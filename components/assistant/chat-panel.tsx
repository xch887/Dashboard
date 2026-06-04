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
import { sectionPanelClass } from "@/components/dashboard/section-card";
import { SHOW_DASHBOARD_IN_NAV } from "@/lib/nav-config";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowUp, Search } from "lucide-react";

/** Sync + spark mark above Operations intelligence hero. */
const ASSISTANT_HERO_ICON = "/brand/operations-intelligence-icon.svg";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      structured: AssistantStructuredResponse;
      demo?: boolean;
    };

const composerShellClass =
  "flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 pl-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/35 focus-within:ring-offset-2";

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
            className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={motionTransition(reduceMotion, "base")}
          >
          <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
            <div
              className={cn(
                sectionPanelClass,
                "relative flex min-h-0 flex-1 flex-col overflow-hidden"
              )}
            >
                <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pb-8 pt-8 sm:gap-8 sm:px-6 sm:pb-9 sm:pt-9 lg:px-8 lg:pb-10 lg:pt-10">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex justify-center sm:mb-4">
                      <Image
                        src={ASSISTANT_HERO_ICON}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                        priority
                        aria-hidden
                        className="h-12 w-12 object-contain sm:h-14 sm:w-14"
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
                    <div className={composerShellClass}>
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
                            void sendText(input);
                          }
                        }}
                        placeholder="Describe the operational question…"
                        className="min-w-0 flex-1 bg-transparent py-2 text-[15px] leading-snug text-slate-900 placeholder:text-slate-400 focus:outline-none md:text-base"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => void sendText(input)}
                        disabled={!input.trim() || loading}
                        className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.97] disabled:opacity-40 sm:h-11 sm:w-11"
                        aria-label="Send"
                      >
                        <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
                      </Button>
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

                  <div className="mt-auto w-full pt-2 sm:pt-4">
                    <EmptyState
                      onSelectSuggestion={(s) => void sendText(s)}
                    />
                  </div>
                </div>
            </div>
          </div>
          </motion.div>
      ) : (
        <motion.div
          key="thread"
          className="flex h-full min-h-0 w-full flex-1 flex-col"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
          transition={motionTransition(reduceMotion, "base")}
        >
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 md:hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <Image
                src={ASSISTANT_HERO_ICON}
                alt=""
                width={18}
                height={18}
                unoptimized
                aria-hidden
                className="h-9 w-9 object-contain"
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
            <div
              className={cn(
                sectionPanelClass,
                "relative z-10 flex h-full min-h-0 flex-col overflow-hidden"
              )}
            >
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

              <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-4 py-4 md:px-6">
                <div className={composerShellClass}>
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
                    className="h-10 w-10 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97] disabled:opacity-40"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
                  </Button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Responses are generated server-side. Do not paste PHI.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
