"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
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
}: {
  responseId: string;
  disabled?: boolean;
  source?: AIResponseFeedbackSource;
  variant?: "default" | "compact";
}) {
  const [selection, setSelection] = useState<FeedbackSelection>(null);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = loadAIResponseFeedback(responseId);
    if (!stored) return;
    setSelection(stored.helpful ? "helpful" : "not-helpful");
    setReason(stored.reason ?? "");
    setShowReasonInput(!stored.helpful);
  }, [responseId]);

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
    (helpful: boolean, reasonText?: string) => {
      const feedback: AIResponseFeedbackData = {
        responseId,
        helpful,
        source,
        timestamp: new Date().toISOString(),
        ...(reasonText?.trim() ? { reason: reasonText.trim() } : {}),
      };

      saveAIResponseFeedback(feedback);
      trackAIResponseFeedback(feedback);
      flashSuccess();
      lockButtonsBriefly();
    },
    [flashSuccess, lockButtonsBriefly, responseId, source]
  );

  const handleHelpful = () => {
    if (disabled || buttonsLocked) return;
    setSelection("helpful");
    setShowReasonInput(false);
    setReason("");
    submitFeedback(true);
  };

  const handleNotHelpful = () => {
    if (disabled || buttonsLocked) return;
    setSelection("not-helpful");
    setShowReasonInput(true);
    submitFeedback(false);
  };

  const handleReasonSubmit = () => {
    if (disabled || buttonsLocked || selection !== "not-helpful") return;
    submitFeedback(false, reason);
  };

  const interactionsDisabled = disabled || buttonsLocked;
  const compact = variant === "compact";
  const reasonFieldId = `feedback-reason-${source}-${responseId}`;

  return (
    <div
      className={cn(
        compact
          ? "border-t border-blue-200/70 pt-2"
          : "mt-4 border-t border-slate-100 pt-4"
      )}
      aria-label="Rate this response"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className={cn(
          "flex flex-wrap items-center",
          compact ? "gap-x-2 gap-y-1.5" : "gap-x-3 gap-y-2"
        )}
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
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-950"
                  : "border-emerald-200/90 bg-emerald-50 text-emerald-900 shadow-sm"
                : compact
                  ? "border-blue-400/35 bg-blue-600/10 text-slate-700 hover:border-blue-500/45 hover:bg-blue-600/15 hover:text-slate-900"
                  : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <ThumbsUp
              className={cn(
                compact ? "size-3" : "size-3.5",
                selection === "helpful" ? "text-emerald-700" : "text-slate-400"
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
                  ? "border-rose-400/40 bg-rose-500/10 text-rose-950"
                  : "border-rose-200/90 bg-rose-50 text-rose-900 shadow-sm"
                : compact
                  ? "border-blue-400/35 bg-blue-600/10 text-slate-700 hover:border-blue-500/45 hover:bg-blue-600/15 hover:text-slate-900"
                  : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <ThumbsDown
              className={cn(
                compact ? "size-3" : "size-3.5",
                selection === "not-helpful"
                  ? "text-rose-700"
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
      </div>

      {showReasonInput ? (
        <div className={cn(compact ? "mt-2 space-y-1.5" : "mt-3 space-y-2")}>
          <label
            htmlFor={reasonFieldId}
            className={cn(
              compact ? "block text-[10px] text-slate-600" : "block text-xs text-slate-600"
            )}
          >
            What could be improved?{" "}
            <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id={reasonFieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={interactionsDisabled}
            rows={compact ? 2 : 2}
            placeholder="Tell us what was missing or incorrect…"
            className={cn(
              "w-full resize-none outline-none placeholder:text-slate-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              compact
                ? "rounded-md border border-blue-400/35 bg-blue-600/10 px-2 py-1.5 text-[11px] text-slate-800 focus-visible:border-blue-500/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
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
                ? "h-6 border-blue-400/35 bg-blue-600/10 text-[10px] text-slate-700 hover:bg-blue-600/15"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }
          >
            Send details
          </Button>
        </div>
      ) : null}
    </div>
  );
}
