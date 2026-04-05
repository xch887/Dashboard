"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PriorityStrip, StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
  MoreHorizontal,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";

type DeviceRow = {
  id: string;
  name: string;
  department: string;
  risk: "High" | "Med" | "Low" | "None";
  action: string;
  primaryCta: string;
  assignee: string;
  assigneeRole: string;
  dueDate: string;
  dueRelative: string;
  dueUrgency: "overdue" | "today" | "this_week" | "later";
  status: string;
  batteryPct: number;
  firmwareBehind: boolean;
  online: boolean;
  syncHoursAgo: number;
};

const devices: DeviceRow[] = [
  {
    id: "DEV-1001",
    name: "MRI Scanner A",
    department: "Radiology",
    risk: "High",
    action: "PM overdue (Joint Commission window)",
    primaryCta: "Schedule now",
    assignee: "Alex Morgan",
    assigneeRole: "Clinical Engineering",
    dueDate: "Apr 2",
    dueRelative: "OVERDUE",
    dueUrgency: "overdue",
    status: "Action Required",
    batteryPct: 22,
    firmwareBehind: true,
    online: true,
    syncHoursAgo: 8,
  },
  {
    id: "DEV-1003",
    name: "Ventilator #6",
    department: "ER",
    risk: "High",
    action: "Safety inspection due today",
    primaryCta: "Start inspection",
    assignee: "Chris Reynolds",
    assigneeRole: "Device Operations",
    dueDate: "Apr 3",
    dueRelative: "Due in 4 hr",
    dueUrgency: "today",
    status: "Action Required",
    batteryPct: 88,
    firmwareBehind: true,
    online: true,
    syncHoursAgo: 1,
  },
  {
    id: "DEV-1004",
    name: "CT Scanner B",
    department: "Imaging",
    risk: "Med",
    action: "Offline; check connectivity on site",
    primaryCta: "Dispatch tech",
    assignee: "Devon Wright",
    assigneeRole: "Clinical Engineering",
    dueDate: "Apr 4",
    dueRelative: "Due tomorrow",
    dueUrgency: "this_week",
    status: "In Progress",
    batteryPct: 54,
    firmwareBehind: false,
    online: false,
    syncHoursAgo: 12,
  },
  {
    id: "DEV-1002",
    name: "Infusion Pump #12",
    department: "ICU",
    risk: "Low",
    action: "Firmware ready after this shift",
    primaryCta: "Push update",
    assignee: "Jordan Patel",
    assigneeRole: "Healthcare IT Systems",
    dueDate: "Apr 5",
    dueRelative: "Due in 2 days",
    dueUrgency: "this_week",
    status: "Resolved",
    batteryPct: 28,
    firmwareBehind: true,
    online: true,
    syncHoursAgo: 2,
  },
  {
    id: "DEV-1006",
    name: "Ultrasound Unit #7",
    department: "Imaging",
    risk: "Low",
    action: "Calibration follow-up",
    primaryCta: "Open work order",
    assignee: "Jordan Patel",
    assigneeRole: "Healthcare IT Systems",
    dueDate: "Apr 8",
    dueRelative: "Due in 5 days",
    dueUrgency: "later",
    status: "In Progress",
    batteryPct: 71,
    firmwareBehind: false,
    online: true,
    syncHoursAgo: 0.5,
  },
  {
    id: "DEV-1005",
    name: "Dialysis Unit #3",
    department: "Nephrology",
    risk: "None",
    action: "Watch only; no patient impact",
    primaryCta: "Acknowledge",
    assignee: "Casey Liu",
    assigneeRole: "Biomedical Engineering",
    dueDate: "Apr 12",
    dueRelative: "Due next week",
    dueUrgency: "later",
    status: "Deferred",
    batteryPct: 92,
    firmwareBehind: false,
    online: true,
    syncHoursAgo: 3,
  },
];

function computePriority(d: DeviceRow): number {
  let s = 0;
  if (d.risk === "High") s += 34;
  else if (d.risk === "Med") s += 18;
  if (d.status === "Action Required") s += 28;
  if (d.dueUrgency === "overdue") s += 26;
  if (d.dueUrgency === "today") s += 14;
  if (d.dueUrgency === "this_week") s += 6;
  if (d.batteryPct < 25) s += 14;
  else if (d.batteryPct < 35) s += 9;
  if (d.firmwareBehind) s += 10;
  if (!d.online) s += 12;
  if (d.syncHoursAgo >= 6) s += 8;
  return Math.min(100, Math.round(s));
}

function mapUrlFilter(
  v: string | null
): "all" | "critical" | "action" | "overdue" | "mine" {
  if (v === "attention" || v === "action") return "action";
  if (v === "critical") return "critical";
  if (v === "overdue") return "overdue";
  if (v === "mine") return "mine";
  return "all";
}

function RiskPill({ risk }: { risk: string }) {
  const variant =
    risk === "High"
      ? ("danger" as const)
      : risk === "Med"
        ? ("warning" as const)
        : risk === "Low"
          ? ("info" as const)
          : ("neutral" as const);
  return (
    <Badge variant={variant} className="rounded-full text-[11px] font-semibold">
      {risk}
    </Badge>
  );
}

function QueueStatusChip({ status }: { status: string }) {
  switch (status) {
    case "Action Required":
      return (
        <StatusChip variant="danger" icon={AlertCircle}>
          {status}
        </StatusChip>
      );
    case "Resolved":
      return (
        <StatusChip variant="success" icon={CheckCircle2}>
          {status}
        </StatusChip>
      );
    case "In Progress":
      return (
        <StatusChip variant="info" icon={Send}>
          {status}
        </StatusChip>
      );
    case "Deferred":
      return <StatusChip variant="neutral">{status}</StatusChip>;
    default:
      return <StatusChip variant="neutral">{status}</StatusChip>;
  }
}

function BatteryBar({ pct }: { pct: number }) {
  const tone =
    pct < 25 ? "bg-rose-500" : pct < 40 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-[72px] space-y-0.5">
      <div className="flex items-center justify-between text-[10px] tabular-nums text-slate-500">
        <span>Battery</span>
        <span className="font-semibold text-slate-700">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  "Action Required",
  "In Progress",
  "Resolved",
  "Deferred",
] as const;

const RISK_OPTIONS = ["High", "Med", "Low", "None"] as const;

const DEPARTMENT_OPTIONS = [
  "Radiology",
  "ICU",
  "ER",
  "Imaging",
  "Nephrology",
  "Cardiology",
  "Surgery",
] as const;

const TEAM_OPTIONS = [
  "Clinical Engineering",
  "Healthcare IT Systems",
  "Device Operations",
  "Biomedical Engineering",
] as const;

const MODALITY_OPTIONS = [
  "MRI / CT",
  "Ventilation",
  "Infusion",
  "Ultrasound",
  "Dialysis",
  "Patient monitors",
] as const;

const DUE_PRESETS = [
  { id: "any", label: "Any" },
  { id: "overdue", label: "Overdue" },
  { id: "7d", label: "Next 7 days" },
  { id: "14d", label: "Next 14 days" },
  { id: "30d", label: "Next 30 days" },
] as const;

const SCOPE_IDS = [
  "patientFacing",
  "capital",
  "recall",
  "jointCommission",
] as const;

const SCOPE_OPTIONS: { id: (typeof SCOPE_IDS)[number]; label: string }[] = [
  { id: "patientFacing", label: "Patient-facing devices" },
  { id: "capital", label: "Capital equipment only" },
  { id: "recall", label: "Recall / safety watchlist" },
  { id: "jointCommission", label: "Joint Commission–tagged" },
];

function toggleKey<T extends string>(
  prev: Record<T, boolean>,
  key: T
): Record<T, boolean> {
  return { ...prev, [key]: !prev[key] };
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-left text-xs font-medium transition-all duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
        selected
          ? "border-blue-500/60 bg-blue-50 text-blue-900 shadow-sm shadow-blue-900/5"
          : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function FilterSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        {hint ? (
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function initialRecord<T extends string>(keys: readonly T[]): Record<T, boolean> {
  return Object.fromEntries(keys.map((k) => [k, false])) as Record<T, boolean>;
}

type QuickFilter = "all" | "critical" | "action" | "overdue" | "mine";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "action", label: "Action required" },
  { id: "overdue", label: "Overdue" },
  { id: "mine", label: "My assigned" },
];

export function DeviceTable({
  riskStyle = "pill",
  onToast,
}: {
  riskStyle?: "pill" | "strip";
  onToast?: (message: string) => void;
}) {
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");

  const [filterOpen, setFilterOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(() =>
    mapUrlFilter(urlFilter)
  );
  useEffect(() => {
    setQuickFilter(mapUrlFilter(urlFilter));
  }, [urlFilter]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [status, setStatus] = useState(() =>
    initialRecord(STATUS_OPTIONS)
  );
  const [risk, setRisk] = useState(() => initialRecord(RISK_OPTIONS));
  const [departments, setDepartments] = useState(() =>
    initialRecord(DEPARTMENT_OPTIONS)
  );
  const [teams, setTeams] = useState(() => initialRecord(TEAM_OPTIONS));
  const [modalities, setModalities] = useState(() =>
    initialRecord(MODALITY_OPTIONS)
  );
  const [duePreset, setDuePreset] = useState<(typeof DUE_PRESETS)[number]["id"]>(
    "any"
  );
  const [scope, setScope] = useState(() => initialRecord(SCOPE_IDS));

  const scored = useMemo(() => {
    return devices.map((d) => ({
      ...d,
      priority: computePriority(d),
    }));
  }, []);

  const filtered = useMemo(() => {
    return scored.filter((d) => {
      if (quickFilter === "critical") return d.risk === "High";
      if (quickFilter === "action") return d.status === "Action Required";
      if (quickFilter === "overdue") return d.dueUrgency === "overdue";
      if (quickFilter === "mine") return d.assignee === "Alex Morgan";
      return true;
    });
  }, [scored, quickFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const ha = handled.has(a.id) ? 1 : 0;
      const hb = handled.has(b.id) ? 1 : 0;
      if (ha !== hb) return ha - hb;
      return b.priority - a.priority;
    });
    return copy;
  }, [filtered, handled]);

  const actionRequiredCount = useMemo(
    () => scored.filter((d) => d.status === "Action Required").length,
    [scored]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    n += Object.values(status).filter(Boolean).length;
    n += Object.values(risk).filter(Boolean).length;
    n += Object.values(departments).filter(Boolean).length;
    n += Object.values(teams).filter(Boolean).length;
    n += Object.values(modalities).filter(Boolean).length;
    n += Object.values(scope).filter(Boolean).length;
    if (duePreset !== "any") n += 1;
    return n;
  }, [status, risk, departments, teams, modalities, scope, duePreset]);

  function clearAllFilters() {
    setStatus(initialRecord(STATUS_OPTIONS));
    setRisk(initialRecord(RISK_OPTIONS));
    setDepartments(initialRecord(DEPARTMENT_OPTIONS));
    setTeams(initialRecord(TEAM_OPTIONS));
    setModalities(initialRecord(MODALITY_OPTIONS));
    setDuePreset("any");
    setScope(initialRecord(SCOPE_IDS));
  }

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === sorted.length && sorted.length > 0) return new Set();
      return new Set(sorted.map((d) => d.id));
    });
  }, [sorted]);

  const runPrimary = useCallback(
    (d: DeviceRow) => {
      setLoadingId(d.id);
      window.setTimeout(() => {
        setLoadingId(null);
        setHandled((h) => new Set(h).add(d.id));
        onToast?.(`${d.primaryCta} · ${d.name}`);
      }, 1200);
    },
    [onToast]
  );

  const runBulk = useCallback(() => {
    setBulkLoading(true);
    window.setTimeout(() => {
      setBulkLoading(false);
      const ids = [...selected];
      setHandled((h) => {
        const n = new Set(h);
        ids.forEach((id) => n.add(id));
        return n;
      });
      setSelected(new Set());
      onToast?.(`Scheduled maintenance for ${ids.length} devices`);
    }, 1400);
  }, [selected, onToast]);

  const priorityDot = (p: number) => {
    if (p >= 75) return "bg-rose-500 ring-rose-200";
    if (p >= 50) return "bg-amber-500 ring-amber-200";
    if (p >= 30) return "bg-sky-500 ring-sky-200";
    return "bg-slate-300 ring-slate-200";
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow
      )}
    >
      <div className="flex flex-col gap-2.5 border-b border-black/10 bg-slate-50/40 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
          <h2 className="text-[15px] font-bold leading-tight tracking-tight text-slate-950">
            Device Action Queue
          </h2>
          <span className="text-[11px] leading-snug text-slate-500">
            {actionRequiredCount} need attention · sorted by risk (highest first)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-slate-200/90 bg-white/80 text-xs text-slate-600 hover:bg-white"
          >
            Next 14 days ▾
          </Button>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative h-8 gap-1.5 rounded-lg border-slate-200/90 bg-white/80 text-xs text-slate-600 hover:bg-white"
              >
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-blue-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full w-full max-h-full flex-col gap-0 border-slate-200/80 p-0 sm:max-w-[440px]"
            >
              <SheetHeader className="space-y-1 border-b border-slate-100 px-5 py-4 text-left">
                <SheetTitle className="text-base font-semibold text-slate-900">
                  Filter queue
                </SheetTitle>
                <SheetDescription className="text-xs leading-relaxed text-slate-500">
                  Narrow the action queue by risk, ownership, and compliance
                  context. Applied filters are preview-only until wired to data.
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-5">
                <FilterSection
                  title="Queue status"
                  hint="Match work order lifecycle in the queue."
                >
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <FilterChip
                        key={s}
                        selected={status[s]}
                        onClick={() =>
                          setStatus((prev) => toggleKey(prev, s))
                        }
                      >
                        {s}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Predicted risk"
                  hint="From model scores and recent telemetry."
                >
                  <div className="flex flex-wrap gap-2">
                    {RISK_OPTIONS.map((r) => (
                      <FilterChip
                        key={r}
                        selected={risk[r]}
                        onClick={() => setRisk((prev) => toggleKey(prev, r))}
                      >
                        {r}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Department / unit"
                  hint="Hospital location for routing and escalation."
                >
                  <div className="flex flex-wrap gap-2">
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <FilterChip
                        key={d}
                        selected={departments[d]}
                        onClick={() =>
                          setDepartments((prev) => toggleKey(prev, d))
                        }
                      >
                        {d}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Assigned team"
                  hint="Owner group responsible for closure."
                >
                  <div className="flex flex-wrap gap-2">
                    {TEAM_OPTIONS.map((t) => (
                      <FilterChip
                        key={t}
                        selected={teams[t]}
                        onClick={() => setTeams((prev) => toggleKey(prev, t))}
                      >
                        {t}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Due window"
                  hint="Relative to today’s hospital calendar."
                >
                  <div className="flex flex-wrap gap-2">
                    {DUE_PRESETS.map((p) => (
                      <FilterChip
                        key={p.id}
                        selected={duePreset === p.id}
                        onClick={() => setDuePreset(p.id)}
                      >
                        {p.label}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Modality / device class"
                  hint="High-level asset families (demo labels)."
                >
                  <div className="flex flex-wrap gap-2">
                    {MODALITY_OPTIONS.map((m) => (
                      <FilterChip
                        key={m}
                        selected={modalities[m]}
                        onClick={() =>
                          setModalities((prev) => toggleKey(prev, m))
                        }
                      >
                        {m}
                      </FilterChip>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection
                  title="Compliance & scope"
                  hint="Regulatory and safety lenses common in acute care."
                >
                  <div className="flex flex-col gap-2">
                    {SCOPE_OPTIONS.map(({ id, label }) => (
                      <label
                        key={id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                          scope[id]
                            ? "border-blue-500/40 bg-blue-50/50"
                            : "border-slate-200/90 bg-white hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={scope[id]}
                          onChange={() =>
                            setScope((prev) => ({
                              ...prev,
                              [id]: !prev[id],
                            }))
                          }
                          className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                        />
                        <span className="text-xs font-medium leading-snug text-slate-800">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>

              <SheetFooter className="flex-row flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
                <SheetClose asChild>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-md bg-blue-600 text-white shadow-sm shadow-blue-900/20 hover:bg-blue-700"
                  >
                    Apply filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-black/10 bg-white px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Quick focus
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuickFilter(q.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                quickFilter === q.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-blue-50/60 px-5 py-3">
          <p className="text-xs font-medium text-slate-800">
            <span className="font-bold tabular-nums">{selected.size}</span>{" "}
            selected
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-2 font-semibold"
            disabled={bulkLoading}
            onClick={runBulk}
          >
            {bulkLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : null}
            Schedule maintenance for all
          </Button>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 bg-slate-50/25 hover:bg-transparent">
            <TableHead className="h-9 w-10 px-2 py-2">
              <input
                type="checkbox"
                checked={
                  sorted.length > 0 && selected.size === sorted.length
                }
                onChange={toggleSelectAll}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                aria-label="Select all visible devices"
              />
            </TableHead>
            <TableHead className="h-9 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Rank
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Device
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Department
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Risk
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Battery
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Signals
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Context
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Assigned
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Due
            </TableHead>
            <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Status
            </TableHead>
            <TableHead className="h-9 min-w-[120px] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Next step
            </TableHead>
            <TableHead className="h-9 w-10 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={13}
                className="px-5 py-10 text-center text-sm text-slate-600"
              >
                No devices match this filter. Try{" "}
                <button
                  type="button"
                  className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                  onClick={() => setQuickFilter("all")}
                >
                  clearing quick focus
                </button>{" "}
                or open advanced filters.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((device, index) => {
              const topPriority = index === 0 && !handled.has(device.id);
              const isDimmed = handled.has(device.id);
              return (
                <TableRow
                  key={device.id}
                  className={cn(
                    "group border-slate-100 transition-[background-color,box-shadow,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
                    "hover:bg-blue-500/[0.04] hover:shadow-[inset_0_0_0_1px_rgb(37_99_235/0.08)]",
                    topPriority &&
                      "border-l-4 border-l-rose-500 bg-rose-50/25 hover:bg-rose-50/40",
                    isDimmed && "opacity-55"
                  )}
                >
                  <TableCell className="px-2 py-2.5 align-middle">
                    <input
                      type="checkbox"
                      checked={selected.has(device.id)}
                      onChange={() => toggleSelect(device.id)}
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                      aria-label={`Select ${device.name}`}
                    />
                  </TableCell>
                  <TableCell className="px-2 py-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-2.5 w-2.5 shrink-0 rounded-full ring-2",
                          priorityDot(device.priority)
                        )}
                        title={`Priority score ${device.priority}`}
                      />
                      <span className="text-xs font-bold tabular-nums text-slate-800">
                        {device.priority}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 align-middle">
                    <div>
                      <p className="text-[13px] font-semibold leading-snug text-slate-900">
                        {device.name}
                      </p>
                      <p className="font-mono text-[11px] leading-snug text-slate-400">
                        {device.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[13px] leading-snug text-slate-600">
                    {device.department}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    {riskStyle === "pill" ? (
                      <RiskPill risk={device.risk} />
                    ) : (
                      <PriorityStrip level={device.risk} />
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <BatteryBar pct={device.batteryPct} />
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1.5">
                        {device.online ? (
                          <Wifi
                            className="h-3.5 w-3.5 text-emerald-600"
                            aria-hidden
                          />
                        ) : (
                          <WifiOff
                            className="h-3.5 w-3.5 text-rose-600"
                            aria-hidden
                          />
                        )}
                        {device.online ? "Online" : "Offline"}
                      </span>
                      <span className="text-slate-500">
                        Sync {device.syncHoursAgo < 1 ? "<1 hr" : `${Math.round(device.syncHoursAgo)} hr`}{" "}
                        ago
                      </span>
                      {device.firmwareBehind ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                          <AlertTriangle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden
                          />
                          Firmware behind
                        </span>
                      ) : (
                        <span className="text-emerald-700">Firmware current</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] px-3 py-2.5 text-[12px] leading-snug text-slate-600">
                    {device.action}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <div>
                      <p className="text-[13px] font-medium leading-snug text-slate-800">
                        {device.assignee}
                      </p>
                      <p className="text-[11px] leading-snug text-slate-400">
                        {device.assigneeRole}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 align-middle">
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          device.dueUrgency === "overdue" &&
                            "bg-rose-100 text-rose-900 ring-1 ring-rose-200",
                          device.dueUrgency === "today" &&
                            "bg-amber-100 text-amber-950 ring-1 ring-amber-200",
                          device.dueUrgency === "this_week" &&
                            "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
                          device.dueUrgency === "later" &&
                            "bg-slate-50 text-slate-500 ring-1 ring-slate-200/80"
                        )}
                      >
                        {device.dueRelative}
                      </span>
                      <span className="text-[11px] tabular-nums text-slate-500">
                        {device.dueDate}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <QueueStatusChip status={device.status} />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 align-middle">
                    <Button
                      type="button"
                      size="sm"
                      className={cn(
                        "h-8 whitespace-nowrap font-semibold shadow-sm transition-[transform,box-shadow] group-hover:shadow-md",
                        device.status === "Action Required"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-800 hover:bg-slate-900"
                      )}
                      disabled={loadingId === device.id || isDimmed}
                      onClick={() => runPrimary(device)}
                    >
                      {loadingId === device.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : (
                        device.primaryCta
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="px-2 py-2.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 opacity-80 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
