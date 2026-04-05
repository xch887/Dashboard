"use client";

import { Button } from "@/components/ui/button";
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
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const insights = [
  {
    title: "Throughput delay risk",
    body: "OR block trending below target — consider reallocating recovery staff.",
    action: "Reallocate staff",
    confidence: 87,
    level: "High" as const,
    icon: Clock,
    theme: "emerald" as const,
  },
  {
    title: "Device performance slip",
    body: "ICU West infusion pumps — elevated retries after firmware push.",
    action: "Schedule diagnostic",
    confidence: 92,
    level: "High" as const,
    icon: LineChart,
    theme: "blue" as const,
  },
  {
    title: "Calibration drift cluster",
    body: "Telemetry batch on 4 West — model flags drift vs. last OEM baseline.",
    action: "Open calibration queue",
    confidence: 76,
    level: "Med" as const,
    icon: ShieldCheck,
    theme: "blue" as const,
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
  return (
    <aside
      className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-slate-200/80 bg-slate-50/50 lg:h-full lg:w-[300px] lg:border-l lg:border-t-0 xl:w-[320px]"
      aria-label="Intelligence context"
    >
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 lg:px-5 lg:pt-5">
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "motion-interactive flex w-full flex-col rounded-md border p-3 text-left shadow-sm ring-1 ring-black/[0.03]",
                        "hover:shadow-md",
                        "cursor-default outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                        T.card
                      )}
                    >
                      <div className="flex min-h-0 gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                            T.icon
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold leading-tight text-slate-900">
                            {item.title}
                          </p>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "motion-interactive mt-2 h-7 shrink-0 rounded-md text-[11px] active:scale-[0.98]",
                          T.btn
                        )}
                      >
                        {item.action}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="max-w-[min(100vw-2rem,20rem)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-slate-100">
                      {item.body}
                    </p>
                    <p className="mt-2 border-t border-white/15 pt-2 text-[11px] text-slate-400">
                      Confidence {item.confidence}% · {item.level}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>

      <section className="shrink-0 border-t border-slate-200/80 bg-white/90 px-4 py-4 lg:px-5">
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
                className="motion-interactive flex w-full items-center gap-2 rounded-md border border-slate-200/80 bg-white px-2 py-2 text-left shadow-sm hover:border-blue-200/80 hover:bg-blue-50/40 hover:shadow-md active:scale-[0.99]"
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
  );
}
