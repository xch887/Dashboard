"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BatteryBar } from "@/components/dashboard/battery-bar";
import { FleetDeviceDetailSheet } from "@/components/dashboard/fleet-device-detail-sheet";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Connectivity = "Online" | "Degraded" | "Offline";

export type FleetMaintenanceRecord = {
  id: string;
  title: string;
  date: string;
};

export type FleetRow = {
  id: string;
  name: string;
  department: string;
  connectivity: Connectivity;
  lastSync: string;
  firmwareCurrent: string;
  firmwareLatest: string;
  firmwareBehind: boolean;
  batteryPct: number | null;
  serialNumber: string;
  assetTag: string;
  manufacturer: string;
  model: string;
  room: string;
  warrantyStatus: string;
  warrantyExpires: string;
  assignedTo: string;
  assignedRole: string;
  assignedInitials: string;
  assignedPhone: string;
  activityNote: string;
  recentMaintenance: FleetMaintenanceRecord[];
};

function m(
  id: string,
  title: string,
  date: string
): FleetMaintenanceRecord {
  return { id, title, date };
}

export const FLEET_ROSTER_ROWS: FleetRow[] = [
  {
    id: "DEV-2041",
    name: "Philips IntelliVue MX800",
    department: "ICU",
    connectivity: "Online",
    lastSync: "2 min ago",
    firmwareCurrent: "v4.2.1",
    firmwareLatest: "v4.2.1",
    firmwareBehind: false,
    batteryPct: 87,
    serialNumber: "SN-MX800-2041-NA",
    assetTag: "AT-ICU-4412",
    manufacturer: "Philips",
    model: "IntelliVue MX800",
    room: "ICU North · Bay 4",
    warrantyStatus: "OEM warranty active",
    warrantyExpires: "Aug 12, 2027",
    assignedTo: "Alex Morgan",
    assignedRole: "Clinical Engineering",
    assignedInitials: "AM",
    assignedPhone: "Ext. 7721",
    activityNote:
      "Telemetry nominal. Last alarm test passed during night shift.",
    recentMaintenance: [
      m("pm1", "Quarterly PM — leads & battery check", "Mar 18, 2026"),
      m("pm2", "Firmware verification", "Dec 2, 2025"),
      m("pm3", "Safety inspection", "Sep 9, 2025"),
    ],
  },
  {
    id: "DEV-1088",
    name: "Siemens MAGNETOM Vida",
    department: "Radiology",
    connectivity: "Online",
    lastSync: "12 min ago",
    firmwareCurrent: "v3.9.0",
    firmwareLatest: "v3.11.2",
    firmwareBehind: true,
    batteryPct: null,
    serialNumber: "SN-SIE-VDA-1088",
    assetTag: "AT-RAD-MRI-01",
    manufacturer: "Siemens Healthineers",
    model: "MAGNETOM Vida 3T",
    room: "MRI Suite A",
    warrantyStatus: "Service contract — Siemens",
    warrantyExpires: "Jan 4, 2028",
    assignedTo: "Devon Wright",
    assignedRole: "Imaging Specialist",
    assignedInitials: "DW",
    assignedPhone: "Ext. 5510",
    activityNote:
      "Gradient coil cooling within spec. OTA bundle staged for next window.",
    recentMaintenance: [
      m("m1", "Helium level check", "Mar 22, 2026"),
      m("m2", "Coldhead inspection", "Feb 1, 2026"),
      m("m3", "QA phantom scan", "Jan 15, 2026"),
    ],
  },
  {
    id: "DEV-3312",
    name: "Baxter Spectrum IQ Infusion Pump",
    department: "ICU",
    connectivity: "Degraded",
    lastSync: "48 min ago",
    firmwareCurrent: "v2.1.8",
    firmwareLatest: "v3.0.4",
    firmwareBehind: true,
    batteryPct: 34,
    serialNumber: "SN-BAX-SIQ-3312",
    assetTag: "AT-ICU-INF-18",
    manufacturer: "Baxter",
    model: "Spectrum IQ",
    room: "ICU South · Room 12",
    warrantyStatus: "Hospital-owned · extended service",
    warrantyExpires: "Nov 30, 2026",
    assignedTo: "Jordan Patel",
    assignedRole: "Healthcare IT Systems",
    assignedInitials: "JP",
    assignedPhone: "Ext. 8804",
    activityNote:
      "Wi‑Fi RSSI marginal on pod B AP — bridge ticket IT-9021 opened.",
    recentMaintenance: [
      m("m1", "Battery replacement", "Feb 8, 2026"),
      m("m2", "Flow calibration", "Nov 20, 2025"),
      m("m3", "PM — occlusion test", "Aug 3, 2025"),
    ],
  },
  {
    id: "DEV-0892",
    name: "Maquet Servo-air Ventilator",
    department: "ER",
    connectivity: "Online",
    lastSync: "5 min ago",
    firmwareCurrent: "v5.0.2",
    firmwareLatest: "v5.0.2",
    firmwareBehind: false,
    batteryPct: 91,
    serialNumber: "SN-MQT-SVA-0892",
    assetTag: "AT-ER-VENT-06",
    manufacturer: "Getinge / Maquet",
    model: "Servo-air",
    room: "ER · Resuscitation 2",
    warrantyStatus: "OEM warranty active",
    warrantyExpires: "Jun 1, 2027",
    assignedTo: "Chris Reynolds",
    assignedRole: "Device Operations",
    assignedInitials: "CR",
    assignedPhone: "Ext. 4402",
    activityNote:
      "High-acuity circuit. Self-test completed 04:00; no faults logged.",
    recentMaintenance: [
      m("m1", "Annual safety inspection", "Mar 1, 2026"),
      m("m2", "O₂ sensor verify", "Jan 12, 2026"),
      m("m3", "Filter replacement", "Dec 5, 2025"),
    ],
  },
  {
    id: "DEV-4401",
    name: "GE Revolution Apex CT",
    department: "Imaging",
    connectivity: "Offline",
    lastSync: "6 hr ago",
    firmwareCurrent: "v3.8.4",
    firmwareLatest: "v4.0.1",
    firmwareBehind: true,
    batteryPct: null,
    serialNumber: "SN-GE-REV-4401",
    assetTag: "AT-IMG-CT-02",
    manufacturer: "GE HealthCare",
    model: "Revolution Apex",
    room: "CT Suite B",
    warrantyStatus: "GE Diamond service",
    warrantyExpires: "Sep 19, 2029",
    assignedTo: "Devon Wright",
    assignedRole: "Clinical Engineering",
    assignedInitials: "DW",
    assignedPhone: "Ext. 5510",
    activityNote:
      "Gateway unreachable since 10:42 — DICOM node not responding; field dispatch queued.",
    recentMaintenance: [
      m("m1", "Tube warm-up cycle logged", "Mar 28, 2026"),
      m("m2", "Laser cam alignment", "Feb 14, 2026"),
      m("m3", "Cooling loop inspection", "Oct 8, 2025"),
    ],
  },
  {
    id: "DEV-5510",
    name: "GE Voluson E10 Ultrasound",
    department: "Imaging",
    connectivity: "Online",
    lastSync: "8 min ago",
    firmwareCurrent: "v1.4.0",
    firmwareLatest: "v1.6.3",
    firmwareBehind: true,
    batteryPct: 76,
    serialNumber: "SN-GE-V10-5510",
    assetTag: "AT-IMG-US-07",
    manufacturer: "GE HealthCare",
    model: "Voluson E10",
    room: "Maternal-fetal imaging",
    warrantyStatus: "OEM warranty active",
    warrantyExpires: "Apr 22, 2027",
    assignedTo: "Casey Liu",
    assignedRole: "Biomedical Engineering",
    assignedInitials: "CL",
    assignedPhone: "Ext. 6633",
    activityNote:
      "Probe catalog v2.1 loaded. Thermal flags clear.",
    recentMaintenance: [
      m("m1", "Probe electrical safety", "Mar 10, 2026"),
      m("m2", "Software baseline capture", "Jan 30, 2026"),
      m("m3", "PM — mechanical sweep", "Oct 21, 2025"),
    ],
  },
  {
    id: "DEV-6120",
    name: "Fresenius 5008S Dialysis",
    department: "Nephrology",
    connectivity: "Online",
    lastSync: "18 min ago",
    firmwareCurrent: "v4.5.0",
    firmwareLatest: "v4.5.0",
    firmwareBehind: false,
    batteryPct: 72,
    serialNumber: "SN-FRS-5008-6120",
    assetTag: "AT-NEPH-D04",
    manufacturer: "Fresenius Medical Care",
    model: "5008S",
    room: "Dialysis Center B · Station 4",
    warrantyStatus: "Full service agreement",
    warrantyExpires: "Dec 15, 2026",
    assignedTo: "Alex Morgan",
    assignedRole: "Clinical Engineering",
    assignedInitials: "AM",
    assignedPhone: "Ext. 7721",
    activityNote:
      "Conductivity and UF trends nominal; disinfectant log current.",
    recentMaintenance: [
      m("m1", "Ultrafilter change", "Mar 25, 2026"),
      m("m2", "Conductivity calibration", "Feb 2, 2026"),
      m("m3", "PM — hydraulic leak test", "Nov 11, 2025"),
    ],
  },
  {
    id: "DEV-7734",
    name: "Zoll R Series Defibrillator",
    department: "Cardiology",
    connectivity: "Online",
    lastSync: "3 min ago",
    firmwareCurrent: "v2.8.1",
    firmwareLatest: "v2.9.0",
    firmwareBehind: true,
    batteryPct: 52,
    serialNumber: "SN-ZOL-RS-7734",
    assetTag: "AT-CARD-DEF-03",
    manufacturer: "Zoll",
    model: "R Series",
    room: "Cath lab holding",
    warrantyStatus: "OEM warranty active",
    warrantyExpires: "Jul 7, 2027",
    assignedTo: "Chris Reynolds",
    assignedRole: "Device Operations",
    assignedInitials: "CR",
    assignedPhone: "Ext. 4402",
    activityNote:
      "Pacing capture test due this week — battery mid-life.",
    recentMaintenance: [
      m("m1", "Daily shock test log review", "Apr 2, 2026"),
      m("m2", "Pad integrity check", "Mar 5, 2026"),
      m("m3", "Firmware baseline", "Jan 18, 2026"),
    ],
  },
  {
    id: "DEV-8891",
    name: "BD Alaris Syringe Pump",
    department: "NICU",
    connectivity: "Online",
    lastSync: "2 days ago",
    firmwareCurrent: "v1.2.0",
    firmwareLatest: "v1.2.0",
    firmwareBehind: false,
    batteryPct: 22,
    serialNumber: "SN-BD-ALR-8891",
    assetTag: "AT-NICU-P12",
    manufacturer: "BD",
    model: "Alaris Syringe",
    room: "NICU · Pod C",
    warrantyStatus: "Lease — vendor PM included",
    warrantyExpires: "Mar 3, 2028",
    assignedTo: "Casey Liu",
    assignedRole: "Biomedical Engineering",
    assignedInitials: "CL",
    assignedPhone: "Ext. 6633",
    activityNote:
      "Low battery threshold email sent; swap scheduled tonight.",
    recentMaintenance: [
      m("m1", "Occlusion pressure test", "Feb 26, 2026"),
      m("m2", "Anti-free-flow verify", "Dec 14, 2025"),
      m("m3", "PM — motor current draw", "Sep 30, 2025"),
    ],
  },
  {
    id: "DEV-9022",
    name: "Masimo SET Pulse Oximeter",
    department: "Oncology",
    connectivity: "Degraded",
    lastSync: "12 min ago",
    firmwareCurrent: "v3.4.2",
    firmwareLatest: "v3.4.2",
    firmwareBehind: false,
    batteryPct: 94,
    serialNumber: "SN-MSM-OX-9022",
    assetTag: "AT-ONC-SPO2-09",
    manufacturer: "Masimo",
    model: "Root with SET",
    room: "Oncology infusion suite",
    warrantyStatus: "OEM warranty active",
    warrantyExpires: "Feb 28, 2027",
    assignedTo: "Jordan Patel",
    assignedRole: "Healthcare IT Systems",
    assignedInitials: "JP",
    assignedPhone: "Ext. 8804",
    activityNote:
      "SpO₂ waveform intermittent — sensor cable strain relief worn; replacement on order.",
    recentMaintenance: [
      m("m1", "Sensor QA sweep", "Mar 20, 2026"),
      m("m2", "Display calibration", "Jan 5, 2026"),
      m("m3", "PM — EMI check", "Oct 12, 2025"),
    ],
  },
];

type SortKey =
  | "priority"
  | "device"
  | "department"
  | "connectivity"
  | "lastSync"
  | "firmware"
  | "battery";
type SortDir = "asc" | "desc";

const CONN_ORDER: Record<Connectivity, number> = {
  Offline: 0,
  Degraded: 1,
  Online: 2,
};

export function fleetUrgencyScore(row: FleetRow): number {
  let s = 0;
  if (row.connectivity === "Offline") s += 42;
  if (row.connectivity === "Degraded") s += 24;
  if (row.firmwareBehind) s += 18;
  if (row.batteryPct != null && row.batteryPct < 30) s += 22;
  else if (row.batteryPct != null && row.batteryPct < 60) s += 8;
  const mins = parseLastSyncMinutes(row.lastSync);
  if (mins >= 360) s += 14;
  else if (mins >= 120) s += 6;
  return s;
}

function primaryFleetAction(row: FleetRow): string {
  if (row.connectivity === "Offline") return "Restore uplink";
  if (row.connectivity === "Degraded") return "Check bridge";
  if (row.firmwareBehind) return "Push update";
  if (row.batteryPct != null && row.batteryPct < 30) return "Schedule swap";
  return "Open device";
}

function parseLastSyncMinutes(s: string): number {
  const m = s.match(/(\d+)\s*(min|hr|day)s?\s+ago/i);
  if (!m) return 1e9;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u === "min") return n;
  if (u === "hr") return n * 60;
  return n * 1440;
}

function semverParts(v: string) {
  return v
    .replace(/^v/i, "")
    .split(".")
    .map((x) => parseInt(x, 10) || 0);
}

function compareFirmware(a: string, b: string) {
  const pa = semverParts(a);
  const pb = semverParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function compareRows(
  a: FleetRow,
  b: FleetRow,
  key: SortKey,
  dir: SortDir
): number {
  let cmp = 0;
  switch (key) {
    case "priority":
      cmp = fleetUrgencyScore(b) - fleetUrgencyScore(a);
      break;
    case "device":
      cmp = a.name.localeCompare(b.name);
      break;
    case "department":
      cmp = a.department.localeCompare(b.department);
      break;
    case "connectivity":
      cmp = CONN_ORDER[a.connectivity] - CONN_ORDER[b.connectivity];
      break;
    case "lastSync":
      cmp = parseLastSyncMinutes(a.lastSync) - parseLastSyncMinutes(b.lastSync);
      break;
    case "firmware":
      cmp = compareFirmware(a.firmwareCurrent, b.firmwareCurrent);
      break;
    case "battery": {
      const ba = a.batteryPct ?? -1;
      const bb = b.batteryPct ?? -1;
      cmp = ba - bb;
      break;
    }
    default:
      break;
  }
  return dir === "asc" ? cmp : -cmp;
}

const connVariant: Record<Connectivity, "success" | "warning" | "danger"> = {
  Online: "success",
  Degraded: "warning",
  Offline: "danger",
};

function ConnectivityCell({ status }: { status: Connectivity }) {
  const isOnline = status === "Online";
  const isDegraded = status === "Degraded";

  return (
    <div className="flex items-center gap-2.5">
      {isOnline ? (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-45 motion-reduce:animate-none motion-reduce:opacity-0"
            aria-hidden
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
            aria-hidden
          />
        </span>
      ) : isDegraded ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100"
          aria-hidden
        />
      ) : (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400 ring-2 ring-rose-100"
          aria-hidden
        />
      )}
      <Badge variant={connVariant[status]} className="text-[11px] font-semibold">
        {status}
      </Badge>
    </div>
  );
}

function SortableHead({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (c: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === col;

  return (
    <TableHead
      className={cn("p-0", className)}
      aria-sort={
        active
          ? sortDir === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          "flex w-full items-center gap-1.5 px-3 py-3 text-left text-xs font-medium uppercase tracking-wide transition-colors",
          active
            ? "bg-blue-50/80 text-blue-900"
            : "text-slate-500 hover:bg-slate-100/90 hover:text-slate-800"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp
              className="h-3.5 w-3.5 shrink-0 text-blue-600"
              strokeWidth={2.5}
              aria-hidden
            />
          ) : (
            <ArrowDown
              className="h-3.5 w-3.5 shrink-0 text-blue-600"
              strokeWidth={2.5}
              aria-hidden
            />
          )
        ) : (
          <ArrowUpDown
            className="h-3.5 w-3.5 shrink-0 text-slate-300"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </button>
    </TableHead>
  );
}

export function FleetRosterTable() {
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<FleetRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  const runAction = useCallback((row: FleetRow) => {
    setLoadingId(row.id);
    window.setTimeout(() => setLoadingId(null), 1100);
  }, []);

  const sorted = useMemo(() => {
    const rows = [...FLEET_ROSTER_ROWS];
    rows.sort((a, b) => compareRows(a, b, sortKey, sortDir));
    return rows;
  }, [sortKey, sortDir]);

  function openDetail(row: FleetRow) {
    setDetailRow(row);
    setDetailOpen(true);
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow className="border-slate-100 bg-slate-50/30 hover:bg-transparent">
          <SortableHead
            label="Rank"
            col="priority"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            className="w-[72px]"
          />
          <SortableHead
            label="Device"
            col="device"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Department"
            col="department"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Connectivity"
            col="connectivity"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Last sync"
            col="lastSync"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Current / latest"
            col="firmware"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            className="min-w-[150px]"
          />
          <SortableHead
            label="Battery"
            col="battery"
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            className="min-w-[100px]"
          />
          <TableHead className="min-w-[120px] px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            Next step
          </TableHead>
          <TableHead className="w-[40px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row, index) => {
          const score = fleetUrgencyScore(row);
          const topDeal = index === 0 && score >= 30;
          return (
          <TableRow
            key={row.id}
            id={`fleet-row-${row.id}`}
            tabIndex={0}
            role="button"
            aria-label={`Open details for ${row.name}`}
            className={cn(
              "group cursor-pointer border-slate-100 transition-colors duration-150 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
              topDeal &&
                "border-l-4 border-l-rose-500 bg-rose-50/20 hover:bg-rose-50/40"
            )}
            onClick={() => openDetail(row)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail(row);
              }
            }}
          >
            <TableCell className="tabular-nums">
              <div className="flex items-center gap-2 px-1">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full ring-2 ring-white",
                    score >= 50
                      ? "bg-rose-500"
                      : score >= 28
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  )}
                  title={`Urgency score ${score}`}
                />
                <span className="text-xs font-bold text-slate-800">{score}</span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm font-medium text-slate-900">{row.name}</p>
              <p className="font-mono text-[11px] text-slate-400">{row.id}</p>
            </TableCell>
            <TableCell className="text-sm text-slate-600">
              {row.department}
            </TableCell>
            <TableCell>
              <ConnectivityCell status={row.connectivity} />
            </TableCell>
            <TableCell className="tabular-nums text-sm text-slate-600">
              {row.lastSync}
            </TableCell>
            <TableCell>
              <div className="space-y-0.5 leading-tight">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Current
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {row.firmwareCurrent}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Latest
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold",
                      row.firmwareBehind
                        ? "text-amber-700"
                        : "text-emerald-600"
                    )}
                  >
                    {row.firmwareLatest}
                  </span>
                </div>
                <p className="text-[10px] leading-snug text-slate-500">
                  {row.firmwareBehind
                    ? "OTA available on vendor channel"
                    : "Matched to supported build"}
                </p>
              </div>
            </TableCell>
            <TableCell>
              {row.batteryPct != null ? (
                <BatteryBar pct={row.batteryPct} />
              ) : (
                <span className="text-xs text-slate-400">Wall power</span>
              )}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                size="sm"
                className="h-8 whitespace-nowrap font-semibold shadow-sm transition-[box-shadow] group-hover:shadow-md"
                disabled={loadingId === row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  runAction(row);
                }}
              >
                {loadingId === row.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  primaryFleetAction(row)
                )}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-slate-400 opacity-80 transition-opacity duration-150 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
    <FleetDeviceDetailSheet
      row={detailRow}
      open={detailOpen}
      onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) setDetailRow(null);
      }}
    />
    </>
  );
}
