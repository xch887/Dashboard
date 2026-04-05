"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";

/** Sept → Aug (12 months). */
const MONTHS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
] as const;

/** Sept → Aug; trailing values: Overall 84%, Preventative 72%, Corrective 87%. */
const OVERALL = [81, 82, 80, 83, 85, 83, 84, 85, 84, 83, 84, 84];
const PREVENTATIVE = [70, 71, 70, 71, 72, 71, 72, 72, 71, 72, 72, 72];
const CORRECTIVE = [85, 86, 85, 87, 88, 86, 87, 88, 87, 86, 87, 87];
/** February = index 5 (Sep = 0). */
const FEB_IDX = 5;

const W = 520;
const H = 228;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 34;
const INNER_W = W - PAD_L - PAD_R;
const INNER_H = H - PAD_T - PAD_B;

/** Y-axis 60%–100% like reference dashboard. */
const Y_MIN = 60;
const Y_MAX = 100;

function xAt(i: number) {
  return PAD_L + (i / (MONTHS.length - 1)) * INNER_W;
}

function yAt(pct: number) {
  const t = (pct - Y_MIN) / (Y_MAX - Y_MIN);
  const clamped = Math.min(1, Math.max(0, t));
  const y0 = PAD_T + INNER_H;
  const y1 = PAD_T;
  return y0 - clamped * (y0 - y1);
}

function smoothStroke(values: number[]) {
  const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = (p1.x - p0.x) * 0.45;
    d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function smoothArea(values: number[]) {
  const line = smoothStroke(values);
  const n = values.length;
  const xLast = xAt(n - 1);
  const xFirst = xAt(0);
  const yBase = PAD_T + INNER_H;
  return `${line} L ${xLast} ${yBase} L ${xFirst} ${yBase} Z`;
}

const SERIES = [
  {
    key: "overall",
    label: "Overall",
    color: "#2563eb",
    values: OVERALL,
  },
  {
    key: "preventative",
    label: "Preventative",
    color: "#059669",
    values: PREVENTATIVE,
  },
  {
    key: "corrective",
    label: "Corrective",
    color: "#f97316",
    values: CORRECTIVE,
  },
] as const;

const GRID_Y = [60, 70, 80, 90, 100] as const;

export function MaintenanceComplianceChart({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [period, setPeriod] = useState("Monthly");

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const rel = x - PAD_L;
      const idx = Math.round((rel / INNER_W) * (MONTHS.length - 1));
      const clamped = Math.max(0, Math.min(MONTHS.length - 1, idx));
      setHoverIdx(clamped);
    },
    []
  );

  const onLeave = useCallback(() => setHoverIdx(null), []);

  const overallDelta = useMemo(() => {
    if (hoverIdx == null || hoverIdx < 1) return null;
    const prev = OVERALL[hoverIdx - 1];
    const cur = OVERALL[hoverIdx];
    if (prev === 0) return null;
    return (((cur - prev) / prev) * 100).toFixed(1);
  }, [hoverIdx]);

  return (
    <Card
      className={cn(
        "rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow,
        compact ? "" : "h-full"
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row flex-wrap items-start justify-between gap-3 border-b border-black/10",
          compact ? "pb-2 pt-3" : "pb-3"
        )}
      >
        <div className="min-w-0 flex-1">
          <CardTitle
            className={cn(
              "font-semibold text-slate-900",
              compact ? "text-xs" : "text-sm"
            )}
          >
            Maintenance compliance
          </CardTitle>
          <p
            className={cn(
              "font-normal text-slate-500",
              compact ? "text-[11px]" : "text-xs"
            )}
          >
            Rolling completion vs. scheduled work
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              {period}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {(["Monthly", "Quarterly", "Year to date"] as const).map((p) => (
              <DropdownMenuItem
                key={p}
                className="text-sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className={cn(compact ? "pb-3 pt-2" : "pt-4")}>
        <div
          className={cn(
            "flex flex-wrap items-center gap-4",
            compact ? "mb-2 gap-2" : "mb-3"
          )}
        >
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-6 shrink-0 rounded-full ring-1 ring-slate-900/[0.05]"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="font-medium text-slate-700">{s.label}</span>
              <span className="tabular-nums text-slate-500">
                {s.values[s.values.length - 1]}%
              </span>
            </div>
          ))}
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className={cn(
              "min-w-[280px] w-full max-w-full touch-none select-none",
              compact ? "h-[138px]" : "h-[248px]"
            )}
            role="img"
            aria-label="Twelve month maintenance compliance trend"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {GRID_Y.map((g) => {
              const y = yAt(g);
              return (
                <g key={g}>
                  <line
                    x1={PAD_L}
                    y1={y}
                    x2={W - PAD_R}
                    y2={y}
                    className="stroke-slate-200"
                    strokeWidth={1}
                    strokeDasharray={g === 60 || g === 100 ? "0" : "4 4"}
                  />
                  <text
                    x={PAD_L - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-medium"
                  >
                    {g}%
                  </text>
                </g>
              );
            })}

            {MONTHS.map((m, i) => (
              <text
                key={m}
                x={xAt(i)}
                y={H - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium"
              >
                {m}
              </text>
            ))}

            <path d={smoothArea(OVERALL)} className="fill-blue-600/[0.09]" />

            {SERIES.map((s) => (
              <path
                key={s.key}
                d={smoothStroke([...s.values])}
                fill="none"
                stroke={s.color}
                strokeWidth={hoverIdx != null ? 2.35 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-[stroke-width] duration-150"
              />
            ))}

            {hoverIdx != null ? (
              <g>
                <line
                  x1={xAt(hoverIdx)}
                  y1={PAD_T}
                  x2={xAt(hoverIdx)}
                  y2={PAD_T + INNER_H}
                  className="stroke-blue-600/30"
                  strokeWidth={1}
                />
                {SERIES.map((s) => {
                  const v = s.values[hoverIdx];
                  const cx = xAt(hoverIdx);
                  const cy = yAt(v);
                  return (
                    <g key={s.key}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="white"
                        className="stroke-slate-200"
                        strokeWidth={1}
                      />
                      <circle cx={cx} cy={cy} r={3} fill={s.color} />
                    </g>
                  );
                })}
              </g>
            ) : null}
          </svg>

          {hoverIdx != null ? (
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 w-[min(100%,280px)] -translate-x-1/2 rounded-xl border border-slate-200/60 bg-white px-3 py-2.5 text-xs shadow-[0_12px_40px_-8px_rgb(15_23_42/0.14)] ring-1 ring-slate-900/[0.04] sm:left-auto sm:right-4 sm:translate-x-0">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900">
                  {MONTHS[hoverIdx]} 2026
                </p>
                {overallDelta != null ? (
                  <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    +{overallDelta}%
                  </span>
                ) : null}
              </div>
              <ul className="mt-2 space-y-1.5">
                {SERIES.map((s) => (
                  <li
                    key={s.key}
                    className="flex items-center justify-between gap-3 tabular-nums"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                        aria-hidden
                      />
                      {s.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {s.values[hoverIdx]}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
              <span>Hover the chart for monthly values</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50"
                  >
                    <Info className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                    February snapshot
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  arrowClassName="bg-white fill-white ring-1 ring-slate-200/80"
                  className="max-w-[240px] border-slate-200 bg-white p-3 text-slate-900 shadow-md"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {MONTHS[FEB_IDX]} (rolling year)
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {SERIES.map((s) => (
                      <li
                        key={s.key}
                        className="flex justify-between gap-4 tabular-nums"
                      >
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.label}
                        </span>
                        <span className="font-semibold">
                          {s.values[FEB_IDX]}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
