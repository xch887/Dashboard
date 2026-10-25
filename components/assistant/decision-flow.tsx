"use client";

import { useState } from "react";
import { AIResponseFeedback } from "@/components/assistant/ai-response-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  decisionCaseById,
  type DecisionCase,
  type DecisionCheckedItem,
  type DecisionOption,
} from "@/lib/assistant/mock-agentic";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Database } from "lucide-react";

const STEPS = [
  { id: "situation", label: "What’s going on" },
  { id: "why", label: "Why it matters" },
  { id: "decide", label: "Choose a path" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const accentBar = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  teal: "bg-teal-600",
} as const;

const accentSoft = {
  rose: "bg-rose-50 text-rose-800 ring-rose-200/80",
  amber: "bg-amber-50 text-amber-900 ring-amber-200/80",
  teal: "bg-teal-50 text-teal-900 ring-teal-200/80",
} as const;

function SituationEvidencePanel({ decision }: { decision: DecisionCase }) {
  return (
    <aside className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Live signals
        </p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {decision.evidence.map((row) => (
          <li
            key={row.metric}
            className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-200/80"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500">
                {row.metric}
              </span>
              <span className="text-[13px] font-semibold tabular-nums text-slate-900">
                {row.value}
              </span>
            </div>
            {row.note ? (
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                {row.note}
              </p>
            ) : null}
            <p className="mt-1 text-[10px] text-slate-400">{row.source}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-snug text-slate-400">
        Sources · {decision.sources}
      </p>
    </aside>
  );
}

function WhyStakesPanel({ decision }: { decision: DecisionCase }) {
  return (
    <aside className="space-y-3">
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800/80">
          If you wait
        </p>
        <p className="mt-1.5 text-[13px] leading-snug text-amber-950/90">
          {decision.why.ifWait}
        </p>
      </div>
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Confidence
        </p>
        <p className="mt-1 text-[15px] font-semibold text-slate-900">
          {decision.why.confidence}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          From the signals on the prior step and the chain at left.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Key drivers
        </p>
        <ul className="mt-2.5 space-y-2">
          {decision.evidence.slice(0, 2).map((row) => (
            <li key={row.metric} className="text-[12px] leading-snug">
              <span className="font-semibold text-slate-800">{row.value}</span>
              <span className="text-slate-500"> · {row.metric}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ReasoningChain({ decision }: { decision: DecisionCase }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-700">How we reasoned</p>
      <ol className="mt-2.5 space-y-0">
        {decision.reasoning.map((step, index) => (
          <li key={step.claim} className="relative flex gap-3 pb-3.5 last:pb-0">
            {index < decision.reasoning.length - 1 ? (
              <span
                className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200"
                aria-hidden
              />
            ) : null}
            <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2859C5]/[0.08] text-[10px] font-semibold tabular-nums text-[#2859C5]">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-snug text-slate-800">
                {step.claim}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                From · {step.from}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DecisionFlow({
  caseId,
  onBack,
  onCommitted,
}: {
  caseId: string;
  onBack: () => void;
  onCommitted?: (option: DecisionOption, decision: DecisionCase) => void;
}) {
  const decision = decisionCaseById(caseId);
  const [step, setStep] = useState<StepId>("situation");
  const [picked, setPicked] = useState<string | null>(
    decision.options.find((o) => o.recommended)?.id ?? null
  );
  const [done, setDone] = useState(false);
  const [verifyItem, setVerifyItem] = useState<DecisionCheckedItem | null>(
    null
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const selected = decision.options.find((o) => o.id === picked) ?? null;

  function goNext() {
    if (step === "situation") setStep("why");
    else if (step === "why") setStep("decide");
  }

  function goPrev() {
    if (step === "decide") setStep("why");
    else if (step === "why") setStep("situation");
  }

  function commit() {
    if (!selected) return;
    setDone(true);
    onCommitted?.(selected, decision);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-2.5 sm:px-5">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Decision
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {decision.title}
          </p>
        </div>
        <span
          className={cn(
            "hidden shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset sm:inline",
            accentSoft[decision.accent]
          )}
        >
          {decision.clock}
        </span>
      </header>

      <div className="shrink-0 border-b border-slate-100 px-4 py-3 sm:px-5">
        <ol className="flex items-center gap-1.5">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const complete = i < stepIndex || done;
            return (
              <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => !done && setStep(s.id)}
                  disabled={done && !complete}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                    active ? "bg-slate-50" : "hover:bg-slate-50/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums",
                      complete
                        ? "bg-[#2859C5] text-white"
                        : active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {complete ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px] font-medium",
                      active ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
        <div
          className={cn(
            "mx-auto grid max-w-3xl gap-5",
            step === "situation" || step === "why"
              ? "lg:grid-cols-[minmax(0,1fr)_14.5rem]"
              : "lg:grid-cols-1"
          )}
        >
          <div className="flex min-w-0 gap-3">
            <span
              className={cn(
                "mt-1 w-0.5 shrink-0 self-stretch rounded-full",
                accentBar[decision.accent]
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              {done && selected ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                      Recorded
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                      {selected.label}
                    </h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                      {selected.summary}
                    </p>
                  </div>
                  {selected.because ? (
                    <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Based on
                      </p>
                      <p className="mt-1 text-[13px] leading-snug text-slate-700">
                        {selected.because}
                      </p>
                    </div>
                  ) : null}
                  <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-[13px] leading-snug text-slate-600 ring-1 ring-slate-200/80">
                    <span className="font-semibold text-slate-800">Next: </span>
                    {selected.effect}
                  </p>
                  <button
                    type="button"
                    onClick={onBack}
                    className="motion-interactive h-9 rounded-lg bg-[#2859C5] px-4 text-sm font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                  >
                    Back to briefing
                  </button>
                </div>
              ) : null}

              {!done && step === "situation" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      What’s going on
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                      {decision.situation.headline}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                      {decision.situation.body}
                    </p>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {decision.situation.facts.map((fact) => (
                      <li
                        key={fact.label}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200/80"
                      >
                        <span className="text-slate-500">{fact.label}</span>
                        <span className="tabular-nums">{fact.value}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700">
                      Already checked
                    </p>
                    <ul className="mt-2 space-y-2">
                      {decision.situation.alreadyChecked.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-start gap-2 text-[13px] leading-snug text-slate-600"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2859C5]"
                            strokeWidth={2}
                          />
                          <span className="min-w-0 flex-1">
                            {item.label}{" "}
                            <button
                              type="button"
                              onClick={() => setVerifyItem(item)}
                              className="font-semibold text-[#2859C5] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                            >
                              Verify
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:hidden">
                    <SituationEvidencePanel decision={decision} />
                  </div>
                </div>
              ) : null}

              {!done && step === "why" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Why it matters
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                      {decision.why.headline}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                      {decision.why.body}
                    </p>
                  </div>
                  <ReasoningChain decision={decision} />
                  <div className="lg:hidden">
                    <WhyStakesPanel decision={decision} />
                  </div>
                </div>
              ) : null}

              {!done && step === "decide" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Choose a path
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                      Pick a path before first case
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-500">
                      {decision.scope} · each option includes why it fits
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {decision.options.map((option) => {
                      const active = picked === option.id;
                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            onClick={() => setPicked(option.id)}
                            className={cn(
                              "motion-interactive w-full rounded-xl px-3.5 py-3 text-left ring-1 transition-[background-color,box-shadow,ring-color]",
                              active
                                ? "bg-white ring-[#2859C5] shadow-sm shadow-blue-600/10"
                                : "bg-slate-50/80 ring-slate-200/80 hover:bg-white hover:ring-slate-300"
                            )}
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="text-[14px] font-semibold text-slate-900">
                                    {option.label}
                                  </span>
                                  {option.recommended ? (
                                    <span className="rounded-md bg-[#2859C5]/[0.08] px-1.5 py-0.5 text-[10px] font-semibold text-[#2859C5]">
                                      Recommended
                                    </span>
                                  ) : null}
                                </span>
                                <span className="mt-1 block text-[13px] leading-snug text-slate-600">
                                  {option.summary}
                                </span>
                                {option.because ? (
                                  <span className="mt-2 block rounded-lg bg-slate-50 px-2.5 py-2 text-[12px] leading-snug text-slate-600 ring-1 ring-slate-200/70">
                                    <span className="font-semibold text-slate-700">
                                      Because:{" "}
                                    </span>
                                    {option.because}
                                  </span>
                                ) : null}
                                <span className="mt-1.5 block text-[11px] text-slate-400">
                                  {option.effect}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1",
                                  active
                                    ? "bg-[#2859C5] text-white ring-[#2859C5]"
                                    : "bg-white ring-slate-300"
                                )}
                                aria-hidden
                              >
                                {active ? (
                                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                ) : null}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {!done && (step === "situation" || step === "why") ? (
            <div className="hidden lg:block">
              <div className="sticky top-0">
                {step === "situation" ? (
                  <SituationEvidencePanel decision={decision} />
                ) : (
                  <WhyStakesPanel decision={decision} />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
        <AIResponseFeedback
          responseId={`decision:${decision.id}`}
          source="decision-flow"
          className="mt-0 border-t-0 pt-0"
          actions={
            !done ? (
              <>
                <button
                  type="button"
                  onClick={step === "situation" ? onBack : goPrev}
                  className="motion-interactive h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                >
                  {step === "situation" ? "Cancel" : "Back"}
                </button>
                {step !== "decide" ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="motion-interactive h-9 rounded-lg bg-[#2859C5] px-4 text-sm font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={commit}
                    disabled={!picked}
                    className="motion-interactive h-9 rounded-lg bg-[#2859C5] px-4 text-sm font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 disabled:opacity-40"
                  >
                    Confirm path
                  </button>
                )}
              </>
            ) : null
          }
        />
      </footer>

      <Dialog
        open={verifyItem != null}
        onOpenChange={(open) => {
          if (!open) setVerifyItem(null);
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0 sm:max-w-md">
          {verifyItem ? (
            <>
              <DialogHeader className="border-b border-slate-100 px-5 py-4 pr-12">
                <DialogTitle className="text-[15px] font-semibold leading-snug text-slate-900">
                  Verify check
                </DialogTitle>
                <DialogDescription className="mt-1 text-[13px] leading-snug text-slate-600">
                  {verifyItem.label}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    What we checked
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                    {verifyItem.checked}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    What we found
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                    {verifyItem.found}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Source · {verifyItem.source}
                </p>
              </div>
              <div className="flex justify-end border-t border-slate-100 px-5 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-200 bg-white shadow-none"
                  onClick={() => setVerifyItem(null)}
                >
                  Done
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
