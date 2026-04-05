"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { motionTransition } from "@/lib/motion";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DeviceTable } from "@/components/dashboard/device-table";
import { DeviceHealthOverview } from "@/components/dashboard/charts/device-health-overview";
import { MaintenanceComplianceChart } from "@/components/dashboard/charts/maintenance-compliance-chart";
import { MaintenanceStatusDonut } from "@/components/dashboard/charts/maintenance-status-donut";
import { DashboardWeekCalendar } from "@/components/dashboard/charts/dashboard-week-calendar";
import { UpcomingMaintenanceDeadlines } from "@/components/dashboard/charts/upcoming-maintenance-deadlines";
import { cn } from "@/lib/utils";

/**
 * KPI row → middle band (narrow compliance chart + widget grid) → full-width Device Action Queue.
 */
export function DashboardPageContent() {
  const [toast, setToast] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <>
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={motionTransition(reduceMotion, "base")}
            className={cn(
              "fixed bottom-6 left-1/2 z-[100] flex max-w-[min(100vw-2rem,420px)] -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 shadow-sm"
            )}
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              strokeWidth={2}
              aria-hidden
            />
            <span className="min-w-0">{toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-4">
        <KpiCards density="dashboard" onToast={showToast} />

        <div className="grid gap-3 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-4 xl:col-span-3">
            <MaintenanceComplianceChart compact />
          </div>

          <div
            className="grid min-w-0 gap-3 sm:grid-cols-2 lg:col-span-8 xl:col-span-9"
            aria-label="Dashboard widgets"
          >
            <DeviceHealthOverview compact />
            <DashboardWeekCalendar compact />
            <div className="min-w-0 sm:col-span-2">
              <UpcomingMaintenanceDeadlines compact />
            </div>
            <div className="min-w-0 sm:col-span-2">
              <MaintenanceStatusDonut compact />
            </div>
          </div>
        </div>

        <DeviceTable riskStyle="pill" onToast={showToast} />
      </div>
    </>
  );
}
