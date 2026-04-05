"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";

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

export function DashboardWeekCalendar({
  compact = false,
}: {
  compact?: boolean;
}) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(today));

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

  const [selected, setSelected] = useState<Date | null>(today);

  return (
    <div
      className={cn(
        "rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow,
        compact ? "p-3" : "p-4"
      )}
    >
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-3")}>
        <p
          className={cn(
            "font-semibold text-slate-900",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {headerLabel}
        </p>
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100",
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
            aria-label="Previous week"
            onClick={() => setWeekStart((s) => addDays(s, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100",
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
            aria-label="Next week"
            onClick={() => setWeekStart((s) => addDays(s, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1")}>
        {days.map((day) => {
          const isSel = selected && sameDay(day.date, selected);
          return (
            <button
              key={day.date.toISOString()}
              type="button"
              onClick={() => setSelected(day.date)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg text-center transition-all duration-150",
                compact ? "py-1.5" : "py-2",
                day.isToday &&
                  "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-2 ring-offset-white",
                !day.isToday &&
                  isSel &&
                  "bg-blue-50 text-blue-900 ring-1 ring-blue-200",
                !day.isToday &&
                  !isSel &&
                  "text-slate-600 hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "text-[9px] font-medium uppercase tracking-wide",
                  day.isToday ? "text-blue-100" : "text-slate-400"
                )}
              >
                {day.w}
              </span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                {day.d}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
