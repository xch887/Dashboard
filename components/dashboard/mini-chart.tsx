"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MiniChartProps = {
  data: number[];
  className?: string;
  height?: number;
  strokeClassName?: string;
  fillClassName?: string;
  label?: string;
  /** Draw line & fade area in on mount (fleet KPIs). */
  animateOnMount?: boolean;
};

/** Lightweight SVG area chart — no chart library. */
export function MiniAreaChart({
  data,
  className,
  height = 72,
  strokeClassName = "stroke-blue-600",
  fillClassName = "fill-blue-500/15",
  label,
  animateOnMount = true,
}: MiniChartProps) {
  const w = 280;
  const pad = 6;
  const innerW = w - pad * 2;
  const innerH = height - pad * 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;
  const points = data.map((v, i) => {
    const x =
      n <= 1
        ? pad + innerW / 2
        : pad + (i / (n - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });
  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const last = points[n - 1] ?? { x: w - pad, y: height - pad };
  const first = points[0] ?? { x: pad, y: height - pad };
  const areaD = `${lineD} L ${last.x} ${height - pad} L ${first.x} ${height - pad} Z`;

  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animateOnMount) return;
    const path = lineRef.current;
    if (!path) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L}`;
    path.style.strokeDashoffset = `${L}`;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition =
          "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)";
        path.style.strokeDashoffset = "0";
      });
    });
    return () => cancelAnimationFrame(id);
  }, [animateOnMount, data, height]);

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      ) : null}
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="h-auto w-full max-w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={areaD}
          className={cn(
            fillClassName,
            animateOnMount && "mini-area-fade-in"
          )}
        />
        <path
          ref={lineRef}
          d={lineD}
          fill="none"
          className={cn(strokeClassName)}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

type SparklineProps = {
  data: number[];
  className?: string;
  strokeClassName?: string;
  animateOnMount?: boolean;
};

/** Tiny in-card trend line (fleet KPIs, tiles). */
export function Sparkline({
  data,
  className,
  strokeClassName = "stroke-blue-600",
  animateOnMount = true,
}: SparklineProps) {
  const h = 36;
  const w = 128;
  const pad = 2;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const n = data.length;
  const points = data.map((v, i) => {
    const x = n <= 1 ? pad + innerW / 2 : pad + (i / (n - 1)) * innerW;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });
  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!animateOnMount) return;
    const path = pathRef.current;
    if (!path) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L}`;
    path.style.strokeDashoffset = `${L}`;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        path.style.transition =
          "stroke-dashoffset 0.95s cubic-bezier(0.22, 1, 0.36, 1)";
        path.style.strokeDashoffset = "0";
      });
    });
    return () => cancelAnimationFrame(id);
  }, [animateOnMount, data]);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-9 w-full max-w-[128px]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          ref={pathRef}
          d={lineD}
          fill="none"
          className={cn(strokeClassName)}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
