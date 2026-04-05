"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import {
  Wrench,
  Calendar,
  Sparkles,
  Plus,
  Gauge,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HighlightCard,
  SectionCard,
  StatCard,
  TableCard,
} from "@/components/dashboard/section-card";

/** Demo “today” for due-window copy (aligns with portfolio calendar). */
const DEMO_TODAY = "2026-04-03";

export type MaintenanceTaskType =
  | "Preventive"
  | "Vendor"
  | "Corrective"
  | "Compliance"
  | "Follow-up";

export type MaintenanceScheduleKind = "calendar" | "meter";

export type MaintenanceStatus = "overdue" | "due_soon" | "scheduled";

export type MaintenanceTask = {
  id: string;
  title: string;
  taskType: MaintenanceTaskType;
  deviceLabel: string;
  deviceId: string | null;
  dueLabel: string;
  dueSort: string;
  window: string;
  owner: string;
  scheduleKind: MaintenanceScheduleKind;
  status: MaintenanceStatus;
  meterUnit?: string;
  meterCurrent?: number;
  meterDue?: number;
  lastPmLabel?: string;
  checklistSummary?: string;
};

const STATUS_RANK: Record<MaintenanceStatus, number> = {
  overdue: 0,
  due_soon: 1,
  scheduled: 2,
};

const TASKS: MaintenanceTask[] = [
  {
    id: "PM-8788",
    title: "Annual electrical safety — bedside monitor",
    taskType: "Compliance",
    deviceLabel: "GE CARESCAPE B850",
    deviceId: "DEV-1088",
    dueLabel: "Mar 28",
    dueSort: "2026-03-28",
    window: "08:00–14:00",
    owner: "Clinical Engineering",
    scheduleKind: "calendar",
    status: "overdue",
    lastPmLabel: "Mar 2025",
    checklistSummary:
      "Ground continuity, leakage current, alarm loudness per AAMI.",
  },
  {
    id: "PM-8782",
    title: "Tube scan-hour PM — Siemens CT",
    taskType: "Preventive",
    deviceLabel: "Siemens SOMATOM",
    deviceId: "DEV-1088",
    dueLabel: "Apr 22 (meter)",
    dueSort: "2026-04-22",
    window: "Between cases",
    owner: "Clinical Engineering",
    scheduleKind: "meter",
    status: "overdue",
    meterUnit: "scan hours",
    meterCurrent: 132_400,
    meterDue: 128_000,
    lastPmLabel: "Aug 2025 @ 120k hrs",
    checklistSummary:
      "OEM tube life checklist, image quality phantom, cooling loop inspect.",
  },
  {
    id: "PM-8832",
    title: "Quarterly PM — patient monitor",
    taskType: "Preventive",
    deviceLabel: "Philips IntelliVue MX800",
    deviceId: "DEV-2041",
    dueLabel: "Apr 4",
    dueSort: "2026-04-04",
    window: "06:00–09:00",
    owner: "Clinical Engineering",
    scheduleKind: "calendar",
    status: "due_soon",
    lastPmLabel: "Jan 2026",
    checklistSummary: "NIBP static/dynamic, SpO2 noise floor, battery run-down.",
  },
  {
    id: "PM-8821",
    title: "Quarterly PM — MRI suite",
    taskType: "Preventive",
    deviceLabel: "Siemens MAGNETOM",
    deviceId: "DEV-4401",
    dueLabel: "Apr 6",
    dueSort: "2026-04-06",
    window: "06:00–10:00",
    owner: "Clinical Engineering",
    scheduleKind: "calendar",
    status: "due_soon",
    lastPmLabel: "Jan 2026",
    checklistSummary: "Coil QA, quench duct visual, patient table motion.",
  },
  {
    id: "PM-8840",
    title: "Patient-hour service — dialysis unit",
    taskType: "Preventive",
    deviceLabel: "Fresenius 5008S",
    deviceId: "DEV-0892",
    dueLabel: "Apr 7",
    dueSort: "2026-04-07",
    window: "02:00–06:00",
    owner: "Clinical Engineering",
    scheduleKind: "meter",
    status: "due_soon",
    meterUnit: "patient hours",
    meterCurrent: 18_100,
    meterDue: 18_000,
    lastPmLabel: "Oct 2025 @ 15k hrs",
    checklistSummary: "Hydraulic section, UF pump, disinfect log signature.",
  },
  {
    id: "PM-8814",
    title: "Vendor PM — CT cooling subsystem",
    taskType: "Vendor",
    deviceLabel: "Siemens SOMATOM",
    deviceId: "DEV-1088",
    dueLabel: "Apr 8",
    dueSort: "2026-04-08",
    window: "Vendor block · 4h",
    owner: "Siemens Field Service",
    scheduleKind: "calendar",
    status: "due_soon",
    checklistSummary: "OEM cooling filter R&R — coordinate with imaging lead.",
  },
  {
    id: "PM-8802",
    title: "Battery swap batch — telemetry",
    taskType: "Corrective",
    deviceLabel: "12 patches · ICU",
    deviceId: null,
    dueLabel: "Apr 9",
    dueSort: "2026-04-09",
    window: "Night shift",
    owner: "Biomed on-call",
    scheduleKind: "calendar",
    status: "scheduled",
    checklistSummary: "Swap CR2032, verify RSSI, document asset serials in CMMS.",
  },
  {
    id: "PM-8798",
    title: "Electrical safety — infusion rack",
    taskType: "Compliance",
    deviceLabel: "ICU West rack",
    deviceId: null,
    dueLabel: "Apr 11",
    dueSort: "2026-04-11",
    window: "08:00–12:00",
    owner: "Clinical Engineering",
    scheduleKind: "calendar",
    status: "scheduled",
    checklistSummary: "Six pumps per rack, earth bond, free-flow occlusion.",
  },
  {
    id: "PM-8791",
    title: "Ventilator extended test (post-alert)",
    taskType: "Follow-up",
    deviceLabel: "Hamilton C6",
    deviceId: "DEV-3312",
    dueLabel: "Apr 12",
    dueSort: "2026-04-12",
    window: "After hours",
    owner: "Device Operations",
    scheduleKind: "calendar",
    status: "scheduled",
    checklistSummary: "Leak, high-pressure relief, O2 sensor drift log.",
  },
  {
    id: "PM-8845",
    title: "UPS runtime verification",
    taskType: "Preventive",
    deviceLabel: "Eaton 9PX UPS",
    deviceId: "DEV-8891",
    dueLabel: "Apr 18",
    dueSort: "2026-04-18",
    window: "Facilities LOTO",
    owner: "Clinical Engineering",
    scheduleKind: "calendar",
    status: "scheduled",
    lastPmLabel: "Apr 2025",
    checklistSummary: "Battery impedance sample, transfer test, alarm to NOC.",
  },
];

const typeStyles: Record<MaintenanceTaskType, string> = {
  Preventive: "bg-blue-500/10 text-blue-800 border-blue-500/20",
  Vendor: "bg-violet-500/10 text-violet-800 border-violet-500/20",
  Corrective: "bg-orange-500/10 text-orange-900 border-orange-500/20",
  Compliance: "bg-cyan-500/10 text-cyan-900 border-cyan-500/20",
  "Follow-up": "bg-slate-100 text-slate-700 border-slate-200",
};

const statusStyles: Record<MaintenanceStatus, string> = {
  overdue: "bg-rose-500/12 text-rose-900 border-rose-500/30",
  due_soon: "bg-amber-500/12 text-amber-950 border-amber-500/25",
  scheduled: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusLabel: Record<MaintenanceStatus, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  scheduled: "Scheduled",
};

type QuickFilter = "all" | "overdue" | "due_14d" | "meter";

function withinDaysFromDemo(dueSort: string, days: number) {
  const start = new Date(`${DEMO_TODAY}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const d = new Date(`${dueSort}T12:00:00`);
  return d >= start && d <= end;
}

function MeterReadout({
  current,
  due,
  unit,
  status,
}: {
  current: number;
  due: number;
  unit: string;
  status: MaintenanceStatus;
}) {
  const ratio = due > 0 ? current / due : 0;
  const over = current >= due;
  const widthPct = Math.min(100, ratio * 100);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <Gauge className="h-3.5 w-3.5" aria-hidden />
          Meter trigger
        </span>
        {over || status === "overdue" ? (
          <Badge variant="danger" className="text-[10px] font-semibold">
            At / over threshold
          </Badge>
        ) : (
          <Badge variant="info" className="text-[10px] font-semibold">
            In range
          </Badge>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-semibold tabular-nums",
          over ? "text-rose-800" : "text-slate-800"
        )}
      >
        {current.toLocaleString()} / {due.toLocaleString()}{" "}
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            over ? "bg-rose-500" : "bg-blue-600"
          )}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {over ? (
        <p className="mt-2 text-[11px] leading-snug text-rose-800">
          Reading met or exceeded the PM interval — prioritize before next
          clinical block.
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">
          PM generates automatically when the counter crosses the due value.
        </p>
      )}
    </div>
  );
}

export function MaintenanceView() {
  const [selectedId, setSelectedId] = useState(TASKS[0].id);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const filtered = useMemo(() => {
    return TASKS.filter((t) => {
      if (quickFilter === "overdue") return t.status === "overdue";
      if (quickFilter === "meter") return t.scheduleKind === "meter";
      if (quickFilter === "due_14d") return withinDaysFromDemo(t.dueSort, 14);
      return true;
    }).sort((a, b) => {
      const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (sr !== 0) return sr;
      return a.dueSort.localeCompare(b.dueSort);
    });
  }, [quickFilter]);

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((t) => t.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const active =
    filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const c = sectionConfigs.maintenance;
  const stats = c.stats;

  const badgeCounts = useMemo(() => {
    const overdue = TASKS.filter((t) => t.status === "overdue").length;
    const meter = TASKS.filter((t) => t.scheduleKind === "meter").length;
    const due14 = TASKS.filter((t) => withinDaysFromDemo(t.dueSort, 14)).length;
    return { overdue, meter, due14 };
  }, []);

  return (
    <ViewPage>
      <PageHeader
        icon={Wrench}
        title={c.title}
        description={c.description}
        actions={
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_99_235/0.5)] hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Schedule new tasks
          </Button>
        }
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCard
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
            />
          </li>
        ))}
      </ul>

      <section aria-labelledby="ai-insights-heading">
        <HighlightCard>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-900/20">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <h2
              id="ai-insights-heading"
              className="text-sm font-bold text-slate-950"
            >
              AI insights
            </h2>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-blue-500/20">
              Suggested
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Meter-based CT work is over threshold while a vendor cooling PM is
            booked—sequence OEM first, then run your electrical safety batch on
            adjacent days.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              {
                t: "Batch MRI + ultrasound PMs",
                d: "Apr 6 morning cluster saves roughly 30% travel vs scattered slots.",
              },
              {
                t: "Dialysis meter window",
                d: "Patient hours crossed 18k — line up disinfect consumables before night shift.",
              },
              {
                t: "Vendor conflict",
                d: "CT cooling block Apr 8 overlaps infusion rack safety—split AM/PM crews.",
              },
            ].map((x) => (
              <li
                key={x.t}
                className="rounded-lg border border-slate-200/90 bg-white p-3 text-left shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-900">{x.t}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">
                  {x.d}
                </p>
              </li>
            ))}
          </ul>
        </HighlightCard>
      </section>

      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <SectionCard as="section" className="flex flex-col overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  PM & service queue
                </h2>
                <p className="text-xs text-slate-500">
                  Calendar and meter triggers · overdue and due-soon sort first.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 rounded-lg text-xs"
                asChild
              >
                <Link href="/calendar">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  Open calendar
                </Link>
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all" as const, label: "All", count: TASKS.length },
                  {
                    id: "overdue" as const,
                    label: "Overdue",
                    count: badgeCounts.overdue,
                  },
                  {
                    id: "due_14d" as const,
                    label: "Due 14d",
                    count: badgeCounts.due14,
                  },
                  {
                    id: "meter" as const,
                    label: "Meter",
                    count: badgeCounts.meter,
                  },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setQuickFilter(f.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    quickFilter === f.id
                      ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
                      : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {f.label}
                  <span className="ml-1 tabular-nums text-slate-400">
                    ({f.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-slate-500">
                No tasks match this filter.
              </li>
            ) : null}
            {filtered.map((row) => {
              const sel = row.id === selectedId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                      sel
                        ? "bg-blue-50 ring-1 ring-inset ring-blue-500/20"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">
                          {row.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-medium",
                            typeStyles[row.taskType]
                          )}
                        >
                          {row.taskType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-medium",
                            statusStyles[row.status]
                          )}
                        >
                          {statusLabel[row.status]}
                        </Badge>
                        {row.scheduleKind === "meter" ? (
                          <span className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-px text-[9px] font-semibold text-slate-600">
                            <Gauge className="h-2.5 w-2.5" aria-hidden />
                            Meter
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {row.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {row.deviceLabel}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">
                          {row.owner}
                        </span>
                        {" · "}
                        {row.window}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end pt-0.5">
                      <span className="text-xs font-bold tabular-nums text-slate-900">
                        {row.dueLabel}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard as="aside" className="flex flex-col p-0">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-700">
                Select a maintenance task
              </p>
              <p className="text-xs text-slate-500">
                Details include documentation cues and fleet links per asset.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="font-mono text-xs text-slate-400">{active.id}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {active.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      typeStyles[active.taskType]
                    )}
                  >
                    {active.taskType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      statusStyles[active.status]
                    )}
                  >
                    {statusLabel[active.status]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {active.scheduleKind === "meter"
                      ? "Meter-based"
                      : "Calendar"}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 space-y-4 px-5 py-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Due
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {active.dueLabel}
                    </dd>
                    <dd className="mt-1 text-xs text-slate-500">
                      Window: {active.window}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Owner
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">
                      {active.owner}
                    </dd>
                    {active.lastPmLabel ? (
                      <dd className="mt-1 text-xs text-slate-500">
                        Last PM: {active.lastPmLabel}
                      </dd>
                    ) : null}
                  </div>
                </dl>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Asset / scope
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {active.deviceLabel}
                  </p>
                  {active.deviceId ? (
                    <p className="mt-2">
                      <Link
                        href={`/fleet?device=${encodeURIComponent(active.deviceId)}`}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-700 hover:underline"
                      >
                        {active.deviceId}
                        <ExternalLink
                          className="h-3 w-3 opacity-70"
                          aria-hidden
                        />
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Multi-location batch — attach serials on close-out in
                      CMMS.
                    </p>
                  )}
                </div>

                {active.scheduleKind === "meter" &&
                active.meterCurrent != null &&
                active.meterDue != null &&
                active.meterUnit ? (
                  <MeterReadout
                    current={active.meterCurrent}
                    due={active.meterDue}
                    unit={active.meterUnit}
                    status={active.status}
                  />
                ) : null}

                {active.checklistSummary ? (
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <ClipboardList
                        className="h-4 w-4 text-slate-400"
                        aria-hidden
                      />
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Documentation
                      </h4>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {active.checklistSummary}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Signed PDFs and photos roll up to the asset record for
                      Joint Commission traceability.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2">
                  <Button
                    size="sm"
                    className="rounded-lg bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Log meter reading
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <Link href="/work-orders">Create work order</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </ViewPage>
  );
}
