"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";
import { InsightBadge } from "@/components/dashboard/insight-badge";

export type EventType = "PM" | "Vendor" | "Calibration" | "IT" | "Hold";

export type CalEvent = {
  time: string;
  title: string;
  dept: string;
  type: EventType;
  room?: string;
  deviceId?: string;
};

const EVENT_TYPES: EventType[] = [
  "PM",
  "Vendor",
  "Calibration",
  "IT",
  "Hold",
];

const EVENTS: Record<string, CalEvent[]> = {
  "2026-04-01": [
    {
      time: "06:00",
      title: "Central sterile PM sweep",
      dept: "SPD",
      type: "PM",
    },
  ],
  "2026-04-02": [
    {
      time: "11:00",
      title: "Anesthesia machine leak check",
      dept: "OR",
      type: "PM",
      room: "OR 2",
      deviceId: "DEV-4401",
    },
  ],
  "2026-04-03": [
    {
      time: "08:00",
      title: "Defibrillator calibration batch (4 units)",
      dept: "ER",
      type: "Calibration",
      room: "Bay 1–4",
    },
    {
      time: "14:00",
      title: "PACS downtime — vendor patch window",
      dept: "Imaging",
      type: "Vendor",
      room: "Reading room",
    },
  ],
  "2026-04-04": [
    {
      time: "07:00",
      title: "MRI coil inspection",
      dept: "Radiology",
      type: "PM",
      room: "MRI Suite B",
    },
  ],
  "2026-04-05": [
    {
      time: "09:00",
      title: "Ventilator PM batch (3 units)",
      dept: "Respiratory",
      type: "PM",
    },
    {
      time: "13:30",
      title: "Vendor — CT tube assessment",
      dept: "Imaging",
      type: "Vendor",
    },
  ],
  "2026-04-06": [
    {
      time: "All day",
      title: "Joint Commission documentation hold",
      dept: "Quality",
      type: "Hold",
    },
  ],
  "2026-04-07": [
    {
      time: "10:30",
      title: "Patient monitor NIBP calibration",
      dept: "ICU",
      type: "Calibration",
      room: "Room 212",
      deviceId: "DEV-2041",
    },
  ],
  "2026-04-08": [
    {
      time: "10:00",
      title: "Joint Commission walkthrough hold",
      dept: "Facilities",
      type: "Hold",
    },
    {
      time: "15:00",
      title: "Infusion library electrical safety",
      dept: "Pharmacy",
      type: "PM",
    },
  ],
  "2026-04-09": [
    {
      time: "08:00",
      title: "HVAC filter change — imaging block",
      dept: "Facilities",
      type: "PM",
    },
  ],
  "2026-04-10": [
    {
      time: "08:30",
      title: "Infusion pump firmware window",
      dept: "ICU",
      type: "IT",
    },
    {
      time: "15:00",
      title: "Dialysis disinfect cycle",
      dept: "Nephrology",
      type: "PM",
      deviceId: "DEV-0892",
    },
  ],
  "2026-04-11": [
    {
      time: "12:00",
      title: "Linear accelerator calibration check",
      dept: "Radiation oncology",
      type: "Calibration",
    },
  ],
  "2026-04-12": [
    {
      time: "07:30",
      title: "Sterilizer Bowie-Dick cycle",
      dept: "SPD",
      type: "PM",
    },
  ],
  "2026-04-14": [
    {
      time: "09:00",
      title: "Vendor — endoscope service lane",
      dept: "GI lab",
      type: "Vendor",
    },
  ],
  "2026-04-15": [
    {
      time: "All day",
      title: "OEM calibration — ultrasound fleet",
      dept: "Imaging",
      type: "Calibration",
    },
    {
      time: "11:00",
      title: "Network maintenance — VLAN 40",
      dept: "IT",
      type: "IT",
    },
  ],
  "2026-04-17": [
    {
      time: "13:00",
      title: "Blood bank fridge verification",
      dept: "Lab",
      type: "Calibration",
    },
  ],
  "2026-04-18": [
    {
      time: "08:00",
      title: "Crash cart audit + battery swap",
      dept: "Nursing",
      type: "PM",
    },
  ],
  "2026-04-20": [
    {
      time: "10:00",
      title: "HIS interface freeze window",
      dept: "IT",
      type: "Hold",
    },
  ],
  "2026-04-22": [
    {
      time: "14:30",
      title: "Siemens field service — MR coldhead",
      dept: "Imaging",
      type: "Vendor",
      room: "MRI Suite A",
    },
  ],
  "2026-04-24": [
    {
      time: "09:30",
      title: "Telemetry hub firmware (staging)",
      dept: "ICU",
      type: "IT",
      deviceId: "DEV-5510",
    },
  ],
  "2026-04-26": [
    {
      time: "All day",
      title: "Capital planning blackout — OR block",
      dept: "Admin",
      type: "Hold",
    },
  ],
  "2026-04-28": [
    {
      time: "07:00",
      title: "Annual elevator phone test",
      dept: "Facilities",
      type: "PM",
    },
  ],
  "2026-04-30": [
    {
      time: "16:00",
      title: "Month-end PM closure review",
      dept: "Clinical engineering",
      type: "PM",
    },
  ],
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function padKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: ({ day: number; inMonth: boolean } | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const typeColors: Record<EventType, string> = {
  PM: "bg-blue-500/15 text-blue-800 border-blue-500/25",
  Vendor: "bg-violet-500/10 text-violet-800 border-violet-500/20",
  Calibration: "bg-emerald-500/12 text-emerald-900 border-emerald-500/25",
  IT: "bg-cyan-500/10 text-cyan-900 border-cyan-500/20",
  Hold: "bg-amber-500/10 text-amber-900 border-amber-500/20",
};

const CALENDAR_INSIGHTS: Record<
  string,
  { delta: string; note: string; tone?: "up" | "down" | "flat" | "warn" }
> = {
  "This week": {
    delta: "↑ +12% vs last week",
    note: "MRI PMs and vendor holds account for most volume.",
    tone: "up",
  },
  Conflicts: {
    delta: "↓ 1 resolved",
    note: "2 room overlaps still need a decision.",
    tone: "warn",
  },
  "Vendor blocks": {
    delta: "→ Flat week",
    note: "All blocks approved; no escalations.",
    tone: "flat",
  },
  "Auto-scheduled": {
    delta: "↑ +4 pts",
    note: "Rules tuned for ICU pump cadence.",
    tone: "up",
  },
};

function filterByType(events: CalEvent[], f: EventType | "all"): CalEvent[] {
  if (f === "all") return events;
  return events.filter((e) => e.type === f);
}

export function CalendarView() {
  const now = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(2026, 3, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(3);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const selectedKey =
    selectedDay != null ? padKey(year, month, selectedDay) : null;
  const selectedEvents = useMemo(() => {
    if (!selectedKey) return [];
    return filterByType(EVENTS[selectedKey] ?? [], typeFilter);
  }, [selectedKey, typeFilter]);

  const upcoming = useMemo(() => {
    const list: { key: string; events: CalEvent[] }[] = [];
    Object.entries(EVENTS).forEach(([key, evs]) => {
      const fe = filterByType(evs, typeFilter);
      if (!fe.length) return;
      if (key >= padKey(year, month, 1) && key < padKey(year, month + 1, 1)) {
        list.push({ key, events: fe });
      }
    });
    return list.sort((a, b) => a.key.localeCompare(b.key));
  }, [year, month, typeFilter]);

  const isTodayCell = useCallback(
    (day: number) =>
      year === now.getFullYear() &&
      month === now.getMonth() &&
      day === now.getDate(),
    [year, month, now]
  );

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCursor(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const goToToday = useCallback(() => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDay(t.getDate());
    setTypeFilter("all");
  }, []);

  const c = sectionConfigs.calendar;
  const stats = c.stats;

  return (
    <ViewPage>
      <PageHeader
        icon={CalendarIcon}
        title={c.title}
        description={c.description}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-xs font-semibold"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Add hold
            </Button>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        {stats.map((s) => {
          const insight = CALENDAR_INSIGHTS[s.label];
          const deltaClass =
            insight?.tone === "up"
              ? "text-teal-700"
              : insight?.tone === "down"
                ? "text-rose-700"
                : insight?.tone === "warn"
                  ? "text-amber-800"
                  : "text-slate-600";
          return (
            <li
              key={s.label}
            >
              <SectionCard>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {s.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.hint}</p>
              {insight ? (
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <InsightBadge />
                  </div>
                  <p
                    className={`text-[11px] font-semibold tabular-nums ${deltaClass}`}
                  >
                    {insight.delta}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {insight.note}
                  </p>
                </div>
              ) : null}
              </SectionCard>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-3 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">
        <SectionCard>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-lg"
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-lg"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Show event types
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  typeFilter === "all"
                    ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
                    : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                All types
              </button>
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    typeFilter === t
                      ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
                      : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {EVENT_TYPES.map((t) => (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                  typeColors[t]
                )}
              >
                <span className="size-1.5 rounded-full bg-current opacity-60" />
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 overflow-visible">
            {cells.map((cell, i) => {
              if (!cell) {
                return <div key={`e-${i}`} className="aspect-square" />;
              }
              const key = padKey(year, month, cell.day);
              const raw = EVENTS[key] ?? [];
              const dayEvents = filterByType(raw, typeFilter);
              const has = dayEvents.length;
              const isSel = selectedDay === cell.day;
              const isToday = isTodayCell(cell.day);
              return (
                <div key={key} className="group relative z-0 aspect-square hover:z-30">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(cell.day)}
                    className={cn(
                      "relative flex h-full w-full flex-col rounded-xl border border-transparent p-1 text-left text-sm font-medium transition-all duration-200",
                      isSel
                        ? "border-blue-500/30 bg-blue-600 text-white shadow-md shadow-blue-900/25"
                        : "text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm",
                      has && !isSel && "ring-1 ring-blue-500/15",
                      isToday &&
                        !isSel &&
                        "ring-2 ring-emerald-500/40 ring-offset-1"
                    )}
                  >
                    <span
                      className={cn(
                        "flex shrink-0 justify-center pt-0.5 text-center tabular-nums",
                        isSel ? "text-white" : "",
                        isToday && !isSel && "font-bold text-emerald-800"
                      )}
                    >
                      {cell.day}
                    </span>
                    {has ? (
                      <div className="mt-auto flex min-h-0 w-full flex-col gap-0.5">
                        {dayEvents.slice(0, 2).map((ev, j) => (
                          <span
                            key={j}
                            className={cn(
                              "truncate rounded px-1 py-px text-center text-[8px] font-semibold leading-tight",
                              typeColors[ev.type],
                              isSel && "border-white/20 bg-white/15 text-white"
                            )}
                          >
                            {ev.type}
                          </span>
                        ))}
                        {dayEvents.length > 2 ? (
                          <span
                            className={cn(
                              "text-center text-[8px] font-bold",
                              isSel ? "text-white/90" : "text-blue-700"
                            )}
                          >
                            +{dayEvents.length - 2}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </button>

                  {has ? (
                    <div
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-[calc(100%+4px)] z-40 w-[min(260px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5",
                        "origin-top scale-95 opacity-0 transition-all duration-200 ease-out",
                        "group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100"
                      )}
                    >
                      <p className="border-b border-slate-100 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {key}
                      </p>
                      <ul className="mt-2 max-h-44 space-y-2 overflow-y-auto">
                        {dayEvents.map((ev, idx) => (
                          <li
                            key={idx}
                            className="rounded-md bg-slate-50/90 px-2 py-1.5 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "px-1 py-0 text-[9px] font-semibold",
                                  typeColors[ev.type]
                                )}
                              >
                                {ev.type}
                              </Badge>
                              <span className="tabular-nums text-slate-500">
                                {ev.time}
                              </span>
                            </div>
                            <p className="mt-0.5 font-medium text-slate-900">
                              {ev.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {ev.dept}
                              {ev.room ? ` · ${ev.room}` : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard className="flex flex-col p-0">
          <div className="border-b border-slate-100 px-4 pb-3 pt-4 sm:px-5 sm:pb-3 sm:pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedKey
                ? `Events · ${selectedKey}`
                : "Select a day"}
            </h3>
            <p className="text-xs text-slate-500">
              {typeFilter !== "all"
                ? `Filtered: ${typeFilter} · `
                : ""}
              {selectedEvents.length
                ? `${selectedEvents.length} scheduled`
                : selectedKey
                  ? "No events match this filter"
                  : "Pick a date on the grid"}
            </p>
          </div>
          <ul className="max-h-[min(320px,50vh)] flex-1 space-y-2 overflow-y-auto px-4 py-2 sm:px-5 sm:py-3">
            {selectedEvents.map((ev, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      typeColors[ev.type]
                    )}
                  >
                    {ev.type}
                  </Badge>
                  <span className="text-xs tabular-nums text-slate-500">
                    {ev.time}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {ev.title}
                </p>
                <p className="text-xs text-slate-500">
                  {ev.dept}
                  {ev.room ? ` · ${ev.room}` : ""}
                </p>
                {ev.deviceId ? (
                  <Link
                    href={`/fleet?device=${encodeURIComponent(ev.deviceId)}`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                  >
                    <span className="font-mono">{ev.deviceId}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                  </Link>
                ) : null}
              </li>
            ))}
            {!selectedEvents.length && selectedKey ? (
              <li className="text-center text-sm text-slate-500">
                {typeFilter !== "all"
                  ? "Try “All types” or another day."
                  : "No events on this day."}
              </li>
            ) : null}
            {!selectedKey ? (
              <li className="text-center text-sm text-slate-400">
                Select a calendar day to see PM, vendor, calibration, and IT
                windows.
              </li>
            ) : null}
          </ul>
          <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming this month
            </p>
            <ul className="mt-2 space-y-2">
              {upcoming.slice(0, 5).map(({ key, events }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      const parts = key.split("-");
                      const m = Number(parts[1]);
                      const d = Number(parts[2]);
                      if (m - 1 === month) setSelectedDay(d);
                    }}
                    className="w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-800">{key}</span>
                    <span className="text-slate-500">
                      {" "}
                      · {events[0]?.title}
                      {events.length > 1
                        ? ` (+${events.length - 1})`
                        : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </ViewPage>
  );
}
