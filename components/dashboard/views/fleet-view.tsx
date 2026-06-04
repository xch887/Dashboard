"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage, sectionDescriptionClass, sectionHeadingClass } from "@/components/dashboard/view-page";
import { FleetRosterTable } from "@/components/dashboard/views/fleet-roster-table";
import { MiniAreaChart } from "@/components/dashboard/mini-chart";
import { MonitorSmartphone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightBadge } from "@/components/dashboard/insight-badge";
import {
  SectionCard,
  StatCard,
  TableCard,
} from "@/components/dashboard/section-card";

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

      <section
        aria-label="Fleet overview"
        className="grid gap-x-2.5 gap-y-3 lg:grid-cols-5 lg:items-stretch"
      >
        <SectionCard className="flex flex-col p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={sectionHeadingClass}>What to clear first</h2>
            <InsightBadge />
          </div>
          <p className={cn(sectionDescriptionClass, "mt-1")}>
            Open incidents tied to fleet telemetry (7 days) — act on red before
            shift change.
          </p>
          <MiniAreaChart
            className="mt-3"
            data={[3, 5, 4, 7, 6, 8, 5]}
            height={72}
            label="New incidents per day"
            animateOnMount
          />
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              <strong className="font-semibold text-slate-800">5</strong> today
            </span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span>
              <strong className="font-semibold text-red-600">2</strong> critical
            </span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span>
              vs{" "}
              <strong className="font-semibold text-slate-700">3.4</strong> daily
              avg
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3 h-9 w-full rounded-xl bg-blue-700 text-xs font-semibold text-white hover:bg-blue-800"
            onClick={() => router.push("/alerts")}
          >
            Triage open incidents
          </Button>
        </SectionCard>

        <ul className="grid h-full min-h-0 grid-cols-2 grid-rows-2 gap-x-2.5 gap-y-3 lg:col-span-3">
          {stats.map((stat) => {
            const urgent = stat.label === "Needs attention";
            const behind = stat.label === "Firmware behind";
            const tone = urgent
              ? ("critical" as const)
              : behind
                ? ("warning" as const)
                : ("default" as const);
            const scrollToRoster = urgent || behind;

            return (
              <li key={stat.label} className="min-h-0">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  hint={stat.hint}
                  tone={tone}
                  labelStyle="default"
                  className={cn(
                    "flex h-full min-h-[5.5rem] flex-col justify-center p-4 sm:p-4",
                    scrollToRoster &&
                      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2"
                  )}
                  role={scrollToRoster ? "button" : undefined}
                  tabIndex={scrollToRoster ? 0 : undefined}
                  aria-label={
                    scrollToRoster
                      ? `${stat.label}: ${stat.value}. Scroll to fleet roster.`
                      : undefined
                  }
                  onClick={
                    scrollToRoster
                      ? () => {
                          document
                            .getElementById("fleet-roster")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      : undefined
                  }
                  onKeyDown={
                    scrollToRoster
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            document
                              .getElementById("fleet-roster")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }
                        }
                      : undefined
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>

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
