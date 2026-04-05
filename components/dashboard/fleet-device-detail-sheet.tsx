"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BatteryBar } from "@/components/dashboard/battery-bar";
import type { FleetRow } from "@/components/dashboard/views/fleet-roster-table";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calendar,
  Cpu,
  MapPin,
  Shield,
  User,
  Wifi,
} from "lucide-react";

const connVariant = {
  Online: "success",
  Degraded: "warning",
  Offline: "danger",
} as const;

export function FleetDeviceDetailSheet({
  row,
  open,
  onOpenChange,
}: {
  row: FleetRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!row) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-slate-200 px-6 pb-4 pt-6 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Cpu className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-semibold leading-snug text-slate-900">
                {row.name}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs text-slate-500">
                {row.id} · {row.serialNumber}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="neutral" className="text-[10px] font-semibold">
                  {row.department}
                </Badge>
                <Badge
                  variant={connVariant[row.connectivity]}
                  className="text-[10px] font-semibold"
                >
                  {row.connectivity}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Asset
            </h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Manufacturer</dt>
                <dd className="font-medium text-slate-900">{row.manufacturer}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Model</dt>
                <dd className="font-medium text-slate-900">{row.model}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Asset tag</dt>
                <dd className="font-mono text-slate-800">{row.assetTag}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Location
                </dt>
                <dd className="text-right font-medium text-slate-900">
                  {row.room}
                </dd>
              </div>
            </dl>
          </section>

          <Separator className="bg-slate-200" />

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Telemetry
            </h3>
            <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-slate-600">
                  <Wifi className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  Last sync
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-900">
                  {row.lastSync}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Firmware
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-mono font-semibold text-slate-900">
                    {row.firmwareCurrent}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      row.firmwareBehind ? "text-amber-700" : "text-emerald-700"
                    )}
                  >
                    {row.firmwareLatest}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {row.firmwareBehind
                    ? "Update available from vendor channel."
                    : "Matched to latest supported build."}
                </p>
              </div>
              {row.batteryPct != null ? (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Battery
                  </p>
                  <div className="mt-1.5">
                    <BatteryBar pct={row.batteryPct} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Wall power — no battery.</p>
              )}
            </div>
          </section>

          <Separator className="bg-slate-200" />

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Warranty &amp; support
            </h3>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {row.warrantyStatus}
                </p>
                <p className="text-xs text-slate-500">
                  Expires {row.warrantyExpires}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Assigned technician
            </h3>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-800 ring-1 ring-blue-200">
                {row.assignedInitials}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  {row.assignedTo}
                </p>
                <p className="text-xs text-slate-500">{row.assignedRole}</p>
                <p className="text-[11px] text-slate-400">{row.assignedPhone}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Recent maintenance
            </h3>
            <ul className="mt-2 space-y-2">
              {row.recentMaintenance.map((m) => (
                <li
                  key={m.id}
                  className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      {m.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{m.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Activity
            </h3>
            <div className="mt-2 flex items-start gap-2 text-xs text-slate-600">
              <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <p>{row.activityNote}</p>
            </div>
          </section>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              className="rounded-md bg-blue-600 font-semibold hover:bg-blue-700"
            >
              Open work order
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md">
              View service history
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
