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
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";
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
  { key: "overdue", label: "Overdue", count: 45, color: "#ef4444" },
  { key: "scheduled", label: "Scheduled", count: 29, color: "#eab308" },
  { key: "in_progress", label: "In progress", count: 66, color: "#3b82f6" },
  { key: "resolved", label: "Resolved", count: 39, color: "#059669" },
];

const TOTAL = TASKS.reduce((a, t) => a + t.count, 0);

function polar(cx: number, cy: number, r: number, angleFromTopDeg: number) {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

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
      const angle = TASKS.slice(0, i).reduce(
        (a, x) => a + (x.count / TOTAL) * 360,
        0
      );
      const d = donutSegment(angle, (t.count / TOTAL) * 360);
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
        "rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow,
        compact && "h-full"
      )}
    >
      <CardHeader
        className={cn("border-b border-black/10 pb-3", compact && "pb-2")}
      >
        <CardTitle className="text-base font-semibold text-slate-900">
          Maintenance status
        </CardTitle>
        <p className="text-xs text-slate-500">
          Open work queue across sites — excludes vendor-only tickets
        </p>
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
            <p
              className={cn(
                "mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                compact && "mb-1"
              )}
            >
              Queue
            </p>
            <ul className={cn("space-y-2", compact && "space-y-1")}>
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2 border-t border-black/10 py-3 text-xs text-slate-500">
        <RefreshCw
          className="h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden
        />
        <span>Last update 1 day ago</span>
      </CardFooter>
    </Card>
  );
}
