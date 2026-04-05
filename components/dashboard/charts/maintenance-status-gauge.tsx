"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TASKS = [
  { key: "overdue", label: "Overdue", count: 45, color: "#e11d48" },
  { key: "scheduled", label: "Scheduled", count: 29, color: "#ca8a04" },
  { key: "in_progress", label: "In progress", count: 66, color: "#2563eb" },
  { key: "resolved", label: "Resolved", count: 39, color: "#059669" },
] as const;

const TOTAL = TASKS.reduce((a, t) => a + t.count, 0);

const CX = 100;
const CY = 100;
const R = 74;

/** Point on top semicircle: t∈[0,1] left → right through top. */
function pt(t: number) {
  const ang = Math.PI - t * Math.PI;
  return { x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
}

/** Semi-circular gauge (∩), center label below arc. */
export function MaintenanceStatusGauge() {
  const [hovered, setHovered] = useState<string | null>(null);

  const arcs = useMemo(() => {
    let cum = 0;
    return TASKS.map((t) => {
      const t0 = cum / TOTAL;
      const t1 = (cum + t.count) / TOTAL;
      cum += t.count;
      const p0 = pt(t0);
      const p1 = pt(t1);
      const sweepDeg = (t1 - t0) * 180;
      const largeArc = sweepDeg > 180 ? 1 : 0;
      const d = `M ${p0.x} ${p0.y} A ${R} ${R} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
      return { ...t, d };
    });
  }, []);

  const pLeft = pt(0);
  const pRight = pt(1);

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-200/50">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Maintenance status
        </CardTitle>
        <p className="text-xs font-normal text-slate-500">
          Open queue by state
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative mx-auto w-full max-w-[260px]">
          <svg
            viewBox="0 0 200 112"
            className="w-full"
            role="img"
            aria-label={`Gauge: ${TOTAL} total maintenance tasks`}
          >
            <path
              d={`M ${pLeft.x} ${pLeft.y} A ${R} ${R} 0 0 1 ${pRight.x} ${pRight.y}`}
              fill="none"
              className="stroke-slate-100"
              strokeWidth={12}
              strokeLinecap="round"
            />
            {arcs.map((seg) => (
              <path
                key={seg.key}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth={12}
                strokeLinecap="butt"
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hovered && hovered !== seg.key && "opacity-35"
                )}
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center text-center">
            <p className="text-2xl font-extrabold tabular-nums text-slate-950">
              {TOTAL}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Total tasks
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {TASKS.map((t) => {
            const pct = Math.round((t.count / TOTAL) * 1000) / 10;
            return (
              <div
                key={t.key}
                className={cn(
                  "rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2 transition-colors",
                  hovered === t.key && "bg-white ring-1 ring-blue-500/25"
                )}
                onMouseEnter={() => setHovered(t.key)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/5"
                    style={{ backgroundColor: t.color }}
                    aria-hidden
                  />
                  <span className="truncate text-[10px] font-semibold text-slate-800">
                    {t.label}
                  </span>
                </div>
                <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                  {pct}%
                </p>
                <p className="text-[9px] text-slate-500">Total — {t.count}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
