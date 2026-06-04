"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardGridGap,
} from "@/lib/dashboard-surface";

type Urgency = "critical" | "caution" | "positive" | "neutral";

const metrics: {
  title: string;
  value: string;
  sub: string;
  urgency: Urgency;
  /** Higher numeric values in spark = worse for user interpretation when trendBad. */
  trendBad: boolean;
  trendPct: string;
  trendLabel: string;
  trendDir: "up" | "down";
  spark: number[];
  comparison: string;
  filterParam: string | null;
  icon: typeof Activity;
  focal: boolean;
}[] = [
  {
    title: "At-risk devices",
    value: "441",
    sub: "devices",
    urgency: "caution",
    trendBad: true,
    trendPct: "+5.2%",
    trendLabel: "from last week",
    trendDir: "up",
    spark: [398, 405, 412, 418, 424, 432, 441],
    comparison: "Risks concentrated in ICU and imaging — triage there first.",
    filterParam: "critical",
    icon: Activity,
    focal: false,
  },
  {
    title: "Active maintenance",
    value: "179",
    sub: "tasks",
    urgency: "caution",
    trendBad: true,
    trendPct: "+2.1%",
    trendLabel: "from last week",
    trendDir: "up",
    spark: [162, 165, 168, 170, 172, 176, 179],
    comparison: "Backlog inching up — batch radiology PMs this week.",
    filterParam: "overdue",
    icon: Wrench,
    focal: false,
  },
  {
    title: "Average resolution time",
    value: "4.3",
    sub: "hours",
    urgency: "positive",
    trendBad: true,
    trendPct: "-14%",
    trendLabel: "from last week",
    trendDir: "down",
    spark: [5.1, 4.95, 4.8, 4.65, 4.55, 4.4, 4.3],
    comparison: "Repair times improving vs last week.",
    filterParam: null,
    icon: Clock,
    focal: false,
  },
  {
    title: "Fleet availability",
    value: "77%",
    sub: "online",
    urgency: "positive",
    trendBad: false,
    trendPct: "+1.4%",
    trendLabel: "from last week",
    trendDir: "up",
    spark: [72, 73, 74, 74, 75, 76, 77],
    comparison: "Near internal target for online fleet.",
    filterParam: null,
    icon: CheckCircle,
    focal: false,
  },
];

function Sparkline({
  values,
  accentClass,
  compact,
}: {
  values: number[];
  accentClass: string;
  compact?: boolean;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 100;
  const h = compact ? 18 : 28;
  const pad = 4;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const t = (v - min) / span;
    const y = h - pad - t * (h - pad * 2);
    return `${x},${y}`;
  });
  const d = `M ${pts.join(" L ")}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn(
        "w-full",
        compact ? "h-5 max-w-[72px]" : "h-8 max-w-[140px]"
      )}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        strokeWidth={2}
        className={accentClass}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const urgencyStyles: Record<Urgency, { spark: string; iconBg: string }> = {
  critical: {
    spark: "stroke-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
  },
  caution: {
    spark: "stroke-amber-600",
    iconBg: "bg-slate-100 text-blue-600",
  },
  positive: {
    spark: "stroke-emerald-600",
    iconBg: "bg-slate-100 text-blue-600",
  },
  neutral: {
    spark: "stroke-slate-500",
    iconBg: "bg-slate-100 text-blue-600",
  },
};

export function KpiCards({
  density = "default",
  onToast,
}: {
  density?: "default" | "dashboard";
  onToast?: (message: string) => void;
}) {
  const router = useRouter();
  const dash = density === "dashboard";

  return (
    <div
      className={cn(
        "grid",
        dashboardCardGridGap,
        dash ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {metrics.map((metric) => {
        const u = urgencyStyles[metric.urgency];
        const TrendIcon = metric.trendDir === "up" ? ArrowUpRight : ArrowDownRight;
        const trendLooksBad =
          metric.trendDir === "up"
            ? metric.trendBad
            : !metric.trendBad;
        return (
          <Tooltip key={metric.title}>
            <TooltipTrigger asChild>
              <Card
                role={metric.filterParam ? "button" : undefined}
                tabIndex={metric.filterParam ? 0 : undefined}
                onClick={() => {
                  if (!metric.filterParam) return;
                  router.push(`/dashboard?filter=${metric.filterParam}`);
                  onToast?.(`Showing queue: ${metric.title}`);
                }}
                onKeyDown={(e) => {
                  if (!metric.filterParam) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/dashboard?filter=${metric.filterParam}`);
                    onToast?.(`Showing queue: ${metric.title}`);
                  }
                }}
                className={cn(
                  "group/kpi gap-0 overflow-hidden py-0 text-left transition-[box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
                  dashboardCardClass,
                  dash && "min-h-0",
                  metric.filterParam
                    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    : "",
                  "hover:shadow-[0_16px_48px_-14px_rgb(99_102_241/0.14)]"
                )}
              >
                <CardContent
                  className={cn(
                    "px-0",
                    dash ? "space-y-3 p-5" : "space-y-4 p-6"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span
                        className={cn(
                          "font-bold leading-none tracking-tight text-slate-950 tabular-nums",
                          dash ? "text-2xl sm:text-[1.75rem]" : "text-3xl sm:text-4xl"
                        )}
                      >
                        {metric.value}
                      </span>
                      <span
                        className={cn(
                          "font-medium text-slate-400",
                          dash ? "text-xs" : "text-sm"
                        )}
                      >
                        {metric.sub}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-lg",
                        dash ? "h-8 w-8" : "h-9 w-9",
                        u.iconBg
                      )}
                    >
                      <metric.icon
                        className={dash ? "h-4 w-4" : "h-[18px] w-[18px]"}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <p
                    className={cn(
                      "font-semibold text-slate-900",
                      dash ? "text-sm" : "text-base"
                    )}
                  >
                    {metric.title}
                  </p>

                  <div className="flex items-end justify-between gap-3">
                    <div
                      className={cn(
                        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5",
                        dash ? "text-xs" : "text-sm"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                          trendLooksBad ? "text-rose-600" : "text-emerald-600"
                        )}
                      >
                        <TrendIcon
                          className={dash ? "h-3.5 w-3.5" : "h-4 w-4"}
                          aria-hidden
                        />
                        {metric.trendPct}
                      </span>
                      <span className="text-slate-500">{metric.trendLabel}</span>
                    </div>
                    <Sparkline
                      values={metric.spark}
                      accentClass={u.spark}
                      compact={dash}
                    />
                  </div>

                  {!dash ? (
                    <p className="text-[11px] leading-snug text-slate-600">
                      {metric.comparison}
                    </p>
                  ) : null}
                  {metric.filterParam ? (
                    <p
                      className={cn(
                        "font-semibold text-blue-700/85 opacity-0 transition-[opacity,color] duration-[var(--motion-duration-fast)] group-hover/kpi:opacity-100",
                        dash ? "text-[10px]" : "text-[11px]"
                      )}
                    >
                      Click to filter action queue →
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Insight
              </p>
              <p className="mt-1 text-[13px] leading-snug text-slate-100">
                {metric.comparison}
              </p>
              {metric.filterParam ? (
                <p className="mt-2 border-t border-white/15 pt-2 text-[11px] text-slate-400">
                  Click or press Enter to open a filtered action queue.
                </p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
