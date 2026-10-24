"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardChartColors,
} from "@/lib/dashboard-surface";

const CX = 100;
const CY = 100;
const R_OUT = 72;
const R_IN = 48;

type Slice = {
  key: string;
  label: string;
  pct: number;
  count: number;
  color: string;
};

const SLICES: Slice[] = [
  {
    key: "healthy",
    label: "Healthy",
    pct: 82,
    count: 6940,
    color: dashboardChartColors.healthy,
  },
  {
    key: "warning",
    label: "Warning",
    pct: 11,
    count: 931,
    color: dashboardChartColors.warning,
  },
  {
    key: "critical",
    label: "Critical",
    pct: 4,
    count: 339,
    color: dashboardChartColors.critical,
  },
  {
    key: "offline",
    label: "Offline",
    pct: 3,
    count: 253,
    color: dashboardChartColors.offline,
  },
];

const TOTAL = SLICES.reduce((a, s) => a + s.count, 0);

function polar(cx: number, cy: number, r: number, angleFromTopDeg: number) {
  const rad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegment(
  startAngle: number,
  sweepAngle: number,
  rOut: number,
  rIn: number,
  padDeg = 0.35
) {
  const s = startAngle + padDeg;
  const e = startAngle + sweepAngle - padDeg;
  if (e <= s) return "";

  const p1o = polar(CX, CY, rOut, s);
  const p2o = polar(CX, CY, rOut, e);
  const p2i = polar(CX, CY, rIn, e);
  const p1i = polar(CX, CY, rIn, s);
  const large = sweepAngle - 2 * padDeg > 180 ? 1 : 0;

  return [
    `M ${p1o.x} ${p1o.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${p2o.x} ${p2o.y}`,
    `L ${p2i.x} ${p2i.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${p1i.x} ${p1i.y}`,
    "Z",
  ].join(" ");
}

export function DeviceHealthOverview({
  compact = false,
  topRow = false,
  mini = false,
  className,
}: {
  compact?: boolean;
  /** Dashboard top band: horizontal donut + legend, tighter header. */
  topRow?: boolean;
  /** Smaller tile beside KPI grid (left of calendar). */
  mini?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const band = mini || topRow;
  const R_OUT_S = mini ? 42 : topRow ? 50 : compact ? 56 : R_OUT;
  const R_IN_S = mini ? 28 : topRow ? 34 : compact ? 38 : R_IN;

  const segments = useMemo(() => {
    return SLICES.map((s, i) => {
      const angle = SLICES.slice(0, i).reduce(
        (a, x) => a + (x.pct / 100) * 360,
        0
      );
      const sweep = (s.pct / 100) * 360;
      const d = donutSegment(angle, sweep, R_OUT_S, R_IN_S);
      return { ...s, d };
    });
  }, [R_OUT_S, R_IN_S]);

  const active = segments.find((s) => s.key === hovered);
  const svgClass = mini
    ? "h-[112px] w-[112px]"
    : topRow
      ? "h-[140px] w-[140px]"
      : compact
        ? "h-[168px] w-[168px]"
        : "h-[220px] w-[220px]";

  return (
    <Card
      className={cn(
        band ? "h-auto" : "h-full",
        dashboardCardClass,
        "gap-0 py-0",
        band && "flex flex-col",
        className
      )}
    >
      <CardHeader
        className={cn(
          "border-b border-slate-100",
          mini
            ? "flex flex-row items-center justify-between gap-2 space-y-0 px-3 py-2"
            : topRow
              ? "px-4 py-3"
              : compact
                ? "px-5 py-4"
                : "px-6 pb-4 pt-6"
        )}
      >
        <CardTitle
          className={cn(
            "font-semibold text-slate-900",
            mini
              ? "text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-700"
              : compact
                ? "text-sm"
                : "text-base"
          )}
        >
          Device Health Overview
        </CardTitle>
        {mini ? (
          <button
            type="button"
            className="ml-auto rounded-md p-0.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            aria-label="Device health settings"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        {!mini ? (
          <p
            className={cn(
              "text-slate-500",
              compact || topRow
                ? "text-[11px] leading-snug"
                : "text-xs"
            )}
          >
            Fleet status by operational state — last sync within 15 min
          </p>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          "pt-5",
          band && "flex flex-col px-3 pt-2 pb-2",
          !band && "pt-5"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8",
            band && "flex-row items-center gap-2",
            compact && !band && "gap-3 sm:flex-col sm:items-stretch"
          )}
        >
          <div
            className={cn(
              "relative shrink-0",
              mini
                ? "mx-0 w-[112px]"
                : topRow
                  ? "mx-0 w-[140px]"
                  : compact
                    ? "mx-auto w-[168px]"
                    : "mx-auto w-[220px] sm:mx-0"
            )}
          >
            <svg
              viewBox="0 0 200 200"
              className={cn(svgClass, "drop-shadow-sm")}
              role="img"
              aria-label={`Donut: ${TOTAL.toLocaleString()} devices — healthy, warning, critical, offline`}
            >
              {segments.map((seg) => (
                <path
                  key={seg.key}
                  d={seg.d}
                  fill={seg.color}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hovered && hovered !== seg.key && "opacity-45"
                  )}
                  style={{
                    filter:
                      hovered === seg.key ? "brightness(1.05)" : undefined,
                  }}
                  onMouseEnter={() => setHovered(seg.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
              <circle
                cx={CX}
                cy={CY}
                r={R_IN_S - 0.5}
                className="fill-white"
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p
                className={cn(
                  "font-bold tabular-nums tracking-tight text-slate-900",
                  mini ? "text-base" : topRow ? "text-lg" : compact ? "text-xl" : "text-2xl"
                )}
              >
                {TOTAL.toLocaleString()}
              </p>
              <p
                className={cn(
                  "font-medium uppercase tracking-wide text-slate-500",
                  mini ? "text-[9px]" : "text-[11px]"
                )}
              >
                Devices
              </p>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-0.5">
            {!band ? (
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                  compact ? "mb-1" : "mb-2"
                )}
              >
                Legend
              </p>
            ) : null}
            <ul className={cn(band ? "space-y-0" : compact ? "space-y-0.5" : "space-y-2")}>
              {segments.map((seg) => (
                <li key={seg.key}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-1 rounded-md text-left transition-colors duration-150",
                      mini ? "px-0 py-0.5" : band ? "px-1 py-0.5" : compact ? "px-1.5 py-1" : "px-2 py-1.5",
                      hovered === seg.key ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                    onMouseEnter={() => setHovered(seg.key)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "shrink-0 rounded-sm ring-1 ring-slate-900/[0.05]",
                          mini ? "h-2 w-2" : "h-2.5 w-2.5"
                        )}
                        style={{ backgroundColor: seg.color }}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "truncate font-medium text-slate-800",
                          mini ? "text-[10px]" : band ? "text-[11px]" : compact ? "text-xs" : "text-sm"
                        )}
                      >
                        {seg.label}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums text-slate-900",
                        mini ? "text-[10px] font-semibold" : "text-right font-semibold",
                        !mini && (compact ? "text-xs" : "text-sm")
                      )}
                    >
                      {mini ? (
                        <span>
                          {seg.pct}%{" "}
                          <span className="font-normal text-slate-400">
                            ({seg.count.toLocaleString()})
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="block">
                            {seg.count.toLocaleString()}
                          </span>
                          <span className="text-xs font-normal text-slate-500">
                            ({seg.pct}%)
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {active && !compact && !mini ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {active.label}:
                </span>{" "}
                {active.count.toLocaleString()} devices ({active.pct}% of
                fleet)
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
