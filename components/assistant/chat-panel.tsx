"use client";

import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AIResponseCard } from "@/components/assistant/ai-response-card";
import {
  ChatHistoryPanel,
  type PastChat,
} from "@/components/assistant/chat-history-panel";
import { ComposerDock } from "@/components/assistant/composer-dock";
import { DecisionFlow } from "@/components/assistant/decision-flow";
import { EmptyState } from "@/components/assistant/empty-state";
import { LoadingState } from "@/components/assistant/loading-state";
import { WorkflowSetup } from "@/components/assistant/workflow-setup";
import type {
  ApiAssistantResponse,
  AssistantStructuredResponse,
  SuggestedAction,
} from "@/lib/assistant/types";
import { intelligenceThreadToApiMessages } from "@/lib/assistant/to-api-messages";
import { sectionPanelClass } from "@/components/dashboard/section-card";
import { useBrowserClock } from "@/lib/browser-clock";
import { SHOW_DASHBOARD_IN_NAV } from "@/lib/nav-config";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, X } from "lucide-react";

/** Ops-intelligence mark used in the briefing header. */
const ASSISTANT_HERO_ICON = "/brand/operations-intelligence-icon.svg";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      structured: AssistantStructuredResponse;
      demo?: boolean;
    };

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [agentic, setAgentic] = useState<
    | { kind: "decision"; id: string }
    | { kind: "workflow"; id: string }
    | null
  >(null);
  const liveClock = useBrowserClock();

  const openHistory = useCallback(() => {
    setHistoryOpen(true);
  }, []);

  const openDecision = useCallback((caseId: string) => {
    setAgentic({ kind: "decision", id: caseId });
    setHistoryOpen(false);
  }, []);

  const openWorkflow = useCallback((jobId: string) => {
    setAgentic({ kind: "workflow", id: jobId });
    setHistoryOpen(false);
  }, []);

  const closeAgentic = useCallback(() => {
    setAgentic(null);
  }, []);

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
      setAgentic(null);
      setHistoryOpen(false);

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

  const goHome = useCallback(() => {
    setMessages([]);
    setInput("");
    setError(null);
    setOutcome(null);
    setPendingAction(null);
    setPendingForMessageId(null);
    setHistoryOpen(false);
    setAgentic(null);
  }, []);

  const openPastChat = useCallback((chat: PastChat) => {
    setError(null);
    setOutcome(null);
    setPendingAction(null);
    setPendingForMessageId(null);
    setAgentic(null);
    setInput("");
    setMessages([
      { id: `${chat.id}-user`, role: "user", text: chat.userText },
      {
        id: `${chat.id}-assistant`,
        role: "assistant",
        structured: chat.structured,
        demo: true,
      },
    ]);
    setHistoryOpen(false);
  }, []);

  const threadTitle =
    messages.find((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
      ?.text ?? "Conversation";

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
            className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs font-medium text-emerald-950 ring-1 ring-emerald-100"
          >
            <span className="min-w-0 flex-1">{outcome}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setOutcome(null)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-emerald-800/70 hover:bg-emerald-100 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {historyOpen ? (
          <motion.div
            key="history"
            className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={motionTransition(reduceMotion, "base")}
          >
            <div
              className={cn(
                sectionPanelClass,
                "relative flex min-h-0 flex-1 flex-col overflow-hidden"
              )}
            >
              <ChatHistoryPanel
                onBack={() => setHistoryOpen(false)}
                onOpenChat={openPastChat}
              />
            </div>
          </motion.div>
        ) : agentic?.kind === "decision" ? (
          <motion.div
            key={`decision-${agentic.id}`}
            className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={motionTransition(reduceMotion, "base")}
          >
            <div
              className={cn(
                sectionPanelClass,
                "relative flex min-h-0 flex-1 flex-col overflow-hidden"
              )}
            >
              <DecisionFlow
                caseId={agentic.id}
                onBack={closeAgentic}
                onCommitted={(option) => {
                  setOutcome(`Decision recorded: ${option.label}`);
                }}
              />
            </div>
          </motion.div>
        ) : agentic?.kind === "workflow" ? (
          <motion.div
            key={`workflow-${agentic.id}`}
            className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={motionTransition(reduceMotion, "base")}
          >
            <div
              className={cn(
                sectionPanelClass,
                "relative flex min-h-0 flex-1 flex-col overflow-hidden"
              )}
            >
              <WorkflowSetup
                jobId={agentic.id}
                onBack={closeAgentic}
                onArmed={(job) => {
                  setOutcome(`Workflow armed: ${job.title}`);
                }}
              />
            </div>
          </motion.div>
        ) : messages.length === 0 ? (
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
                <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3.5 pt-4 sm:px-6 sm:pb-4 sm:pt-5 lg:px-7">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Image
                      src={ASSISTANT_HERO_ICON}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      priority
                      aria-hidden
                      className="h-5 w-5 object-contain"
                    />
                    <h1 className="truncate text-base font-semibold leading-6 tracking-tight text-slate-800 sm:text-lg sm:leading-7">
                      Operations Intelligence
                    </h1>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-teal-500"
                      aria-hidden
                    />
                    <span className="tabular-nums">
                      {liveClock
                        ? `Systems live · ${liveClock}`
                        : "Systems live"}
                    </span>
                  </p>
                </header>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 sm:px-6 lg:px-7">
                  <EmptyState
                    onOpenDecision={openDecision}
                    onOpenWorkflow={openWorkflow}
                  />
                </div>

                <ComposerDock
                  value={input}
                  onChange={setInput}
                  onSend={(text) => void sendText(text ?? input)}
                  disabled={loading}
                  placeholder="Ask about a device, a unit, or who’s on the hook…"
                  expandable
                  onOpenHistory={openHistory}
                />
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
          <div className="relative min-h-0 flex-1">
            <div
              className={cn(
                sectionPanelClass,
                "relative z-10 flex h-full min-h-0 flex-col overflow-hidden"
              )}
            >
              <header className="flex shrink-0 items-center gap-1 border-b border-slate-100 px-3 py-2.5 sm:px-4">
                <HeaderIcon label="Back to home" onClick={goHome}>
                  <ArrowLeft strokeWidth={1.75} />
                </HeaderIcon>
                <div className="min-w-0 flex-1 px-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {threadTitle}
                  </p>
                  <p className="text-[11px] text-slate-500">Conversation</p>
                </div>
                <HeaderIcon label="New chat" onClick={goHome}>
                  <Plus strokeWidth={1.75} />
                </HeaderIcon>
              </header>
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
                          responseId={m.id}
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

              <ComposerDock
                value={input}
                onChange={setInput}
                onSend={(text) => void sendText(text ?? input)}
                disabled={loading}
                placeholder="Ask a follow-up…"
                showPhiNote
                onOpenHistory={openHistory}
              />
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function HeaderIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
    >
      <span className="[&_svg]:h-4 [&_svg]:w-4">{children}</span>
    </button>
  );
}
