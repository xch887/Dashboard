"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";

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
  { key: "healthy", label: "Healthy", pct: 82, count: 6940, color: "#059669" },
  { key: "warning", label: "Warning", pct: 11, count: 932, color: "#eab308" },
  { key: "critical", label: "Critical", pct: 4, count: 339, color: "#ef4444" },
  { key: "offline", label: "Offline", pct: 3, count: 252, color: "#94a3b8" },
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
}: {
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const R_OUT_S = compact ? 56 : R_OUT;
  const R_IN_S = compact ? 38 : R_IN;

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
  const svgClass = compact ? "h-[168px] w-[168px]" : "h-[220px] w-[220px]";

  return (
    <Card
      className={cn(
        "h-full rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow,
        compact && "flex flex-col"
      )}
    >
      <CardHeader
        className={cn("border-b border-black/10", compact ? "py-2" : "pb-3")}
      >
        <CardTitle
          className={cn(
            "font-semibold text-slate-900",
            compact ? "text-sm" : "text-base"
          )}
        >
          Device health overview
        </CardTitle>
        <p
          className={cn(
            "text-slate-500",
            compact ? "text-[11px] leading-snug" : "text-xs"
          )}
        >
          Fleet status by operational state — last sync within 15 min
        </p>
      </CardHeader>
      <CardContent
        className={cn(
          "pt-5",
          compact && "flex flex-1 flex-col pt-3 pb-2"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8",
            compact && "gap-3 sm:flex-col sm:items-stretch"
          )}
        >
          <div
            className={cn(
              "relative mx-auto shrink-0",
              compact ? "w-[168px]" : "w-[220px] sm:mx-0"
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
                  compact ? "text-xl" : "text-2xl"
                )}
              >
                {TOTAL.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Devices
              </p>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                compact ? "mb-1" : "mb-2"
              )}
            >
              Legend
            </p>
            <ul className={cn(compact ? "space-y-1" : "space-y-2")}>
              {segments.map((seg) => (
                <li key={seg.key}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg text-left transition-colors duration-150",
                      compact ? "px-1.5 py-1" : "px-2 py-1.5",
                      hovered === seg.key ? "bg-slate-100" : "hover:bg-slate-50"
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
                      <span
                        className={cn(
                          "truncate font-medium text-slate-800",
                          compact ? "text-xs" : "text-sm"
                        )}
                      >
                        {seg.label}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-right font-semibold tabular-nums text-slate-900",
                        compact ? "text-xs" : "text-sm"
                      )}
                    >
                      <span className="block">
                        {seg.count.toLocaleString()}
                      </span>
                      <span className="text-xs font-normal text-slate-500">
                        ({seg.pct}%)
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {active && !compact ? (
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
