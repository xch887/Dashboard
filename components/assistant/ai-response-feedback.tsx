"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadAIResponseFeedback,
  saveAIResponseFeedback,
  trackAIResponseFeedback,
  type AIResponseFeedbackData,
  type AIResponseFeedbackSource,
} from "@/lib/assistant/feedback";
import { cn } from "@/lib/utils";

const SUBMIT_COOLDOWN_MS = 800;
const SUCCESS_MESSAGE_MS = 2500;

type FeedbackSelection = "helpful" | "not-helpful" | null;

export function AIResponseFeedback({
  responseId,
  disabled,
  source = "assistant-response",
  variant = "default",
  actions,
  /** Keep “Was this helpful?” closed until the user opens it. */
  revealOnClick = false,
  className,
}: {
  responseId: string;
  disabled?: boolean;
  source?: AIResponseFeedbackSource;
  variant?: "default" | "compact";
  /** Optional trailing controls (e.g. Cancel / Continue) on the same row as the thumbs. */
  actions?: ReactNode;
  revealOnClick?: boolean;
  className?: string;
}) {
  const [selection, setSelection] = useState<FeedbackSelection>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const [promptOpen, setPromptOpen] = useState(!revealOnClick);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadAIResponseFeedback(responseId);
    if (!stored) return;
    setSelection(stored.helpful ? "helpful" : "not-helpful");
    setReason(stored.reason ?? "");
    // Don't auto-open the expansion on reload — user opens it with Not helpful.
    setShowReasonInput(false);
  }, [responseId]);

  useEffect(() => {
    setPromptOpen(!revealOnClick);
  }, [revealOnClick, responseId]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const flashSuccess = useCallback(() => {
    setShowSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, SUCCESS_MESSAGE_MS);
  }, []);

  const lockButtonsBriefly = useCallback(() => {
    setButtonsLocked(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setButtonsLocked(false);
    }, SUBMIT_COOLDOWN_MS);
  }, []);

  const submitFeedback = useCallback(
    (
      helpful: boolean,
      reasonText?: string,
      options?: { acknowledge?: boolean }
    ) => {
      const feedback: AIResponseFeedbackData = {
        responseId,
        helpful,
        source,
        timestamp: new Date().toISOString(),
        ...(reasonText?.trim() ? { reason: reasonText.trim() } : {}),
      };

      saveAIResponseFeedback(feedback);
      trackAIResponseFeedback(feedback);
      if (options?.acknowledge !== false) {
        flashSuccess();
      }
      lockButtonsBriefly();
    },
    [flashSuccess, lockButtonsBriefly, responseId, source]
  );

  const handleHelpful = () => {
    if (disabled || buttonsLocked) return;
    setSelection("helpful");
    setShowReasonInput(false);
    setReason("");
    setShowSuccess(false);
    submitFeedback(true);
  };

  const handleNotHelpful = () => {
    if (disabled || buttonsLocked) return;
    setSelection("not-helpful");
    setShowReasonInput(true);
    setShowSuccess(false);
    // Don't thank until they send details (or skip and we wait for Send details).
    submitFeedback(false, undefined, { acknowledge: false });
  };

  const handleReasonSubmit = () => {
    if (disabled || buttonsLocked || selection !== "not-helpful") return;
    submitFeedback(false, reason, { acknowledge: true });
    setShowReasonInput(false);
  };

  const dismissReasonExpansion = () => {
    setShowReasonInput(false);
  };

  const interactionsDisabled = disabled || buttonsLocked;
  const compact = variant === "compact";
  const reasonFieldId = `feedback-reason-${source}-${responseId}`;

  return (
    <div
      className={cn(
        compact
          ? "border-t border-blue-200/70 pt-2"
          : "mt-4 border-t border-slate-100 pt-4",
        className
      )}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div
          className={cn(
            "flex min-w-0 flex-wrap items-center",
            compact ? "gap-x-2 gap-y-1.5" : "gap-x-3 gap-y-2"
          )}
        >
          {!promptOpen ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPromptOpen(true)}
              aria-expanded={false}
              aria-label="Open feedback"
              className={cn(
                "motion-interactive inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white font-medium text-slate-500",
                "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                "disabled:pointer-events-none disabled:opacity-45",
                compact ? "px-1.5 py-1" : "px-2.5 py-1.5"
              )}
            >
              <ThumbsUp
                className={cn(compact ? "size-3" : "size-3.5", "text-slate-400")}
                aria-hidden
              />
              <ThumbsDown
                className={cn(compact ? "size-3" : "size-3.5", "text-slate-400")}
                aria-hidden
              />
              <span className="sr-only">Open feedback</span>
            </button>
          ) : (
            <div
              className={cn(
                "flex min-w-0 flex-wrap items-center",
                compact ? "gap-x-2 gap-y-1.5" : "gap-x-3 gap-y-2"
              )}
              aria-label="Rate this response"
            >
              <p
                className={cn(
                  "font-semibold uppercase tracking-[0.12em]",
                  compact
                    ? "text-[10px] tracking-wide text-slate-500"
                    : "text-[10px] text-slate-400"
                )}
              >
                Was this helpful?
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={interactionsDisabled}
                  onClick={handleHelpful}
                  aria-pressed={selection === "helpful"}
                  aria-label="Helpful"
                  className={cn(
                    "motion-interactive inline-flex items-center font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                    "disabled:pointer-events-none disabled:opacity-45",
                    compact
                      ? "gap-1 rounded-md border px-1.5 py-1 text-[10px]"
                      : "gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
                    selection === "helpful"
                      ? compact
                        ? "border-slate-500 bg-transparent text-[#2859C5]"
                        : "border-slate-300 bg-white text-slate-700"
                      : compact
                        ? "border-slate-500 bg-transparent text-[#2859C5] hover:border-slate-600 hover:bg-slate-500/5"
                        : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <ThumbsUp
                    className={cn(
                      compact ? "size-3" : "size-3.5",
                      selection === "helpful"
                        ? compact
                          ? "text-[#2859C5]"
                          : "text-slate-500"
                        : compact
                          ? "text-[#2859C5]"
                          : "text-slate-400"
                    )}
                    aria-hidden
                  />
                  Helpful
                </button>
                <button
                  type="button"
                  disabled={interactionsDisabled}
                  onClick={handleNotHelpful}
                  aria-pressed={selection === "not-helpful"}
                  aria-label="Not helpful"
                  className={cn(
                    "motion-interactive inline-flex items-center font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                    "disabled:pointer-events-none disabled:opacity-45",
                    compact
                      ? "gap-1 rounded-md border px-1.5 py-1 text-[10px]"
                      : "gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
                    selection === "not-helpful"
                      ? compact
                        ? "border-slate-500 bg-transparent text-[#2859C5]"
                        : "border-slate-300 bg-white text-slate-700"
                      : compact
                        ? "border-slate-500 bg-transparent text-[#2859C5] hover:border-slate-600 hover:bg-slate-500/5"
                        : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <ThumbsDown
                    className={cn(
                      compact ? "size-3" : "size-3.5",
                      selection === "not-helpful"
                        ? compact
                          ? "text-[#2859C5]"
                          : "text-slate-500"
                        : compact
                          ? "text-[#2859C5]"
                          : "text-slate-400"
                    )}
                    aria-hidden
                  />
                  Not helpful
                </button>
              </div>
              {showSuccess ? (
                <p
                  className={cn(
                    "font-medium text-emerald-800 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
                    compact ? "text-[10px]" : "text-xs text-emerald-700"
                  )}
                  role="status"
                >
                  Thanks for your feedback
                </p>
              ) : null}
              {revealOnClick ? (
                <button
                  type="button"
                  onClick={() => {
                    setPromptOpen(false);
                    setShowReasonInput(false);
                  }}
                  aria-label="Close feedback"
                  className="inline-flex size-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </button>
              ) : null}
            </div>
          )}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {showReasonInput ? (
        <div
          className={cn(
            "relative",
            compact
              ? "mt-2 space-y-1.5 rounded-lg border border-blue-300/40 bg-blue-600/10 p-2.5"
              : "mt-3 space-y-2 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={reasonFieldId}
              className={cn(
                compact
                  ? "block text-[10px] text-slate-700"
                  : "block text-xs text-slate-600"
              )}
            >
              What could be improved?{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <button
              type="button"
              onClick={dismissReasonExpansion}
              aria-label="Dismiss feedback details"
              className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                compact
                  ? "hover:bg-blue-600/15 hover:text-slate-700"
                  : "hover:bg-white hover:text-slate-700"
              )}
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <textarea
            id={reasonFieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={interactionsDisabled}
            rows={2}
            placeholder="Tell us what was missing or incorrect…"
            className={cn(
              "w-full resize-none outline-none placeholder:text-slate-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              compact
                ? "rounded-md border border-blue-400/35 bg-white/80 px-2 py-1.5 text-[11px] text-slate-800 focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/25"
            )}
          />
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={interactionsDisabled}
            onClick={handleReasonSubmit}
            className={
              compact
                ? "h-6 border-blue-400/40 bg-blue-600/15 text-[10px] text-slate-800 shadow-none hover:bg-blue-600/20"
                : "border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50"
            }
          >
            Send details
          </Button>
        </div>
      ) : null}
    </div>
  );
}
