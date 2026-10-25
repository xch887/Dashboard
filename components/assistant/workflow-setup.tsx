"use client";

import { useState } from "react";
import { AIResponseFeedback } from "@/components/assistant/ai-response-feedback";
import {
  workflowJobById,
  type WorkflowJob,
} from "@/lib/assistant/mock-agentic";
import {
  ArrowLeft,
  Bell,
  Check,
  FileText,
  LineChart,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const VERB_ICON = {
  Report: FileText,
  Notify: Bell,
  Assign: UserPlus,
  Analytics: LineChart,
} as const;

export function WorkflowSetup({
  jobId,
  onBack,
  onArmed,
}: {
  jobId: string;
  onBack: () => void;
  onArmed?: (job: WorkflowJob) => void;
}) {
  const job = workflowJobById(jobId);
  const Icon = VERB_ICON[job.verb as keyof typeof VERB_ICON] ?? FileText;
  const [armed, setArmed] = useState(false);
  const [approvalHold, setApprovalHold] = useState(true);

  function arm() {
    setArmed(true);
    onArmed?.(job);
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
            Workflow
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {job.title}
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600 sm:inline-flex">
          <Icon className="h-3 w-3" strokeWidth={1.75} />
          {job.verb}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {armed ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-emerald-950">
                    Armed
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-emerald-900/80">
                    {job.title} will run on {job.schedule}. Next run:{" "}
                    {job.nextRun}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="motion-interactive h-9 rounded-lg bg-[#2859C5] px-4 text-sm font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
              >
                Back to briefing
              </button>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Standing job
                </p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                  Set up {job.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                  {job.purpose}
                </p>
              </div>

              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Trigger
                  </dt>
                  <dd className="mt-1 text-[13px] leading-snug text-slate-800">
                    {job.trigger}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Schedule
                  </dt>
                  <dd className="mt-1 text-[13px] leading-snug text-slate-800">
                    {job.schedule}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Next run
                  </dt>
                  <dd className="mt-1 text-[13px] leading-snug text-slate-800">
                    {job.nextRun}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-200/80">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Approval
                  </dt>
                  <dd className="mt-1 text-[13px] leading-snug text-slate-800">
                    {job.approval}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Agent steps
                </p>
                <ol className="mt-3 space-y-0">
                  {job.nodes.map((node, index) => (
                    <li key={node.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {index < job.nodes.length - 1 ? (
                        <span
                          className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-200"
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold tabular-nums text-slate-600 ring-1 ring-slate-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[13px] font-semibold text-slate-900">
                          {node.label}
                        </p>
                        <p className="mt-1 text-[12px] leading-snug text-slate-500">
                          {node.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={approvalHold}
                  onChange={(e) => setApprovalHold(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2859C5] focus:ring-[#2859C5]/40"
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-900">
                    Hold for my approval before send
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    Recommended. Uncheck only if this job should auto-deliver
                    when the trigger fires.
                  </span>
                </span>
              </label>
            </>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
        <AIResponseFeedback
          responseId={`workflow:${job.id}`}
          source="workflow-setup"
          className="mt-0 border-t-0 pt-0"
          actions={
            !armed ? (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="motion-interactive h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={arm}
                  className="motion-interactive inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2859C5] px-4 text-sm font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Arm workflow
                </button>
              </>
            ) : null
          }
        />
      </footer>
    </div>
  );
}
