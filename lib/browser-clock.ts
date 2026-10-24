"use client";

import { useEffect, useState } from "react";

/** Browser-local wall clock, including the short timezone name (e.g. "5:30 PM CDT"). */
export function formatBrowserTime(date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/** Relative list stamp: "4:41 PM", or "Wed · 11:42 AM" beyond yesterday. */
export function formatListTimestamp(date: Date, now = new Date()): string {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000
  );

  if (diffDays <= 1) return time;

  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  return `${weekday} · ${time}`;
}

export function useBrowserClock(intervalMs = 30_000): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLabel(formatBrowserTime());
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return label;
}
