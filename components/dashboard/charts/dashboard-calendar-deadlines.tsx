"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardCardClass } from "@/lib/dashboard-surface";
import { DASHBOARD_DEADLINES } from "@/lib/dashboard-deadlines";

const WEEKDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function startOfWeekMonday(d: Date) {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = c.getDay();
  const offset = wd === 0 ? -6 : 1 - wd;
  c.setDate(c.getDate() + offset);
  return c;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Week picker — top of dashboard right column. */
export function DashboardWeekCalendarPanel({
  className,
}: {
  className?: string;
}) {
  const today = useMemo(() => new Date(2025, 7, 19), []);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(today));
  const [selected, setSelected] = useState<Date | null>(today);

  const days = useMemo(() => {
    return WEEKDAY.map((w, i) => {
      const date = addDays(weekStart, i);
      return {
        w,
        d: String(date.getDate()),
        date,
        isToday: sameDay(date, today),
      };
    });
  }, [weekStart, today]);

  const headerLabel = useMemo(() => {
    const mid = addDays(weekStart, 3);
    return mid.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [weekStart]);

  return (
    <Card className={cn(dashboardCardClass, "h-auto gap-0 py-0", className)}>
      <CardContent className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900">Calendar</p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            aria-label={`Month: ${headerLabel}`}
            onClick={() => setWeekStart((s) => addDays(s, 7))}
          >
            <CalendarIcon className="h-3 w-3 text-slate-400" aria-hidden />
            August
            <ChevronDown className="h-3 w-3 text-slate-400" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const isSel = selected && sameDay(day.date, selected);
            return (
              <button
                key={day.date.toISOString()}
                type="button"
                onClick={() => setSelected(day.date)}
                className="flex flex-col items-center gap-1 rounded-md py-1 text-center text-slate-600 hover:bg-slate-50"
              >
                <span className="text-[9px] font-medium text-slate-400">
                  {day.w}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center text-xs font-semibold tabular-nums",
                    isSel
                      ? "rounded-full bg-blue-600 text-white"
                      : "text-slate-700"
                  )}
                >
                  {day.d}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/** Deadlines list — below calendar in the right rail. */
export function DashboardDeadlinesPanel({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn(dashboardCardClass, "h-auto gap-0 py-0", className)}>
      <CardHeader className="px-4 pb-0 pt-3">
        <CardTitle className="text-xs font-semibold text-slate-900">
          Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 py-3">
        {DASHBOARD_DEADLINES.map((d) => (
          <div
            key={d.id}
            className="group flex gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold leading-snug text-slate-900">
                  {d.title}
                </p>
                <button
                  type="button"
                  className="shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  aria-label={`Actions for ${d.title}`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">
                {d.id === "4"
                  ? `Expires in 5 days · ${d.deviceCount} ${d.deviceLabel}`
                  : `${d.department} · ${d.deviceCount} ${d.deviceLabel}`}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {d.detail}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** @deprecated Use DashboardWeekCalendarPanel + DashboardDeadlinesPanel */
export function DashboardCalendarDeadlines({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DashboardWeekCalendarPanel />
      <DashboardDeadlinesPanel />
    </div>
  );
}
