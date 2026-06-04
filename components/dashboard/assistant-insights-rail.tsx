"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InsightActionDialog,
  type InsightActionContext,
  type InsightActionId,
} from "@/components/dashboard/insight-action-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Info,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InsightSignal = {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "critical";
};

type Insight = {
  id: InsightActionId;
  title: string;
  body: string;
  action: string;
  confidence: number;
  level: "High" | "Med";
  icon: typeof Clock;
  theme: "emerald" | "blue";
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

const insightTooltipArrowClassName = "fill-sky-50 bg-sky-50";

const insights: Insight[] = [
  {
    id: "reallocate_staff",
    title: "Throughput delay risk",
    body: "Recovery staffing looks light for today’s OR block — adjust if cases run long.",
    action: "Reallocate staff",
    confidence: 87,
    level: "High",
    icon: Clock,
    theme: "emerald",
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
    icon: LineChart,
    theme: "blue",
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
    icon: ShieldCheck,
    theme: "blue",
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

const themes = {
  emerald: {
    card: "border-teal-200/60 bg-teal-50/40",
    icon: "bg-teal-500/15 text-teal-700",
    bar: "from-teal-500 to-teal-400",
    btn: "border-teal-200/80 bg-white text-teal-900 hover:bg-teal-50",
  },
  blue: {
    card: "border-blue-200/60 bg-blue-50/40",
    icon: "bg-blue-500/15 text-blue-700",
    bar: "from-blue-600 to-blue-400",
    btn: "border-blue-200/80 bg-white text-blue-900 hover:bg-blue-50",
  },
};

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
      className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden bg-slate-50/50 pb-4 lg:h-full lg:w-[300px] lg:pb-5 xl:w-[320px]"
      aria-label="Intelligence context"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pt-0 lg:px-0 lg:pt-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-sm font-semibold text-slate-800">
            Today’s insights
          </h2>
          <button type="button" className={seeMoreClassName}>
            See more
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {insights.map((item) => {
            const T = themes[item.theme];
            const Icon = item.icon;
            return (
              <li key={item.title}>
                <div
                  className={cn(
                    "flex w-full flex-col rounded-xl border p-3 text-left shadow-sm transition-shadow",
                    "hover:shadow-md",
                    T.card
                  )}
                >
                  <Tooltip delayDuration={280}>
                    <TooltipTrigger asChild>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`View AI reasoning for ${item.title}`}
                        className="w-full cursor-default text-left outline-none ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-0 data-[state=delayed-open]:ring-0 data-[state=instant-open]:ring-0"
                      >
                        <div className="flex min-h-0 gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              T.icon
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-semibold leading-tight text-slate-900">
                                {item.title}
                              </p>
                              <Info
                                className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
                                aria-hidden
                              />
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600">
                              {item.body}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 shrink-0">
                          <div className="mb-0.5 flex items-center justify-between text-[10px]">
                            <span className="font-medium text-slate-500">
                              Confidence ·{" "}
                              <span className="text-slate-800">{item.level}</span>
                            </span>
                            <span className="tabular-nums font-semibold text-slate-700">
                              {item.confidence}%
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/80">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r",
                                T.bar
                              )}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      align="start"
                      collisionPadding={12}
                      arrowClassName={insightTooltipArrowClassName}
                      className={insightTooltipClassName}
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
                              <span className="text-slate-500">{signal.label}</span>
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
                          <span className="text-[10px] text-slate-500">Signal strength</span>
                        </div>
                        <div
                          className="mt-2 flex h-8 items-end gap-1"
                          aria-hidden
                        >
                          {item.sparkline.map((point, index) => (
                            <div
                              key={`${item.id}-spark-${index}`}
                              className="min-w-0 flex-1 rounded-sm bg-blue-500/75"
                              style={{ height: `${Math.max(18, point)}%` }}
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
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(item)}
                    className={cn(
                      "motion-interactive mt-2 h-7 shrink-0 rounded-xl text-[11px] active:scale-[0.98]",
                      T.btn
                    )}
                  >
                    {item.action}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <section className="shrink-0 px-3 pb-4 pt-5 lg:px-0 lg:pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-sm font-semibold text-slate-800">
            Quick actions
          </h2>
          <button type="button" className={seeMoreClassName}>
            See more
          </button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {quickActions.map(({ label, icon: QIcon }) => (
            <li key={label}>
              <button
                type="button"
                className="motion-interactive flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-left shadow-sm hover:border-blue-200/80 hover:bg-blue-50/40 hover:shadow-md active:scale-[0.99]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
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
