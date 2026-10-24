"use client";

import { BarChart3, Bell, FileText, UserPlus } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

/** Suggested prompts shown on the Intelligence empty state. */
export const ASSISTANT_PROMPT_OPTIONS = [
  {
    rank: "Lead" as const,
    title: "Hold a case, or float PACU?",
    consequence:
      "If recovery stays two RNs short, which queued case is safest to delay — and who can float before first case?",
    chip: "Compare options",
    prompt:
      "If recovery stays two RNs short, should we hold a queued case or float from PACU before first case?",
    accent: "rose",
    scope: "OR block",
    sources: "OR schedule · Roster",
    signals: [
      { label: "Hold", value: "Case 3", tone: "warning" as const },
      { label: "Float", value: "PACU", tone: "neutral" as const },
      { label: "First case", value: "+38 min", tone: "critical" as const },
    ],
  },
  {
    rank: "Next" as const,
    title: "Pause v2.14, or ride it out?",
    consequence:
      "ICU West retries are 3.2× baseline and east ICU is quiet. Rollback tonight vs monitor until morning.",
    chip: "Model rollback",
    prompt:
      "Should we pause the remaining v2.14 rollout on ICU West pumps tonight, or monitor until morning?",
    accent: "amber",
    scope: "ICU West firmware",
    sources: "Telemetry · Firmware log",
    signals: [
      { label: "Retry", value: "12.4%", tone: "critical" as const },
      { label: "East ICU", value: "Quiet", tone: "neutral" as const },
      { label: "On v2.14", value: "6 days", tone: "warning" as const },
    ],
  },
  {
    rank: "Watch" as const,
    title: "Calibrate in place, or swap loaners?",
    consequence:
      "Four 4 West sensors sit outside band with last cal 92 days ago. Batch tonight vs loaner swap before first case.",
    chip: "Pick a path",
    prompt:
      "For the 4 West calibration cluster, is it faster to batch-calibrate in place tonight or swap in loaners before first case?",
    accent: "teal",
    scope: "4 West sensors",
    sources: "Cal records · Inventory",
    signals: [
      { label: "Sensors", value: "4", tone: "neutral" as const },
      { label: "Drift", value: "±2.8%", tone: "warning" as const },
      { label: "Loaners", value: "Unknown", tone: "warning" as const },
    ],
  },
] as const;

const DECISION_COUNT = ASSISTANT_PROMPT_OPTIONS.length;

const accentClass = {
  rose: {
    bar: "bg-rose-500",
    wash: "hover:bg-rose-50/50",
  },
  amber: {
    bar: "bg-amber-500",
    wash: "hover:bg-amber-50/50",
  },
  teal: {
    bar: "bg-teal-600",
    wash: "hover:bg-teal-50/45",
  },
} as const;

const signalToneClass = {
  critical: "bg-red-50 text-red-800 ring-red-200/80",
  warning: "bg-amber-50 text-amber-900 ring-amber-200/80",
  neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
} as const;

/** Compact strip — same numbers/words as dashboard KPIs, not the card chrome. */
const SYSTEM_PULSE = [
  {
    label: "Failures",
    value: "441",
    hint: "devices",
    title: "441 predicted failures",
    detail:
      "Risk concentrates on 4 West calibration drift and overdue PM. Four sensors sit outside the ±2% vendor band.",
    facts: [
      { label: "Cal drift", value: "4 sensors" },
      { label: "Last cal", value: "92 days" },
      { label: "vs last week", value: "+5.2%" },
    ],
    source: "Cal records · Risk model",
  },
  {
    label: "Maintenance",
    value: "179",
    hint: "tasks",
    title: "179 active maintenance tasks",
    detail:
      "Radiology MRI Suite A and ICU West infusion pumps account for most of the remaining window before Joint Commission.",
    facts: [
      { label: "Open PMs", value: "MRI A · ICU West" },
      { label: "vs last week", value: "+2.1%" },
      { label: "Window", value: "This week" },
    ],
    source: "PM ledger · Department queue",
  },
  {
    label: "Resolution",
    value: "4.3",
    hint: "hours",
    title: "Average resolution 4.3 hours",
    detail:
      "Slightly slower than last week. First-case delay and ICU West retries are pulling techs off the queue.",
    facts: [
      { label: "vs last week", value: "+0.8%" },
      { label: "First case", value: "+38 min" },
      { label: "Retry spike", value: "ICU West" },
    ],
    source: "Work orders · Telemetry",
  },
  {
    label: "Fleet",
    value: "77%",
    hint: "available",
    title: "77% of fleet available",
    detail:
      "Availability is held down by 253 offline devices and 339 in a critical state. ICU West retries are the fastest-moving slip.",
    facts: [
      { label: "Critical", value: "339" },
      { label: "Offline", value: "253" },
      { label: "vs last week", value: "+1.4%" },
    ],
    source: "Telemetry · Fleet inventory",
  },
] as const;

const WORKFLOWS = [
  {
    key: "report",
    verb: "Report",
    title: "Compliance pack",
    detail: "Overdue PMs and high-risk devices for leadership.",
    meta: "78% PM · 441 at-risk",
    prompt:
      "Generate a compliance report for overdue PMs and high-risk devices this week.",
  },
  {
    key: "notify",
    verb: "Notify",
    title: "On-call page",
    detail: "Draft for Clinical Engineering before first case.",
    meta: "Biomed · 4 West",
    prompt:
      "Draft a notification for the on-call Clinical Engineering team about tonight’s open risk.",
  },
  {
    key: "assign",
    verb: "Assign",
    title: "Hand off owners",
    detail: "Highest-risk open work before tonight’s shift.",
    meta: "Vent #6 · MRI A",
    prompt:
      "Who should own the highest-risk open issues before tonight’s shift?",
  },
  {
    key: "analytics",
    verb: "Analytics",
    title: "Attention view",
    detail: "Critical and offline fleet that needs a saved cut.",
    meta: "339 critical · 253 offline",
    prompt: "Open analytics for devices that need attention this week.",
  },
] as const;

const WORKFLOW_ICONS = {
  report: FileText,
  notify: Bell,
  assign: UserPlus,
  analytics: BarChart3,
} as const;

function WorkflowMark({ kind }: { kind: (typeof WORKFLOWS)[number]["key"] }) {
  const Icon = WORKFLOW_ICONS[kind];
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center"
      aria-hidden
    >
      <Icon className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
    </span>
  );
}

export function EmptyState({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (text: string) => void;
}) {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col pb-4">
      <div className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 border-b border-slate-100 pb-5 sm:pb-6">
        {SYSTEM_PULSE.map((item) => (
          <HoverCard key={item.label} openDelay={120} closeDelay={80}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="-mx-1 min-w-0 rounded-md px-1 py-0.5 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tabular-nums tracking-tight text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.hint}</span>
                </p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              side="bottom"
              sideOffset={8}
              collisionPadding={12}
              className="z-[600] w-[20rem] space-y-2.5 bg-white p-3 shadow-lg"
            >
              <div>
                <p className="text-[13px] font-semibold leading-snug text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-slate-600">
                  {item.detail}
                </p>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {item.facts.map((fact) => (
                  <li
                    key={fact.label}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200/80"
                  >
                    <span className="text-slate-500">{fact.label}</span>
                    <span className="tabular-nums">{fact.value}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-400">{item.source}</p>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex shrink-0 items-baseline justify-between gap-3 sm:mb-3.5">
          <div className="flex items-baseline gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Needs a decision
            </p>
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold tabular-nums text-slate-500 ring-1 ring-inset ring-slate-200/80">
              {DECISION_COUNT}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Choices to make before first case
          </p>
        </div>

        <ul className="flex min-h-0 flex-1 flex-col gap-2.5">
          {ASSISTANT_PROMPT_OPTIONS.map((item) => {
            const tone = accentClass[item.accent];
            return (
              <li key={item.rank} className="flex min-h-0 flex-1">
                <button
                  type="button"
                  onClick={() => onSelectSuggestion(item.prompt)}
                  className={cn(
                    "motion-interactive group flex h-full min-h-[6.5rem] w-full gap-3 rounded-2xl px-3.5 py-3.5 text-left sm:gap-4 sm:px-4 sm:py-4",
                    "bg-slate-50/80 ring-1 ring-slate-200/70",
                    "hover:bg-white hover:ring-slate-300/90",
                    tone.wash,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 w-0.5 shrink-0 self-stretch rounded-full",
                      tone.bar
                    )}
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-1 max-w-2xl text-[13px] leading-snug text-slate-500">
                      {item.consequence}
                    </span>
                    <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {item.signals.map((signal) => (
                        <span
                          key={signal.label}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                            signalToneClass[signal.tone]
                          )}
                        >
                          <span className="text-current/70">{signal.label}</span>
                          <span className="tabular-nums">{signal.value}</span>
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400">
                        {item.sources}
                      </span>
                    </span>
                  </span>
                  <span
                    className={cn(
                      "hidden shrink-0 self-center rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[#2859C5] sm:inline",
                      "transition-[background-color,color,box-shadow,transform] duration-150",
                      /* Card hover: soft cue that this is the action */
                      "group-hover:bg-blue-50/80 group-hover:text-[#1e4aa8]",
                      /* Direct CTA hover: solid button feel */
                      "hover:bg-[#2859C5] hover:text-white hover:shadow-sm hover:shadow-blue-600/20",
                      "active:scale-[0.98]"
                    )}
                  >
                    {item.chip}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto shrink-0 pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3 sm:mb-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Workflows
          </p>
          <p className="text-[11px] text-slate-400">Run against live fleet state</p>
        </div>
        <ul className="grid overflow-hidden rounded-lg ring-1 ring-slate-200/90 sm:grid-cols-2">
          {WORKFLOWS.map((item, index) => (
            <li
              key={item.key}
              className={cn(
                "border-slate-100",
                index % 2 === 1 ? "sm:border-l" : "",
                index > 1 ? "border-t" : "",
                index === 1 ? "border-t sm:border-t-0" : ""
              )}
            >
              <button
                type="button"
                onClick={() => onSelectSuggestion(item.prompt)}
                className={cn(
                  "motion-interactive flex h-full w-full gap-3 px-3.5 py-4 text-left sm:py-5",
                  "hover:bg-slate-50/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-inset"
                )}
              >
                <WorkflowMark kind={item.key} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2859C5]">
                      {item.verb}
                    </span>
                    <span className="truncate text-[10px] tabular-nums text-slate-400">
                      {item.meta}
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    {item.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
