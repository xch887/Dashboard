"use client";

import { useState } from "react";
import { BarChart3, Bell, FileText, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

/** Decision cards on the Intelligence empty state — open a walkthrough, not chat. */
export const ASSISTANT_PROMPT_OPTIONS = [
  {
    rank: "Lead" as const,
    caseId: "or-block",
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
    caseId: "icu-firmware",
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
    caseId: "west-cal",
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

type MetricRow = {
  name: string;
  meta: string;
  status: string;
  tone: "critical" | "warning" | "neutral";
};

type MetricPulse = {
  id: "failures" | "maintenance" | "resolution" | "fleet";
  label: string;
  value: string;
  hint: string;
  title: string;
  detail: string;
  cta: string;
  source: string;
  /** Week trend for Resolution / Fleet mini charts. */
  series?: number[];
  seriesLabel?: string;
  seriesTone?: "bad" | "good";
  rows: MetricRow[];
};

/** Compact strip — same numbers/words as dashboard KPIs, with list CTAs. */
const SYSTEM_PULSE: MetricPulse[] = [
  {
    id: "failures",
    label: "Failures",
    value: "441",
    hint: "devices",
    title: "441 predicted failures",
    detail:
      "Risk concentrates on 4 West calibration drift and overdue PM.",
    cta: "View list",
    source: "Cal records · Risk model",
    rows: [
      {
        name: "4 West SpO₂ sensors (×4)",
        meta: "Drift ±2.8% · last cal 92d",
        status: "High risk",
        tone: "critical",
      },
      {
        name: "ICU West infusion pumps",
        meta: "Retry spike after v2.14",
        status: "High risk",
        tone: "critical",
      },
      {
        name: "Ventilator #6",
        meta: "Safety inspection open",
        status: "Watch",
        tone: "warning",
      },
      {
        name: "MRI Suite A coil set",
        meta: "PM overdue · Radiology",
        status: "Watch",
        tone: "warning",
      },
      {
        name: "ER stretcher fleet (12)",
        meta: "Battery health declining",
        status: "Monitor",
        tone: "neutral",
      },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    value: "179",
    hint: "tasks",
    title: "179 active maintenance tasks",
    detail:
      "Radiology MRI Suite A and ICU West pumps hold most of the open window.",
    cta: "View list",
    source: "PM ledger · Department queue",
    rows: [
      {
        name: "MRI Suite A — preventative",
        meta: "Radiology · due this week",
        status: "Overdue",
        tone: "critical",
      },
      {
        name: "ICU West pumps — firmware",
        meta: "12 devices · staged rollback",
        status: "In progress",
        tone: "warning",
      },
      {
        name: "Ventilators — safety inspection",
        meta: "ER · 6 devices",
        status: "Due tonight",
        tone: "warning",
      },
      {
        name: "Philips vent contract",
        meta: "Expires in 5 days",
        status: "Admin",
        tone: "neutral",
      },
      {
        name: "4 West cal bay hold",
        meta: "Batch after last case",
        status: "Scheduled",
        tone: "neutral",
      },
    ],
  },
  {
    id: "resolution",
    label: "Resolution",
    value: "4.3",
    hint: "hours",
    title: "Average resolution 4.3 hours",
    detail:
      "Slightly slower than last week — first-case delay and ICU West retries.",
    cta: "View trend",
    source: "Work orders · Telemetry",
    series: [4.0, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3],
    seriesLabel: "Avg hours · last 7 days",
    seriesTone: "bad",
    rows: [
      {
        name: "WO-4821 · Vent #6 inspection",
        meta: "Opened 6.2h ago · Biomed",
        status: "6.2h",
        tone: "warning",
      },
      {
        name: "WO-4814 · ICU West pump cluster",
        meta: "Opened 5.1h ago · Night shift",
        status: "5.1h",
        tone: "warning",
      },
      {
        name: "WO-4809 · MRI Suite A PM",
        meta: "Closed yesterday · 3.8h",
        status: "3.8h",
        tone: "neutral",
      },
      {
        name: "WO-4802 · 4 West sensor swap",
        meta: "Closed yesterday · 4.9h",
        status: "4.9h",
        tone: "warning",
      },
      {
        name: "WO-4795 · PACU float coverage",
        meta: "Closed Tue · 2.4h",
        status: "2.4h",
        tone: "neutral",
      },
    ],
  },
  {
    id: "fleet",
    label: "Fleet",
    value: "77%",
    hint: "available",
    title: "77% of fleet available",
    detail:
      "Held down by 253 offline and 339 critical. ICU West is the fastest slip.",
    cta: "View mix",
    source: "Telemetry · Fleet inventory",
    series: [72, 73, 74, 74, 75, 76, 77],
    seriesLabel: "Availability % · last 7 days",
    seriesTone: "good",
    rows: [
      {
        name: "Healthy",
        meta: "6,940 devices",
        status: "82%",
        tone: "neutral",
      },
      {
        name: "Warning",
        meta: "931 devices",
        status: "11%",
        tone: "warning",
      },
      {
        name: "Critical",
        meta: "339 devices",
        status: "4%",
        tone: "critical",
      },
      {
        name: "Offline",
        meta: "253 devices",
        status: "3%",
        tone: "critical",
      },
      {
        name: "ICU West slip",
        meta: "Retry spike · pumps",
        status: "Hot",
        tone: "warning",
      },
    ],
  },
];

const rowToneClass = {
  critical: "bg-red-50 text-red-800 ring-red-200/80",
  warning: "bg-amber-50 text-amber-900 ring-amber-200/80",
  neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
} as const;

function MetricSpark({
  values,
  tone,
  className,
}: {
  values: number[];
  tone: "bad" | "good";
  className?: string;
}) {
  const w = 72;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  });
  const line = pts.join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const stroke = tone === "good" ? "#17C964" : "#F31260";
  const fill =
    tone === "good" ? "rgba(23,201,100,0.14)" : "rgba(243,18,96,0.12)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-[22px] w-[72px]", className)}
      aria-hidden
    >
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricTrendChart({
  values,
  tone,
  label,
}: {
  values: number[];
  tone: "bad" | "good";
  label: string;
}) {
  const w = 320;
  const h = 96;
  const pad = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return { x, y, v };
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area = `${line} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
  const stroke = tone === "good" ? "#17C964" : "#F31260";
  const fill =
    tone === "good" ? "rgba(23,201,100,0.12)" : "rgba(243,18,96,0.1)";

  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-24 w-full" aria-hidden>
        <path d={area} fill={fill} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 3.5 : 2.25}
            fill={i === pts.length - 1 ? stroke : "#fff"}
            stroke={stroke}
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>7 days ago</span>
        <span className="font-semibold tabular-nums text-slate-700">
          Now · {values[values.length - 1]}
          {tone === "good" ? "%" : "h"}
        </span>
      </div>
    </div>
  );
}

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
      className="flex h-7 w-7 shrink-0 items-center justify-center"
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
    </span>
  );
}

export function EmptyState({
  onOpenDecision,
  onOpenWorkflow,
}: {
  onOpenDecision: (caseId: string) => void;
  onOpenWorkflow: (jobId: string) => void;
}) {
  const [openMetricId, setOpenMetricId] = useState<MetricPulse["id"] | null>(
    null
  );
  const openMetric =
    SYSTEM_PULSE.find((item) => item.id === openMetricId) ?? null;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col pb-2">
      <div className="flex shrink-0 flex-wrap items-end gap-x-5 gap-y-2 border-b border-slate-100 pb-3.5">
        {SYSTEM_PULSE.map((item) => (
          <HoverCard key={item.id} openDelay={120} closeDelay={120}>
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
              className="z-[600] w-[22rem] space-y-3 bg-white p-3 shadow-lg"
            >
              <div>
                <p className="text-[13px] font-semibold leading-snug text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-slate-600">
                  {item.detail}
                </p>
              </div>
              {item.series && item.seriesTone && item.seriesLabel ? (
                <div className="rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200/80">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {item.seriesLabel}
                  </p>
                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <MetricSpark
                      values={item.series}
                      tone={item.seriesTone}
                      className="h-7 w-28"
                    />
                    <span className="text-[12px] font-semibold tabular-nums text-slate-800">
                      {item.series[item.series.length - 1]}
                      {item.seriesTone === "good" ? "%" : "h"}
                    </span>
                  </div>
                </div>
              ) : null}
              <ul className="space-y-1.5">
                {item.rows.slice(0, 3).map((row) => (
                  <li
                    key={row.name}
                    className="flex items-start justify-between gap-2 text-[11px]"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800">
                        {row.name}
                      </span>
                      <span className="text-slate-500">{row.meta}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        rowToneClass[row.tone]
                      )}
                    >
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-400">{item.source}</p>
              <button
                type="button"
                onClick={() => setOpenMetricId(item.id)}
                className="motion-interactive w-full rounded-lg bg-[#2859C5] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1e4aa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
              >
                {item.cta}
              </button>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>

      <Dialog
        open={openMetricId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenMetricId(null);
        }}
      >
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
          {openMetric ? (
            <>
              <DialogHeader className="border-b border-slate-100 px-5 py-4 pr-12">
                <DialogTitle>{openMetric.title}</DialogTitle>
                <DialogDescription>{openMetric.detail}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[min(28rem,60vh)] space-y-4 overflow-y-auto px-5 py-4">
                {openMetric.series &&
                openMetric.seriesTone &&
                openMetric.seriesLabel ? (
                  <MetricTrendChart
                    values={openMetric.series}
                    tone={openMetric.seriesTone}
                    label={openMetric.seriesLabel}
                  />
                ) : null}
                <ul className="space-y-2">
                  {openMetric.rows.map((row) => (
                    <li
                      key={row.name}
                      className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-200/70"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900">
                          {row.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.meta}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                          rowToneClass[row.tone]
                        )}
                      >
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400">{openMetric.source}</p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mt-4 shrink-0">
        <div className="mb-2 flex items-baseline justify-between gap-3">
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

        <ul className="flex flex-col gap-2">
          {ASSISTANT_PROMPT_OPTIONS.map((item) => {
            const tone = accentClass[item.accent];
            return (
              <li key={item.rank}>
                <button
                  type="button"
                  onClick={() => onOpenDecision(item.caseId)}
                  className={cn(
                    "motion-interactive group flex w-full gap-2.5 rounded-xl px-3 py-2.5 text-left sm:gap-3 sm:px-3.5 sm:py-3",
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
                    <span className="text-[14px] font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-0.5 line-clamp-2 max-w-2xl text-[12px] leading-snug text-slate-500">
                      {item.consequence}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
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
                      "hidden shrink-0 self-center rounded-lg px-2 py-1 text-[11px] font-semibold text-[#2859C5] sm:inline",
                      "transition-[background-color,color,box-shadow,transform] duration-150",
                      "group-hover:bg-blue-50/80 group-hover:text-[#1e4aa8]",
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

      <div className="mt-5 shrink-0">
        <div className="mb-2 flex items-baseline justify-between gap-3">
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
                onClick={() => onOpenWorkflow(item.key)}
                className={cn(
                  "motion-interactive flex h-full w-full gap-2.5 px-3 py-2.5 text-left sm:py-3",
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
                  <span className="mt-0.5 block text-[13px] font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-slate-500">
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
