"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InsightActionDialog,
  type InsightActionContext,
  type InsightActionId,
} from "@/components/dashboard/insight-action-dialog";
import { AIResponseFeedback } from "@/components/assistant/ai-response-feedback";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Activity,
  Calendar,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Gauge,
  Info,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InsightSignal = {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "critical";
};

type InsightRank = "lead" | "next" | "watch";

type Insight = {
  id: InsightActionId;
  title: string;
  body: string;
  action: string;
  confidence: number;
  level: "High" | "Med";
  icon: typeof Clock;
  rank: InsightRank;
  signals: InsightSignal[];
  /** Seven-day trend points (0–100) shown in the hover detail. */
  sparkline: number[];
  reasoning: string[];
  sources: string[];
};

const signalToneClass = {
  neutral: "bg-white/90 text-slate-700 ring-slate-200/80",
  warning: "bg-amber-50 text-amber-900 ring-amber-200/80",
  critical: "bg-red-50 text-red-800 ring-red-200/80",
} as const;

const insightTooltipClassName =
  "max-w-[min(100vw-2rem,24rem)] space-y-2.5 border-blue-200/90 bg-gradient-to-br from-sky-50 via-blue-50 to-blue-100/90 p-3 text-slate-800 shadow-lg shadow-blue-900/10";

const insights: Insight[] = [
  {
    id: "reallocate_staff",
    title: "Throughput delay risk",
    body: "Recovery staffing looks light for today’s OR block — adjust if cases run long.",
    action: "Reallocate staff",
    confidence: 87,
    level: "High",
    icon: Clock,
    rank: "lead",
    signals: [
      { label: "OR delay", value: "+38 min", tone: "critical" },
      { label: "Recovery roster", value: "-2 RNs", tone: "warning" },
      { label: "Queued cases", value: "3", tone: "neutral" },
    ],
    sparkline: [42, 48, 51, 55, 58, 62, 68],
    reasoning: [
      "Today’s main OR block is tracking 38 min past the planned end time.",
      "Recovery roster is 2 RNs below the coverage model for this block.",
      "Three cases still queued with average case length above the 6-week Tuesday baseline.",
    ],
    sources: ["OR schedule", "Staff roster", "Case duration model"],
  },
  {
    id: "schedule_diagnostic",
    title: "Device performance slip",
    body: "ICU West pumps are retrying more often after the last firmware update.",
    action: "Schedule diagnostic",
    confidence: 92,
    level: "High",
    icon: Activity,
    rank: "next",
    signals: [
      { label: "Retry rate", value: "12.4%", tone: "critical" },
      { label: "vs baseline", value: "3.2×", tone: "warning" },
      { label: "Firmware", value: "v2.14", tone: "neutral" },
    ],
    sparkline: [22, 28, 31, 45, 58, 72, 81],
    reasoning: [
      "Firmware v2.14 rolled out to ICU West 6 days ago; retry events spiked within 48 hours.",
      "Retry rate is 3.2× the pre-update baseline and 2.8× the east ICU control group.",
      "No matching spike on battery, connectivity, or utilization metrics — points to firmware regression.",
    ],
    sources: ["Device telemetry", "Firmware audit log", "Fleet baselines"],
  },
  {
    id: "open_calibration_queue",
    title: "Calibration drift cluster",
    body: "Telemetry on 4 West is drifting from the last vendor baseline — review calibrations.",
    action: "Open calibration queue",
    confidence: 76,
    level: "Med",
    icon: Gauge,
    rank: "watch",
    signals: [
      { label: "Drift band", value: "±2.8%", tone: "warning" },
      { label: "Sensors", value: "4", tone: "neutral" },
      { label: "Last cal", value: "92d ago", tone: "warning" },
    ],
    sparkline: [18, 22, 28, 35, 42, 48, 54],
    reasoning: [
      "Four telemetry sensors on 4 West exceed the ±2% vendor tolerance band.",
      "Drift accelerated over the last 14 days; cluster is localized to one wing, not hospital-wide.",
      "Last vendor calibration was 92 days ago — approaching the 90-day PM window edge.",
    ],
    sources: ["Calibration records", "Telemetry stream", "Vendor baseline"],
  },
];

const ranks: Record<
  InsightRank,
  {
    icon: string;
    spark: string;
  }
> = {
  lead: {
    icon: "bg-rose-500/12 text-rose-800",
    spark: "bg-blue-500/75",
  },
  next: {
    icon: "bg-amber-500/12 text-amber-800",
    spark: "bg-blue-500/75",
  },
  watch: {
    icon: "bg-teal-500/12 text-teal-800",
    spark: "bg-blue-500/75",
  },
};

const confidenceChipClass: Record<Insight["level"], string> = {
  High: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  Med: "bg-amber-50 text-amber-950 ring-amber-200/70",
};

const insightCardClass = cn(
  "group/insight flex w-full flex-col rounded-xl border border-slate-200/80 bg-white p-3 text-left",
  "transition-[border-color,background-color,box-shadow] duration-150",
  "hover:border-slate-300/90 hover:bg-slate-50/60 hover:shadow-sm"
);

const insightActionButtonClass = cn(
  "motion-interactive h-7 w-full shrink-0 rounded-lg border border-[#8FBFFA] bg-white text-[11px] font-semibold text-[#2859C5] shadow-none",
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
  "group-hover/insight:border-[#2859C5] group-hover/insight:bg-blue-50/80 group-hover/insight:text-[#1e4aa8]",
  "hover:border-[#2859C5] hover:bg-[#2859C5] hover:text-white hover:shadow-sm hover:shadow-blue-600/20",
  "active:scale-[0.98]"
);

const quickActions = [
  { label: "Daily ops report", icon: FileText },
  { label: "Export device data", icon: Download },
  { label: "System health check", icon: ShieldCheck },
  { label: "Review schedule", icon: Calendar },
  { label: "Open action queue", icon: ClipboardList },
];

const seeMoreClassName =
  "shrink-0 text-[11px] font-semibold text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline";

export function AssistantInsightsRail() {
  const [actionInsight, setActionInsight] =
    useState<InsightActionContext | null>(null);
  const [actionOpen, setActionOpen] = useState(false);

  function openActionModal(item: Insight) {
    setActionInsight({
      id: item.id,
      title: item.title,
      action: item.action,
      body: item.body,
      confidence: item.confidence,
    });
    setActionOpen(true);
  }

  return (
    <>
      <aside
        className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden bg-slate-50/50 pb-2 lg:w-[300px] lg:pb-3 xl:w-[320px]"
        aria-label="Intelligence context"
      >
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-0 lg:px-0">
          <div className="flex shrink-0 items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Today's insights
            </h2>
            <button type="button" className={seeMoreClassName}>
              See more
            </button>
          </div>

          <ul className="mt-2.5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain">
            {insights.map((item) => {
              const T = ranks[item.rank];
              const Icon = item.icon;
              return (
                <li key={item.title} className="shrink-0">
                  <div className={insightCardClass}>
                    <HoverCard openDelay={280} closeDelay={160}>
                      <HoverCardTrigger asChild>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`View AI reasoning for ${item.title}`}
                          className="w-full cursor-pointer text-left outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-0"
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                                T.icon
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0">
                                  <p className="text-[12px] font-semibold leading-snug text-slate-900">
                                    {item.title}
                                  </p>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                    <span className="text-[9px] font-medium tabular-nums text-slate-400">
                                      Confidence · {item.confidence}%
                                    </span>
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded px-1 py-px text-[8px] font-semibold uppercase leading-none tracking-[0.06em] ring-1",
                                        confidenceChipClass[item.level]
                                      )}
                                    >
                                      {item.level}
                                    </span>
                                  </div>
                                </div>
                                <Info
                                  className="mt-0.5 h-3 w-3 shrink-0 text-slate-400 transition-colors group-hover/insight:text-slate-500"
                                  aria-hidden
                                />
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 text-[12px] leading-snug text-slate-600">
                            {item.body}
                          </p>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="left"
                        align="start"
                        collisionPadding={12}
                        className={cn(
                          "z-[600] w-[min(100vw-2rem,24rem)] pointer-events-auto",
                          insightTooltipClassName
                        )}
                      >
                        <div>
                          <p className="text-[13px] font-semibold leading-snug text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[12px] leading-snug text-slate-600">
                            {item.body}
                          </p>
                        </div>

                        <div className="border-t border-blue-200/70 pt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Key signals
                          </p>
                          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.signals.map((signal) => (
                              <li
                                key={`${signal.label}-${signal.value}`}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                                  signalToneClass[signal.tone ?? "neutral"]
                                )}
                              >
                                <span className="text-slate-500">
                                  {signal.label}
                                </span>
                                <span>{signal.value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-blue-200/70 pt-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              7-day trend
                            </p>
                            <span className="text-[10px] text-slate-500">
                              Signal strength
                            </span>
                          </div>
                          <div
                            className="mt-2 flex h-8 items-end gap-1"
                            aria-hidden
                          >
                            {item.sparkline.map((point, index) => (
                              <div
                                key={`${item.id}-spark-${index}`}
                                className={cn(
                                  "min-w-0 flex-1 rounded-sm",
                                  T.spark
                                )}
                                style={{
                                  height: `${Math.max(18, point)}%`,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-blue-200/70 pt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            How we concluded
                          </p>
                          <ul className="mt-1.5 space-y-1.5 text-[12px] leading-snug text-slate-700">
                            {item.reasoning.map((line) => (
                              <li key={line} className="flex gap-2">
                                <span
                                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-600"
                                  aria-hidden
                                />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-blue-200/70 pt-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Data sources
                          </p>
                          <p className="mt-1 text-[11px] leading-snug text-slate-600">
                            {item.sources.join(" · ")}
                          </p>
                        </div>

                        <p className="border-t border-blue-200/70 pt-2 text-[11px] text-slate-500">
                          Confidence {item.confidence}% · {item.level}
                        </p>

                        <AIResponseFeedback
                          responseId={`insight:${item.id}`}
                          source="insight-hover"
                          variant="compact"
                        />
                      </HoverCardContent>
                    </HoverCard>

                    <div className="mt-2.5 border-t border-slate-100 pt-2.5 transition-colors group-hover/insight:border-slate-200/90">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openActionModal(item)}
                        className={insightActionButtonClass}
                      >
                        {item.action}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <section className="shrink-0 px-3 pb-1 pt-3 lg:px-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 text-sm font-semibold text-slate-800">
              Quick actions
            </h2>
            <button type="button" className={seeMoreClassName}>
              See more
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {quickActions.map(({ label, icon: QIcon }) => (
              <li key={label}>
                <button
                  type="button"
                  className="motion-interactive flex w-full items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2 py-1.5 text-left hover:border-slate-300 hover:bg-slate-50/80 active:scale-[0.99]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <QIcon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-[11px] font-medium leading-snug text-slate-800">
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>
      <InsightActionDialog
        insight={actionInsight}
        open={actionOpen}
        onOpenChange={setActionOpen}
      />
    </>
  );
}
