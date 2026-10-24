"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardChartColors,
} from "@/lib/dashboard-surface";
import { RefreshCw } from "lucide-react";

const CX = 100;
const CY = 100;
const R_OUT = 72;
const R_IN = 48;

type TaskSlice = {
  key: string;
  label: string;
  count: number;
  color: string;
};

const TASKS: TaskSlice[] = [
  {
    key: "overdue",
    label: "Overdue",
    count: 45,
    color: dashboardChartColors.overdue,
  },
  {
    key: "scheduled",
    label: "Scheduled",
    count: 29,
    color: dashboardChartColors.scheduled,
  },
  {
    key: "in_progress",
    label: "In progress",
    count: 66,
    color: dashboardChartColors.inProgress,
  },
  {
    key: "resolved",
    label: "Resolved",
    count: 39,
    color: dashboardChartColors.resolved,
  },
];

const TOTAL = TASKS.reduce((a, t) => a + t.count, 0);

function polar(cx: number, cy: number, r: number, angleFromTopDeg: number) {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const GAUGE_START = 135;
const GAUGE_SWEEP = 270;

function donutSegment(startAngle: number, sweepAngle: number, padDeg = 0.4) {
  const s = startAngle + padDeg;
  const e = startAngle + sweepAngle - padDeg;
  if (e <= s) return "";

  const p1o = polar(CX, CY, R_OUT, s);
  const p2o = polar(CX, CY, R_OUT, e);
  const p2i = polar(CX, CY, R_IN, e);
  const p1i = polar(CX, CY, R_IN, s);
  const large = sweepAngle - 2 * padDeg > 180 ? 1 : 0;

  return [
    `M ${p1o.x} ${p1o.y}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p2o.x} ${p2o.y}`,
    `L ${p2i.x} ${p2i.y}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${p1i.x} ${p1i.y}`,
    "Z",
  ].join(" ");
}

export function MaintenanceStatusDonut({
  compact = false,
}: {
  /** Fits a 3-up charts row on the dashboard. */
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const segments = useMemo(() => {
    return TASKS.map((t, i) => {
      const angle =
        GAUGE_START +
        TASKS.slice(0, i).reduce(
          (a, x) => a + (x.count / TOTAL) * GAUGE_SWEEP,
          0
        );
      const d = donutSegment(angle, (t.count / TOTAL) * GAUGE_SWEEP);
      return {
        ...t,
        d,
        pct: Math.round((t.count / TOTAL) * 1000) / 10,
      };
    });
  }, []);

  const active = segments.find((s) => s.key === hovered);

  return (
    <Card
      className={cn(
        dashboardCardClass,
        "gap-0 py-0",
        compact && "h-full"
      )}
    >
      <CardHeader
        className={cn(
          compact
            ? "flex-row items-start justify-between space-y-0 px-4 pb-2 pt-4"
            : "border-b border-slate-100 px-6 pb-4 pt-6"
        )}
      >
        <div>
          <CardTitle
            className={cn(
              "font-semibold text-slate-900",
              compact ? "text-sm" : "text-base"
            )}
          >
            Maintenance Status
          </CardTitle>
          <p className="text-[11px] text-slate-500">
            {compact
              ? "Last update 1 day ago"
              : "Open work queue across sites — excludes vendor-only tickets"}
          </p>
        </div>
        {compact ? (
          <button
            type="button"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Refresh maintenance status"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </CardHeader>
      <CardContent className={cn("pt-5", compact && "pt-3")}>
        <div
          className={cn(
            "flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8",
            compact && "flex-col gap-4 sm:flex-col"
          )}
        >
          <div
            className={cn(
              "relative mx-auto shrink-0 sm:mx-0",
              compact ? "w-[160px]" : "w-[220px]"
            )}
          >
            <svg
              viewBox="0 0 200 200"
              className={cn(
                "drop-shadow-sm",
                compact ? "h-[160px] w-[160px]" : "h-[220px] w-[220px]"
              )}
              role="img"
              aria-label={`Donut chart: ${TOTAL} total maintenance tasks by status`}
            >
              {segments.map((seg) => (
                <path
                  key={seg.key}
                  d={seg.d}
                  fill={seg.color}
                  className={cn(
                    "cursor-pointer transition-[opacity,filter] duration-200",
                    hovered && hovered !== seg.key && "opacity-45"
                  )}
                  style={{
                    filter:
                      hovered === seg.key ? "brightness(1.06)" : undefined,
                  }}
                  onMouseEnter={() => setHovered(seg.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
              <circle
                cx={CX}
                cy={CY}
                r={R_IN - 0.5}
                className="fill-white"
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p
                className={cn(
                  "font-extrabold tabular-nums tracking-tight text-slate-950",
                  compact ? "text-xl" : "text-2xl"
                )}
              >
                {TOTAL.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Total tasks
              </p>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-1">
            {compact ? (
              <ul className="grid grid-cols-2 gap-2">
                {segments.map((seg) => (
                  <li key={seg.key}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start rounded-xl border border-slate-100 bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
                        hovered === seg.key && "ring-1 ring-slate-200"
                      )}
                      onMouseEnter={() => setHovered(seg.key)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-800">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: seg.color }}
                          aria-hidden
                        />
                        {seg.label} · {Math.round(seg.pct)}%
                      </span>
                      <span className="mt-1 text-[10px] text-slate-400">
                        Total — {seg.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Queue
            </p>
            <ul className="space-y-2">
              {segments.map((seg) => (
                <li key={seg.key}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                      hovered === seg.key
                        ? "bg-slate-100"
                        : "hover:bg-slate-50"
                    )}
                    onMouseEnter={() => setHovered(seg.key)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm ring-1 ring-slate-900/[0.05]"
                        style={{ backgroundColor: seg.color }}
                        aria-hidden
                      />
                      <span className="truncate text-sm font-medium text-slate-800">
                        {seg.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                      <span className="block">{seg.count}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({seg.pct}%)
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {active ? (
              <p className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {active.label}:
                </span>{" "}
                {active.pct}% of queue ({active.count} tasks)
              </p>
            ) : null}
              </>
            )}
          </div>
        </div>
      </CardContent>
      {compact ? null : (
      <CardFooter className="flex items-center gap-2 border-t border-black/10 py-3 text-xs text-slate-500">
        <RefreshCw
          className="h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden
        />
        <span>Last update 1 day ago</span>
      </CardFooter>
      )}
    </Card>
  );
}
