"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  MapPin,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertIncidentStatus =
  | "Open"
  | "Acknowledged"
  | "Linked WO"
  | "Closed"
  | "Reviewed";

export type AlertIncident = {
  id: string;
  timeLabel: string;
  dateLabel: string;
  title: string;
  department: string;
  room: string;
  deviceId: string;
  deviceName: string;
  detail: string;
  severity: AlertSeverity;
  status: AlertIncidentStatus;
  primary: string;
  /** Extra outline action (e.g. Snooze). Assign is always available while open. */
  secondary: { label: string } | null;
};

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const severityDot: Record<AlertSeverity, string> = {
  critical: "bg-rose-500 ring-rose-200",
  high: "bg-orange-500 ring-orange-200",
  medium: "bg-amber-400 ring-amber-100",
  low: "bg-slate-400 ring-slate-200",
};

const alertStatusVariant: Record<
  AlertIncidentStatus,
  "danger" | "warning" | "info" | "neutral" | "success"
> = {
  Open: "danger",
  Acknowledged: "warning",
  "Linked WO": "info",
  Closed: "neutral",
  Reviewed: "success",
};

const ASSIGNEES = [
  "Alex Morgan",
  "Jordan Lee",
  "Sam Rivera",
  "Priya Shah",
  "Chris Okonkwo",
] as const;

export const ALERT_INCIDENTS: AlertIncident[] = [
  {
    id: "ALT-9821",
    timeLabel: "08:14",
    dateLabel: "Today",
    title: "Critical battery — telemetry drain spike",
    department: "ICU",
    room: "Room 208",
    deviceId: "DEV-2041",
    deviceName: "Philips IntelliVue MX800",
    detail: "Escalated to on-call biomed · threshold crossed 12m ago",
    severity: "critical",
    status: "Open",
    primary: "Respond",
    secondary: null,
  },
  {
    id: "ALT-9814",
    timeLabel: "07:02",
    dateLabel: "Today",
    title: "Sync gap exceeded — cloud uplink",
    department: "ICU",
    room: "Room 205",
    deviceId: "DEV-1088",
    deviceName: "GE CARESCAPE B850",
    detail: "First response acknowledged · vendor bridge stable",
    severity: "high",
    status: "Acknowledged",
    primary: "Escalate",
    secondary: { label: "Resolve" },
  },
  {
    id: "ALT-9788",
    timeLabel: "06:40",
    dateLabel: "Today",
    title: "Infusion pump occlusion alarm storm",
    department: "ER",
    room: "Bay 3",
    deviceId: "DEV-3312",
    deviceName: "B. Braun SpaceCom",
    detail: "3 events in 20m · nursing notified",
    severity: "high",
    status: "Open",
    primary: "Acknowledge",
    secondary: null,
  },
  {
    id: "ALT-9650",
    timeLabel: "Yesterday",
    dateLabel: "Apr 2",
    title: "Calibration due window opened",
    department: "Dialysis",
    room: "Unit 3",
    deviceId: "DEV-0892",
    deviceName: "Fresenius 5008S",
    detail: "Auto-ticket WO-44821 · PM coordinator loop",
    severity: "medium",
    status: "Linked WO",
    primary: "Open WO",
    secondary: { label: "Snooze" },
  },
  {
    id: "ALT-9601",
    timeLabel: "Apr 1",
    dateLabel: "17:40",
    title: "Vendor maintenance overrun",
    department: "Imaging",
    room: "MRI Suite A",
    deviceId: "DEV-4401",
    deviceName: "Siemens MAGNETOM",
    detail: "Block cleared · post-incident note added",
    severity: "low",
    status: "Closed",
    primary: "View note",
    secondary: null,
  },
  {
    id: "ALT-9588",
    timeLabel: "Apr 1",
    dateLabel: "11:05",
    title: "Network jitter — telemetry VLAN",
    department: "ICU",
    room: "Nurse station",
    deviceId: "DEV-5510",
    deviceName: "Capsule Neuron 2",
    detail: "NetOps engaged · redundant path failed over",
    severity: "medium",
    status: "Acknowledged",
    primary: "Update status",
    secondary: null,
  },
  {
    id: "ALT-9544",
    timeLabel: "Mar 31",
    dateLabel: "11:22",
    title: "Failed auth burst — integration service",
    department: "Lab",
    room: "Core lab",
    deviceId: "DEV-6120",
    deviceName: "Roche cobas interface",
    detail: "3 accounts · Security notified · SIEM forwarded",
    severity: "medium",
    status: "Reviewed",
    primary: "Reopen",
    secondary: null,
  },
  {
    id: "ALT-9510",
    timeLabel: "Mar 31",
    dateLabel: "09:18",
    title: "Oxygen analyzer out of range",
    department: "Respiratory",
    room: "RT workshop",
    deviceId: "DEV-7734",
    deviceName: "Maxtec O2 analyzer",
    detail: "Bench verification scheduled · backup unit deployed",
    severity: "high",
    status: "Open",
    primary: "Schedule check",
    secondary: null,
  },
  {
    id: "ALT-9482",
    timeLabel: "Mar 30",
    dateLabel: "16:02",
    title: "UPS self-test warning",
    department: "Facilities",
    room: "OR 4 electrical",
    deviceId: "DEV-8891",
    deviceName: "Eaton 9PX UPS",
    detail: "Battery string 2 · facilities ticket F-9921",
    severity: "low",
    status: "Acknowledged",
    primary: "Acknowledge",
    secondary: { label: "Hand off" },
  },
  {
    id: "ALT-9455",
    timeLabel: "Mar 30",
    dateLabel: "14:51",
    title: "Temperature excursion — vaccine fridge",
    department: "Pharmacy",
    room: "Satellite B",
    deviceId: "DEV-9022",
    deviceName: "TempGuard Pro",
    detail: "2.8°C for 6m · compliance hold per policy",
    severity: "critical",
    status: "Open",
    primary: "Respond",
    secondary: null,
  },
];

type SeverityFilter = "all" | AlertSeverity;
type StatusFilter = "all" | AlertIncidentStatus;

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
        active
          ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
          : "border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

export function AlertsTriageQueue() {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const departments = useMemo(() => {
    const u = new Set(ALERT_INCIDENTS.map((i) => i.department));
    return [...u].sort();
  }, []);

  const filtered = useMemo(() => {
    return ALERT_INCIDENTS.filter((i) => {
      if (severityFilter !== "all" && i.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== "all" && i.status !== statusFilter) {
        return false;
      }
      if (deptFilter !== "all" && i.department !== deptFilter) {
        return false;
      }
      return true;
    }).sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );
  }, [severityFilter, statusFilter, deptFilter]);

  const runPrimary = useCallback((id: string) => {
    setBusy(id);
    window.setTimeout(() => {
      setBusy(null);
      setDone((d) => new Set(d).add(id));
    }, 1100);
  }, []);

  const assignTo = useCallback((incidentId: string, name: string) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (!name) {
        delete next[incidentId];
      } else {
        next[incidentId] = name;
      }
      return next;
    });
  }, []);

  const clearFilters =
    severityFilter !== "all" ||
    statusFilter !== "all" ||
    deptFilter !== "all";

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm ring-1 ring-slate-200/50"
      aria-label="Incident triage queue"
    >
      <div className="mb-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Triage queue — critical first
            </h2>
            <p className="text-xs text-slate-500">
              Filter by severity, status, or department. Assign owners and open
              the linked device on the fleet roster.
            </p>
          </div>
          <p className="text-[11px] font-medium tabular-nums text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">{filtered.length}</span>
            /{ALERT_INCIDENTS.length}
          </p>
        </div>

        <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4 xl:grid-cols-3 xl:gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Severity
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={severityFilter === "all"}
                onClick={() => setSeverityFilter("all")}
              >
                All
              </FilterPill>
              {(
                ["critical", "high", "medium", "low"] as const
              ).map((s) => (
                <FilterPill
                  key={s}
                  active={severityFilter === s}
                  onClick={() => setSeverityFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </FilterPill>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Status
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </FilterPill>
              {(
                [
                  "Open",
                  "Acknowledged",
                  "Linked WO",
                  "Closed",
                  "Reviewed",
                ] as const
              ).map((s) => (
                <FilterPill
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </FilterPill>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2 xl:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Department
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={deptFilter === "all"}
                onClick={() => setDeptFilter("all")}
              >
                All
              </FilterPill>
              {departments.map((d) => (
                <FilterPill
                  key={d}
                  active={deptFilter === d}
                  onClick={() => setDeptFilter(d)}
                >
                  {d}
                </FilterPill>
              ))}
            </div>
          </div>
          {clearFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 self-start px-2 text-[11px] font-semibold text-slate-600 xl:col-span-3"
              onClick={() => {
                setSeverityFilter("all");
                setStatusFilter("all");
                setDeptFilter("all");
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      <ul className="space-y-4" role="list">
        {filtered.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
            No incidents match these filters.
          </li>
        ) : null}
        {filtered.map((item) => {
          const isCritical = item.severity === "critical";
          const isHigh = item.severity === "high";
          const subdued = item.severity === "low" || item.severity === "medium";
          const handled = done.has(item.id);
          const assignee = assignments[item.id];
          const canAssign = item.status !== "Closed" && item.status !== "Reviewed";
          const fleetHref = `/fleet?device=${encodeURIComponent(item.deviceId)}`;

          return (
            <li
              key={item.id}
              className={cn(handled && "opacity-50")}
            >
              <div
                className={cn(
                  "overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 transition-shadow duration-200",
                  "hover:shadow-md",
                  isCritical && "border-l-4 border-l-rose-600 ring-rose-100/50",
                  isHigh && "border-l-4 border-l-orange-500 ring-orange-100/40",
                  subdued && "ring-slate-100/80"
                )}
              >
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-stretch lg:gap-0 lg:p-0">
                  <div className="min-w-0 flex-1 space-y-3 lg:p-5 lg:pr-6">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full ring-2 ring-white",
                          severityDot[item.severity]
                        )}
                        aria-hidden
                      />
                      <span className="font-mono text-[11px] font-medium text-slate-400">
                        {item.id}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold tabular-nums text-slate-600">
                        {item.timeLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.dateLabel}
                      </span>
                      <Badge
                        variant={alertStatusVariant[item.status]}
                        className="text-[10px] font-semibold"
                      >
                        {item.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold capitalize"
                      >
                        {item.severity}
                      </Badge>
                      {assignee ? (
                        <Badge variant="info" className="text-[10px] font-semibold">
                          Owner:{" "}
                          {(() => {
                            const p = assignee.split(" ");
                            return p.length >= 2
                              ? `${p[0]} ${p[1]![0]}.`
                              : assignee;
                          })()}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "text-pretty text-base leading-snug text-slate-900 sm:text-[1.05rem]",
                          isCritical && "font-extrabold",
                          isHigh && "font-bold",
                          !isCritical && !isHigh && "font-semibold"
                        )}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {item.detail}
                      </p>
                    </div>

                    <div className="grid gap-4 border-t border-slate-100 pt-3 sm:grid-cols-2">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <MapPin className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Location
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">
                            {item.department}
                          </p>
                          <p className="text-xs text-slate-500">{item.room}</p>
                        </div>
                      </div>
                      <div className="min-w-0 sm:border-l sm:border-slate-100 sm:pl-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Device
                        </p>
                        <p className="mt-0.5 text-sm font-medium leading-snug text-slate-800">
                          {item.deviceName}
                        </p>
                        <Link
                          href={fleetHref}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <span className="font-mono">{item.deviceId}</span>
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0 opacity-70"
                            aria-hidden
                          />
                          Open on fleet roster
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex flex-col justify-center gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap lg:w-[min(100%,13.5rem)] lg:flex-col lg:border-t-0 lg:border-l lg:px-5 lg:py-5 lg:pt-5",
                      "bg-slate-50/40 lg:bg-slate-50/30"
                    )}
                  >
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full sm:min-w-0 sm:flex-1 lg:w-full"
                      disabled={busy === item.id || handled}
                      onClick={() => runPrimary(item.id)}
                    >
                      {busy === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : handled ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Done
                        </>
                      ) : (
                        item.primary
                      )}
                    </Button>
                    {canAssign ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-1 sm:min-w-0 sm:flex-1 lg:w-full"
                            disabled={busy === item.id || handled}
                          >
                            <UserPlus className="h-3.5 w-3.5" aria-hidden />
                            Assign
                            <ChevronDown
                              className="h-3 w-3 opacity-60"
                              aria-hidden
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs">
                            Assign owner
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ASSIGNEES.map((name) => (
                            <DropdownMenuItem
                              key={name}
                              className="text-sm"
                              onClick={() => assignTo(item.id, name)}
                            >
                              {name}
                              {assignee === name ? (
                                <Check className="ml-auto h-3.5 w-3.5" />
                              ) : null}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-sm text-slate-600"
                            onClick={() => assignTo(item.id, "")}
                          >
                            Clear assignment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                    {item.secondary ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:min-w-0 sm:flex-1 lg:w-full"
                        disabled={busy === item.id || handled}
                      >
                        {item.secondary.label}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
