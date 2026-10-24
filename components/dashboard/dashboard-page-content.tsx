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
import {
  DashboardWeekCalendarPanel,
  DashboardDeadlinesPanel,
} from "@/components/dashboard/charts/dashboard-calendar-deadlines";
import { cn } from "@/lib/utils";
import {
  dashboardCardGridGap,
  dashboardCardStackGap,
} from "@/lib/dashboard-surface";

/** MediSync+ dashboard: KPIs + health → compliance + right rail → action queue. */
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

      <div
        className={cn(
          "grid items-start lg:grid-cols-12",
          dashboardCardGridGap
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col lg:col-span-8",
            dashboardCardStackGap
          )}
        >
          <div
            className={cn(
              "grid items-stretch sm:grid-cols-12",
              dashboardCardGridGap
            )}
          >
            <KpiCards
              density="dashboard"
              layout="quarter"
              className="min-w-0 sm:col-span-7"
              onToast={showToast}
            />
            <DeviceHealthOverview
              mini
              className="min-w-0 sm:col-span-5"
            />
          </div>
          <MaintenanceComplianceChart compact className="min-w-0" />
          <DeviceTable riskStyle="pill" onToast={showToast} />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-col lg:col-span-4",
            dashboardCardStackGap
          )}
        >
          <DashboardWeekCalendarPanel />
          <DashboardDeadlinesPanel />
          <MaintenanceStatusDonut compact />
        </div>
      </div>
    </>
  );
}
