"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import { MiniAreaChart } from "@/components/dashboard/mini-chart";
import {
  ClipboardList,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  Plus,
  User,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type WOPriority = "Critical" | "High" | "Medium" | "Low";

export type WOStatus =
  | "In progress"
  | "Scheduled"
  | "Unassigned"
  | "Awaiting parts"
  | "On hold";

export type PartLine = {
  sku: string;
  description: string;
  qty: number;
  status: "On hand" | "Ordered" | "Backorder" | "Received";
};

export type LaborLine = {
  code: string;
  label: string;
  estHours: number;
};

export type WorkOrder = {
  id: string;
  title: string;
  deviceLabel: string;
  deviceId: string | null;
  priority: WOPriority;
  status: WOStatus;
  assignee: string;
  dueLabel: string;
  dueSort: string;
  dept: string;
  room?: string;
  summary: string;
  parts: PartLine[];
  labor: LaborLine[];
};

const PRIORITY_RANK: Record<WOPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const WORK_ORDERS_SEED: WorkOrder[] = [
  {
    id: "WO-44821",
    title: "PM — Dialysis Unit #3",
    deviceLabel: "Fresenius 5008S",
    deviceId: "DEV-0892",
    priority: "High",
    status: "In progress",
    assignee: "Casey Liu",
    dueLabel: "Apr 4",
    dueSort: "2026-04-04",
    dept: "Nephrology",
    room: "Unit 3",
    summary:
      "Quarterly PM checklist, disinfect log, and electrical safety test. CMMS template v12 applied.",
    parts: [
      {
        sku: "FSN-DIAL-KIT-Q",
        description: "Consumables kit (quarterly)",
        qty: 1,
        status: "On hand",
      },
      {
        sku: "CLMP-O2-SNSR",
        description: "O2 sensor (backup)",
        qty: 1,
        status: "Ordered",
      },
    ],
    labor: [
      { code: "BM-PM-DIAL", label: "Dialysis PM — bench", estHours: 2.5 },
      { code: "BM-DOC", label: "Documentation / closeout", estHours: 0.5 },
    ],
  },
  {
    id: "WO-44805",
    title: "Telemetry spike — gateway reset",
    deviceLabel: "Capsule Neuron 2",
    deviceId: "DEV-5510",
    priority: "Critical",
    status: "Unassigned",
    assignee: "—",
    dueLabel: "Apr 3",
    dueSort: "2026-04-03",
    dept: "ICU",
    room: "Nurse station",
    summary:
      "Recurring disconnects after VLAN change. Capture span port trace before power cycle.",
    parts: [],
    labor: [
      { code: "BM-NET", label: "Network triage — clinical", estHours: 1 },
      { code: "BM-ESC", label: "Escalation / vendor bridge", estHours: 0.5 },
    ],
  },
  {
    id: "WO-44790",
    title: "Firmware push — Infusion pumps (ICU)",
    deviceLabel: "Fleet · 12 units",
    deviceId: null,
    priority: "Medium",
    status: "Scheduled",
    assignee: "Jordan Patel",
    dueLabel: "Apr 5",
    dueSort: "2026-04-05",
    dept: "ICU",
    summary:
      "Staged OTA during low census window. Rollback image verified on bench unit.",
    parts: [
      {
        sku: "USB-OTA-KEY",
        description: "Signed OTA staging key",
        qty: 1,
        status: "Received",
      },
    ],
    labor: [
      { code: "BM-FW", label: "Firmware deployment", estHours: 3 },
      { code: "BM-VAL", label: "Post-patch validation sample", estHours: 1 },
    ],
  },
  {
    id: "WO-44772",
    title: "Patient monitor NIBP verification",
    deviceLabel: "Philips IntelliVue MX800",
    deviceId: "DEV-2041",
    priority: "High",
    status: "In progress",
    assignee: "Alex Morgan",
    dueLabel: "Apr 3",
    dueSort: "2026-04-03",
    dept: "ICU",
    room: "Room 212",
    summary:
      "Post-calibration drift on NIBP. Repeat static and dynamic checks per IFU.",
    parts: [
      {
        sku: "MX-NIBP-TUBE",
        description: "NIBP hose assembly",
        qty: 2,
        status: "On hand",
      },
    ],
    labor: [
      { code: "BM-CAL", label: "Calibration / verification", estHours: 1.5 },
    ],
  },
  {
    id: "WO-44755",
    title: "Safety inspection — Ventilator #6",
    deviceLabel: "Hamilton C6",
    deviceId: "DEV-3312",
    priority: "High",
    status: "Unassigned",
    assignee: "—",
    dueLabel: "Apr 3",
    dueSort: "2026-04-03",
    dept: "ER",
    room: "Bay 3",
    summary:
      "Post-alert follow-up. Full leak test and alarm verification per manufacturer bulletin 2025-08.",
    parts: [
      {
        sku: "HM-FLT-KIT",
        description: "Filter maintenance kit",
        qty: 1,
        status: "On hand",
      },
    ],
    labor: [
      { code: "BM-SFTY", label: "Safety / alarm test", estHours: 2 },
    ],
  },
  {
    id: "WO-44740",
    title: "Anesthesia vaporizer annual",
    deviceLabel: "GE Aisys",
    deviceId: "DEV-4401",
    priority: "Medium",
    status: "On hold",
    assignee: "Priya Shah",
    dueLabel: "Apr 8",
    dueSort: "2026-04-08",
    dept: "OR",
    room: "OR 4",
    summary:
      "Waiting on gas supplier lockout tag removal. Do not start until facilities clears.",
    parts: [
      {
        sku: "VAP-SEAL-KIT",
        description: "Vaporizer seal kit",
        qty: 1,
        status: "Backorder",
      },
    ],
    labor: [
      { code: "BM-ANES", label: "Anesthesia annual", estHours: 3 },
    ],
  },
  {
    id: "WO-44712",
    title: "Replace CT cooling filter",
    deviceLabel: "Siemens SOMATOM",
    deviceId: "DEV-1088",
    priority: "Low",
    status: "Awaiting parts",
    assignee: "Devon Wright",
    dueLabel: "Apr 9",
    dueSort: "2026-04-09",
    dept: "Imaging",
    room: "CT 2B",
    summary:
      "OEM filter kit ETA Apr 7. Block room 2B for 4h after install.",
    parts: [
      {
        sku: "SIEM-CT-COOL-FLT",
        description: "Cooling loop filter (OEM)",
        qty: 1,
        status: "Ordered",
      },
      {
        sku: "COOL-SEAL-RING",
        description: "O-ring set",
        qty: 1,
        status: "Ordered",
      },
    ],
    labor: [
      { code: "BM-IMG", label: "Imaging service — CT", estHours: 4 },
    ],
  },
  {
    id: "WO-44698",
    title: "Lab interface queue backlog",
    deviceLabel: "Roche cobas interface",
    deviceId: "DEV-6120",
    priority: "Medium",
    status: "In progress",
    assignee: "Sam Rivera",
    dueLabel: "Apr 6",
    dueSort: "2026-04-06",
    dept: "Lab",
    summary:
      "HL7 ORU backlog after schema change. IT applied hotfix; validate end-to-end with LIS.",
    parts: [],
    labor: [
      { code: "BM-INTF", label: "Interface validation", estHours: 2 },
      { code: "IT-HL7", label: "HL7 support (shared)", estHours: 1 },
    ],
  },
  {
    id: "WO-44680",
    title: "UPS battery replacement — satellite pharmacy",
    deviceLabel: "Eaton 9PX UPS",
    deviceId: "DEV-8891",
    priority: "Low",
    status: "Scheduled",
    assignee: "Chris Okonkwo",
    dueLabel: "Apr 11",
    dueSort: "2026-04-11",
    dept: "Pharmacy",
    room: "Satellite B",
    summary:
      "Runtime test failed last week. Replace string 2; notify facilities for electrical LOTO.",
    parts: [
      {
        sku: "EAT-9PX-BAT-STR2",
        description: "Battery string 2 (OEM)",
        qty: 1,
        status: "Received",
      },
    ],
    labor: [
      { code: "BM-PWR", label: "Power / UPS service", estHours: 2.5 },
    ],
  },
];

const priorityStyles: Record<WOPriority, string> = {
  Critical: "bg-rose-600/12 text-rose-900 border-rose-500/30",
  High: "bg-rose-500/10 text-rose-800 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-900 border-amber-500/20",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusStyles: Record<WOStatus, string> = {
  "In progress": "bg-cyan-500/10 text-cyan-900 border-cyan-500/20",
  Scheduled: "bg-violet-500/10 text-violet-800 border-violet-500/20",
  Unassigned: "bg-orange-500/10 text-orange-900 border-orange-500/20",
  "Awaiting parts": "bg-slate-100 text-slate-700 border-slate-200",
  "On hold": "bg-amber-500/8 text-amber-950 border-amber-400/25",
};

const partStatusClass: Record<PartLine["status"], string> = {
  "On hand": "text-emerald-800",
  Ordered: "text-blue-800",
  Backorder: "text-rose-800",
  Received: "text-slate-700",
};

function partsAttention(parts: PartLine[]) {
  const pending = parts.filter(
    (p) => p.status === "Ordered" || p.status === "Backorder"
  ).length;
  return pending;
}

function laborHours(labor: LaborLine[]) {
  return labor.reduce((s, l) => s + l.estHours, 0);
}

function nextWorkOrderId(existing: WorkOrder[]): string {
  const nums = existing
    .map((w) => {
      const m = /^WO-(\d+)$/.exec(w.id);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = (nums.length ? Math.max(...nums) : 44800) + 1;
  return `WO-${next}`;
}

function dueLabelFromDateInput(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const y = d.getFullYear();
  const nowY = new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(y !== nowY ? { year: "numeric" as const } : {}),
  });
}

type CreateWOForm = {
  title: string;
  summary: string;
  deviceLabel: string;
  deviceId: string;
  dept: string;
  room: string;
  priority: WOPriority;
  dueDate: string;
  assignee: string;
};

const emptyCreateForm = (): CreateWOForm => ({
  title: "",
  summary: "",
  deviceLabel: "",
  deviceId: "",
  dept: "",
  room: "",
  priority: "Medium",
  dueDate: "",
  assignee: "",
});

export function WorkOrdersView() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(
    () => WORK_ORDERS_SEED
  );
  const [activeId, setActiveId] = useState(WORK_ORDERS_SEED[0].id);
  const [priorityFilter, setPriorityFilter] = useState<WOPriority | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<WOStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateWOForm>(emptyCreateForm);

  const filtered = useMemo(() => {
    return workOrders.filter((w) => {
      if (priorityFilter !== "all" && w.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== "all" && w.status !== statusFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      return a.dueSort.localeCompare(b.dueSort);
    });
  }, [workOrders, priorityFilter, statusFilter]);

  useEffect(() => {
    if (!filtered.length) return;
    if (!filtered.some((w) => w.id === activeId)) {
      setActiveId(filtered[0].id);
    }
  }, [filtered, activeId]);

  const active = useMemo(() => {
    return filtered.find((w) => w.id === activeId) ?? filtered[0] ?? null;
  }, [filtered, activeId]);

  const c = sectionConfigs["work-orders"];

  const clearFilters =
    priorityFilter !== "all" || statusFilter !== "all";

  function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    const title = createForm.title.trim();
    if (!title) return;

    const dueSort =
      createForm.dueDate.trim() || new Date().toISOString().slice(0, 10);
    const dueLabel = createForm.dueDate.trim()
      ? dueLabelFromDateInput(createForm.dueDate.trim())
      : "TBD";

    const newWo: WorkOrder = {
      id: nextWorkOrderId(workOrders),
      title,
      deviceLabel: createForm.deviceLabel.trim() || "Unspecified device",
      deviceId: createForm.deviceId.trim() || null,
      priority: createForm.priority,
      status: "Unassigned",
      assignee: createForm.assignee.trim() || "—",
      dueLabel,
      dueSort,
      dept: createForm.dept.trim() || "Unassigned",
      room: createForm.room.trim() || undefined,
      summary: createForm.summary.trim() || "No summary provided.",
      parts: [],
      labor: [],
    };

    setWorkOrders((prev) => [newWo, ...prev]);
    setActiveId(newWo.id);
    setPriorityFilter("all");
    setStatusFilter("all");
    setCreateForm(emptyCreateForm());
    setCreateOpen(false);
  }

  return (
    <ViewPage>
      <PageHeader
        icon={ClipboardList}
        title={c.title}
        description={c.description}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-9 gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            New work order
          </Button>
        }
      />

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateForm(emptyCreateForm());
        }}
      >
        <DialogContent className="max-h-[min(90vh,720px)] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create work order</DialogTitle>
            <DialogDescription>
              Add a draft work order to the queue. This demo keeps data in the
              browser session only.
            </DialogDescription>
          </DialogHeader>
          <form id="create-wo-form" onSubmit={handleCreateSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="wo-title"
                  className="text-xs font-semibold text-slate-700"
                >
                  Title <span className="text-rose-600">*</span>
                </label>
                <Input
                  id="wo-title"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. PM — Infusion pump bay 4"
                  required
                  className="h-9"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-device"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Device / scope
                  </label>
                  <Input
                    id="wo-device"
                    value={createForm.deviceLabel}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        deviceLabel: e.target.value,
                      }))
                    }
                    placeholder="Model or fleet label"
                    className="h-9"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-asset"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Asset ID
                  </label>
                  <Input
                    id="wo-asset"
                    value={createForm.deviceId}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, deviceId: e.target.value }))
                    }
                    placeholder="DEV-#### (optional)"
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-dept"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Department
                  </label>
                  <Input
                    id="wo-dept"
                    value={createForm.dept}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, dept: e.target.value }))
                    }
                    placeholder="e.g. ICU"
                    className="h-9"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-room"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Room / location
                  </label>
                  <Input
                    id="wo-room"
                    value={createForm.room}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, room: e.target.value }))
                    }
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-priority"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="wo-priority"
                    value={createForm.priority}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        priority: e.target.value as WOPriority,
                      }))
                    }
                    className={cn(
                      "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                      "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
                      "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    )}
                  >
                    {(
                      ["Critical", "High", "Medium", "Low"] as const
                    ).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="wo-due"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Due date
                  </label>
                  <Input
                    id="wo-due"
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="wo-assignee"
                  className="text-xs font-semibold text-slate-700"
                >
                  Assignee
                </label>
                <Input
                  id="wo-assignee"
                  value={createForm.assignee}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, assignee: e.target.value }))
                  }
                  placeholder="Leave blank for unassigned"
                  className="h-9"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="wo-summary"
                  className="text-xs font-semibold text-slate-700"
                >
                  Summary / notes
                </label>
                <textarea
                  id="wo-summary"
                  value={createForm.summary}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, summary: e.target.value }))
                  }
                  placeholder="What needs to happen, safety notes, vendor context…"
                  rows={4}
                  className={cn(
                    "min-h-[96px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
                    "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
                    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  )}
                />
              </div>
            </div>
          </form>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-wo-form"
              className="rounded-lg bg-blue-700 font-semibold text-white hover:bg-blue-800"
            >
              Create work order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SectionCard className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <div className="flex flex-1 flex-wrap gap-2">
          {c.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200/40"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
              <p className="text-base font-bold tabular-nums text-slate-900">
                {s.value}
              </p>
              {s.hint ? (
                <p className="text-[10px] text-slate-500">{s.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="w-full shrink-0 lg:max-w-[240px]">
          <MiniAreaChart
            data={[42, 48, 44, 52, 49, 56, 53]}
            height={72}
            label="Open WOs (7d)"
            strokeClassName="stroke-blue-600"
            fillClassName="fill-blue-500/10"
          />
        </div>
      </SectionCard>

      <div className="grid min-h-[480px] gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <SectionCard className="flex flex-col overflow-hidden p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Open queue
              </h2>
              <span className="text-[11px] font-medium tabular-nums text-slate-500">
                {filtered.length}/{workOrders.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Sorted by priority, then due date. Select a row for parts, labor,
              and device context.
            </p>
            <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
              <p className="px-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Priority
              </p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "all",
                    "Critical",
                    "High",
                    "Medium",
                    "Low",
                  ] as const
                ).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityFilter(p)}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      priorityFilter === p
                        ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
                        : "border-transparent bg-white text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>
              <p className="mt-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "all",
                    "In progress",
                    "Scheduled",
                    "Unassigned",
                    "Awaiting parts",
                    "On hold",
                  ] as const
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      statusFilter === s
                        ? "border-blue-300 bg-blue-50 text-blue-900 ring-1 ring-blue-200/80"
                        : "border-transparent bg-white text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              {clearFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setPriorityFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-1 px-0.5 text-[10px] font-semibold text-blue-700 hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-slate-500">
                No work orders match these filters.
              </li>
            ) : null}
            {filtered.map((wo) => {
              const sel = wo.id === activeId;
              const pendingParts = partsAttention(wo.parts);
              const hrs = laborHours(wo.labor);
              return (
                <li key={wo.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(wo.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-3 text-left transition-colors",
                      sel
                        ? "bg-blue-50 ring-1 ring-blue-500/25"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-400">
                        {wo.id}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          priorityStyles[wo.priority]
                        )}
                      >
                        {wo.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {wo.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {wo.dueLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {wo.dept}
                        {wo.room ? ` · ${wo.room}` : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          statusStyles[wo.status]
                        )}
                      >
                        {wo.status}
                      </Badge>
                      {wo.parts.length ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          <Package className="h-3 w-3" aria-hidden />
                          {wo.parts.length} part
                          {wo.parts.length !== 1 ? "s" : ""}
                          {pendingParts ? (
                            <span className="text-rose-700">
                              · {pendingParts} open
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                      {hrs > 0 ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          <Wrench className="h-3 w-3" aria-hidden />
                          {hrs}h est
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard as="article" className="flex flex-col p-0">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-20 text-center">
              <p className="text-sm font-medium text-slate-700">
                No work order selected
              </p>
              <p className="max-w-xs text-xs text-slate-500">
                Adjust filters to see open WOs in your queue.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-400">
                      {active.id}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {active.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        priorityStyles[active.priority]
                      )}
                    >
                      {active.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        statusStyles[active.status]
                      )}
                    >
                      {active.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-5 px-5 py-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Device / scope
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <span className="font-medium">{active.deviceLabel}</span>
                      {active.deviceId ? (
                        <Link
                          href={`/fleet?device=${encodeURIComponent(active.deviceId)}`}
                          className="mt-1 flex items-center gap-1 font-mono text-xs font-semibold text-blue-700 hover:underline"
                        >
                          {active.deviceId}
                          <ExternalLink
                            className="h-3 w-3 opacity-70"
                            aria-hidden
                          />
                        </Link>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">
                          Multi-asset / fleet scope — open fleet roster to pick
                          units.
                        </p>
                      )}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Assignee
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                      <User className="h-4 w-4 text-slate-400" aria-hidden />
                      {active.assignee}
                    </dd>
                    <dd className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      Due {active.dueLabel}
                      <span className="text-slate-300">·</span>
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {active.dept}
                      {active.room ? ` · ${active.room}` : ""}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Summary
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                      {active.summary}
                    </dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parts
                    </h3>
                    {partsAttention(active.parts) ? (
                      <Badge
                        variant="danger"
                        className="text-[10px] font-semibold"
                      >
                        {partsAttention(active.parts)} awaiting
                      </Badge>
                    ) : active.parts.length ? (
                      <Badge
                        variant="success"
                        className="text-[10px] font-semibold"
                      >
                        Ready
                      </Badge>
                    ) : null}
                  </div>
                  {active.parts.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      No parts on this WO — labor-only task.
                    </p>
                  ) : (
                    <Table className="mt-2">
                      <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="h-8 text-[10px] font-semibold">
                            SKU
                          </TableHead>
                          <TableHead className="h-8 text-[10px] font-semibold">
                            Description
                          </TableHead>
                          <TableHead className="h-8 w-12 text-[10px] font-semibold">
                            Qty
                          </TableHead>
                          <TableHead className="h-8 text-[10px] font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {active.parts.map((p) => (
                          <TableRow
                            key={p.sku}
                            className="border-slate-100 text-xs"
                          >
                            <TableCell className="py-2 font-mono text-[11px]">
                              {p.sku}
                            </TableCell>
                            <TableCell className="py-2 text-slate-700">
                              {p.description}
                            </TableCell>
                            <TableCell className="py-2 tabular-nums">
                              {p.qty}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "py-2 text-[11px] font-semibold",
                                partStatusClass[p.status]
                              )}
                            >
                              {p.status}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Labor codes
                    </h3>
                    <span className="text-[11px] font-semibold tabular-nums text-slate-600">
                      {laborHours(active.labor)}h estimated
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {active.labor.map((l) => (
                      <li
                        key={l.code}
                        className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-mono text-xs font-semibold text-slate-800">
                            {l.code}
                          </p>
                          <p className="text-xs text-slate-600">{l.label}</p>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-slate-700">
                          {l.estHours}h
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                  <Button
                    size="sm"
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 text-white"
                  >
                    Start timer
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Reassign
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Add note
                  </Button>
                </div>
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </ViewPage>
  );
}
