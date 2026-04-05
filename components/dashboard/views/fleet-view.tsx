"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import { FleetRosterTable } from "@/components/dashboard/views/fleet-roster-table";
import { MiniAreaChart, Sparkline } from "@/components/dashboard/mini-chart";
import { MonitorSmartphone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightBadge } from "@/components/dashboard/insight-badge";
import {
  SectionCard,
  StatCard,
  TableCard,
} from "@/components/dashboard/section-card";

const FLEET_SPARKS: Record<string, number[]> = {
  "Online now": [1180, 1195, 1210, 1240, 1260, 1275, 1284],
  "Needs attention": [31, 28, 29, 26, 24, 25, 23],
  "Firmware behind": [58, 52, 49, 45, 43, 42, 41],
  "New this month": [8, 10, 12, 14, 15, 16, 18],
};

export function FleetView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stats = sectionConfigs.fleet.stats;
  const c = sectionConfigs.fleet;

  const highlightDevice = searchParams.get("device");

  useEffect(() => {
    if (!highlightDevice || !/^DEV-[A-Za-z0-9-]+$/.test(highlightDevice)) {
      return;
    }
    const scrollTimer = window.setTimeout(() => {
      const el = document.getElementById(`fleet-row-${highlightDevice}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add(
        "ring-2",
        "ring-blue-500/45",
        "ring-offset-2",
        "ring-offset-white"
      );
      window.setTimeout(() => {
        el?.classList.remove(
          "ring-2",
          "ring-blue-500/45",
          "ring-offset-2",
          "ring-offset-white"
        );
      }, 2400);
    }, 120);
    return () => window.clearTimeout(scrollTimer);
  }, [highlightDevice]);

  return (
    <ViewPage>
      <PageHeader
        icon={MonitorSmartphone}
        title={c.title}
        description={c.description}
        actions={
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_99_235/0.5)] hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Add device
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-5 lg:gap-3">
        <SectionCard className="lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-950">
                  What to clear first
                </h2>
                <InsightBadge />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Open incidents tied to fleet telemetry (7 days) — act on red
                before shift change.
              </p>
            </div>
            <Badge variant="info" className="shrink-0 text-[10px] font-semibold">
              Live
            </Badge>
          </div>
          <MiniAreaChart
            className="mt-4"
            data={[3, 5, 4, 7, 6, 8, 5]}
            height={88}
            label="New incidents per day"
            animateOnMount
          />
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span>
              <strong className="font-semibold text-slate-800">5</strong> today
            </span>
            <span className="text-slate-300">·</span>
            <span>
              <strong className="font-semibold text-rose-700">2</strong>{" "}
              critical
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">
              vs <strong className="font-semibold">3.4</strong> daily avg
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 w-full border-rose-200/80 bg-rose-50/50 text-xs font-semibold text-rose-900 hover:bg-rose-100/80"
            onClick={() => router.push("/alerts")}
          >
            Triage open incidents
          </Button>
        </SectionCard>
        <ul className="grid grid-cols-2 gap-2 lg:col-span-3 lg:grid-cols-2 lg:gap-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const urgent = stat.label === "Needs attention";
            const behind = stat.label === "Firmware behind";
            const tone = urgent
              ? ("critical" as const)
              : behind
                ? ("warning" as const)
                : ("default" as const);
            return (
              <li key={stat.label}>
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  hint={stat.hint}
                  tone={tone}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (urgent || behind) {
                      document
                        .getElementById("fleet-roster")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <div className="absolute right-4 top-4">
                    <Sparkline
                      data={FLEET_SPARKS[stat.label] ?? [1, 2, 3, 4, 5, 4, 6]}
                      strokeClassName={
                        stat.label === "Needs attention"
                          ? "stroke-rose-500"
                          : "stroke-blue-600"
                      }
                      animateOnMount
                    />
                  </div>
                  {(urgent || behind) && (
                    <p className="mt-2 text-[10px] font-semibold text-blue-700">
                      Tap to jump to roster ↓
                    </p>
                  )}
                </StatCard>
              </li>
            );
          })}
        </ul>
      </div>

      <TableCard
        title="Fleet roster — address highest rank first"
        description="Default sort is composite urgency (offline, firmware, battery, sync). Use column headers to re-sort."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-slate-200/90 text-xs text-slate-600"
          >
            Export CSV
          </Button>
        }
        className="scroll-mt-24"
      >
        <div id="fleet-roster">
          <FleetRosterTable />
        </div>
      </TableCard>
    </ViewPage>
  );
}
