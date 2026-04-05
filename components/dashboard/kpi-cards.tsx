"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";

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

const urgencyStyles: Record<
  Urgency,
  { bar: string; tint: string; ring: string; spark: string }
> = {
  critical: {
    bar: "bg-rose-500",
    tint: "bg-rose-50/90",
    ring: "ring-rose-200/80",
    spark: "stroke-rose-500",
  },
  caution: {
    bar: "bg-amber-500",
    tint: "bg-amber-50/50",
    ring: "ring-amber-200/70",
    spark: "stroke-amber-600",
  },
  positive: {
    bar: "bg-emerald-500",
    tint: "bg-emerald-50/40",
    ring: "ring-emerald-200/70",
    spark: "stroke-emerald-600",
  },
  neutral: {
    bar: "bg-slate-300",
    tint: "bg-slate-50/80",
    ring: "ring-slate-200/80",
    spark: "stroke-slate-500",
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
        dash
          ? "grid-cols-2 gap-2 sm:gap-2 lg:grid-cols-4 lg:gap-2.5"
          : "grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5"
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
                  "group/kpi relative overflow-hidden rounded-2xl bg-white text-left transition-[box-shadow,border-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
                  dashboardTileOutline,
                  dash && "min-h-0 lg:min-h-[112px]",
                  metric.filterParam
                    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    : "",
                  metric.focal
                    ? dash
                      ? "shadow-[0_12px_40px_-14px_rgb(37_99_235/0.2)]"
                      : "border-blue-600/30 shadow-[0_22px_44px_-20px_rgb(37_99_235/0.28)] ring-1 ring-blue-600/18"
                    : dash
                      ? cn(
                          dashboardTileShadow,
                          "hover:border-black/30 hover:shadow-[0_12px_36px_-12px_rgb(15_23_42/0.12)]"
                        )
                      : "border-slate-200/80 shadow-[0_2px_8px_-2px_rgb(15_23_42/0.04)] ring-1 hover:border-slate-300/90 hover:shadow-[0_10px_24px_-14px_rgb(15_23_42/0.09)] hover:ring-slate-300/60",
                  u.tint,
                  !dash && !metric.focal && u.ring
                )}
              >
            <span
              className={cn(
                "absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl",
                u.bar
              )}
              aria-hidden
            />
            <CardHeader
              className={cn(
                "flex flex-row items-start justify-between space-y-0",
                dash
                  ? "gap-1.5 pb-1 pl-2.5 pt-2.5"
                  : cn(
                      "gap-3 pb-2 pl-4 pt-5",
                      metric.focal && "sm:pt-6"
                    )
              )}
            >
              <CardTitle
                className={cn(
                  "font-semibold uppercase leading-none tracking-[0.12em]",
                  dash ? "text-[9px] tracking-[0.1em]" : "text-[10px] tracking-[0.12em]",
                  metric.focal ? "text-blue-900/85" : "text-slate-400"
                )}
              >
                {metric.title}
              </CardTitle>
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg text-blue-700",
                  dash &&
                    (metric.focal
                      ? "h-6 w-6 bg-blue-600/12"
                      : "h-5 w-5 bg-blue-500/[0.08]"),
                  !dash &&
                    (metric.focal
                      ? "h-9 w-9 bg-blue-600/12 sm:h-10 sm:w-10"
                      : "h-7 w-7 bg-blue-500/[0.08] sm:h-8 sm:w-8")
                )}
              >
                <metric.icon
                  className={cn(
                    dash &&
                      (metric.focal ? "h-3 w-3" : "h-2.5 w-2.5"),
                    !dash &&
                      (metric.focal ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3.5 w-3.5")
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </CardHeader>
            <CardContent
              className={cn(
                "pt-0",
                dash
                  ? "space-y-1 pb-2 pl-2.5"
                  : cn(
                      "space-y-3 pb-5 pl-4",
                      metric.focal && "sm:pb-6"
                    )
              )}
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      "font-extrabold leading-none tracking-tight text-slate-950 tabular-nums",
                      metric.focal
                        ? dash
                          ? "text-xl sm:text-2xl"
                          : "text-[2.25rem] sm:text-[2.75rem] md:text-[3rem]"
                        : dash
                          ? "text-base sm:text-lg"
                          : "text-[1.5rem] sm:text-[1.875rem] md:text-[2rem]"
                    )}
                  >
                    {metric.value}
                  </span>
                  <span
                    className={cn(
                      "font-medium text-slate-400",
                      metric.focal
                        ? dash
                          ? "text-[10px]"
                          : "text-xs"
                        : dash
                          ? "text-[10px]"
                          : "text-[11px]"
                    )}
                  >
                    {metric.sub}
                  </span>
                </div>
                <Sparkline
                  values={metric.spark}
                  accentClass={u.spark}
                  compact={dash}
                />
              </div>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  dash ? "text-[9px]" : "text-[11px]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold tabular-nums",
                    trendLooksBad
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  )}
                >
                  <TrendIcon
                    className={dash ? "h-3 w-3" : "h-3.5 w-3.5"}
                    aria-hidden
                  />
                  {metric.trendPct}
                </span>
                <span className="text-slate-400">{metric.trendLabel}</span>
              </div>
              <p
                className={cn(
                  "leading-snug text-slate-600",
                  dash
                    ? "line-clamp-2 text-[9px] leading-snug"
                    : "text-[11px]"
                )}
              >
                {metric.comparison}
              </p>
              {metric.filterParam ? (
                <p
                  className={cn(
                    "font-semibold text-blue-700/85 opacity-90 transition-[opacity,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] group-hover/kpi:text-blue-800 group-hover/kpi:opacity-100",
                    dash ? "text-[9px]" : "text-[10px]"
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
