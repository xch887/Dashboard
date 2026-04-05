"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStatusBanner({
  criticalCount = 3,
  onViewAlerts,
}: {
  criticalCount?: number;
  onViewAlerts?: () => void;
}) {
  const hasCritical = criticalCount > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        hasCritical
          ? "border-rose-200/90 bg-rose-50/80 text-rose-950"
          : "border-emerald-200/90 bg-emerald-50/70 text-emerald-950"
      )}
      role="status"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {hasCritical ? (
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-rose-600"
            strokeWidth={2}
            aria-hidden
          />
        ) : (
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-emerald-600"
            strokeWidth={2}
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <p className="font-semibold leading-tight">
            {hasCritical
              ? `${criticalCount} critical alert${criticalCount === 1 ? "" : "s"} require attention`
              : "All monitored systems operational"}
          </p>
          <p className="mt-0.5 text-xs font-normal opacity-90">
            {hasCritical
              ? "Triage open incidents before patient areas go live."
              : "Last critical incident cleared 3 days ago."}
          </p>
        </div>
      </div>
      {hasCritical ? (
        <Link
          href="/alerts"
          onClick={onViewAlerts}
          className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
        >
          Open alerts
        </Link>
      ) : (
        <Link
          href="/fleet"
          className="shrink-0 text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
        >
          View fleet
        </Link>
      )}
    </div>
  );
}
