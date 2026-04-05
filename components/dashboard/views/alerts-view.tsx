"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertsTriageQueue } from "@/components/dashboard/alerts-triage-queue";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import { MiniAreaChart } from "@/components/dashboard/mini-chart";
import { AlertTriangle } from "lucide-react";
import { InsightBadge } from "@/components/dashboard/insight-badge";
import { SectionCard } from "@/components/dashboard/section-card";

export function AlertsView() {
  const c = sectionConfigs.alerts;

  return (
    <ViewPage className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <PageHeader
            icon={AlertTriangle}
            title={c.title}
            description={c.description}
          />
        </div>
        <SectionCard className="w-full shrink-0 lg:sticky lg:top-4 lg:max-w-[min(100%,280px)]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            On-call
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Clinical Engineering
          </p>
          <p className="text-xs text-slate-500">Alex Morgan · Primary</p>
          <Button variant="default" size="sm" className="mt-3 w-full">
            Page team
          </Button>
        </SectionCard>
      </div>

      <SectionCard as="section" className="p-2.5 sm:p-3">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-stretch xl:gap-3">
          <div className="min-w-0 flex-1 xl:max-w-[min(100%,22rem)]">
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-950">
                    Are we keeping up?
                  </h2>
                  <InsightBadge />
                </div>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                  Open vs. acknowledged (7d) — widening gap means pull biomed
                  from projects.
                </p>
              </div>
              <Badge variant="neutral" className="text-[10px] font-medium">
                Demo data
              </Badge>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <MiniAreaChart
                data={[2, 4, 3, 6, 5, 7, 4]}
                height={34}
                strokeClassName="stroke-rose-600"
                fillClassName="fill-rose-500/10"
                label="Opened"
              />
              <MiniAreaChart
                data={[1, 2, 4, 5, 6, 8, 9]}
                height={34}
                strokeClassName="stroke-blue-600"
                fillClassName="fill-blue-500/10"
                label="Acknowledged"
              />
            </div>
            <p className="mt-1 text-[10px] leading-snug text-slate-500">
              <span className="font-semibold text-rose-800">23 alerts</span>{" "}
              today vs{" "}
              <span className="font-semibold text-slate-700">14 avg</span> this
              week — volume spike.
            </p>
          </div>

          <div
            className="grid w-full grid-cols-2 gap-1.5 border-t border-slate-100 pt-2.5 sm:pt-2 xl:w-[13rem] xl:shrink-0 xl:border-t-0 xl:border-l xl:pl-3 xl:pt-0"
            aria-label="Alert summary"
          >
            <p className="col-span-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              At a glance
            </p>
            {c.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-md border border-slate-200/80 bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200/50"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {s.label}
                </p>
                <p className="text-sm font-extrabold tabular-nums leading-tight text-slate-950">
                  {s.value}
                </p>
                {s.hint ? (
                  <p className="text-[10px] leading-tight text-slate-500">
                    {s.hint}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div
            className="mt-2 rounded-lg border border-blue-200/70 bg-gradient-to-b from-blue-50/45 to-white px-3 py-2 shadow-sm xl:mt-0 xl:min-w-[11rem] xl:max-w-[13rem] xl:shrink-0"
            aria-label="SLA snapshot"
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">
              SLA snapshot
            </h3>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              4.3h
            </p>
            <p className="text-[10px] leading-snug text-slate-500">
              Mean time to resolve (7d) — was{" "}
              <span className="font-semibold text-rose-700">3.8h</span> last
              month
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-sky-500"
                title="Within target"
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              72% inside 4h target
            </p>
          </div>
        </div>
      </SectionCard>

      <AlertsTriageQueue />
    </ViewPage>
  );
}
