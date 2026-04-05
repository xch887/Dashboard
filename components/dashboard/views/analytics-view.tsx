"use client";

import { useMemo, useState } from "react";
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
import { MiniAreaChart } from "@/components/dashboard/mini-chart";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import { BarChart3, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  StatCard,
  TableCard,
} from "@/components/dashboard/section-card";

type SiteFilter = "all" | "main" | "north";
type PeriodFilter = "30d" | "90d" | "ytd";

type KpiSlice = {
  uptime: string;
  meanDowntime: string;
  workCompleted: string;
  costAvoided: string;
  uptimeHint: string;
  meanHint: string;
  woHint: string;
  costHint: string;
};

const KPI_SLICES: Record<SiteFilter, Record<PeriodFilter, KpiSlice>> = {
  all: {
    "30d": {
      uptime: "99.2%",
      meanDowntime: "22m",
      workCompleted: "312",
      costAvoided: "$62k",
      uptimeHint: "vs 99.4% prior 30d",
      meanHint: "Per incident",
      woHint: "Closed",
      costHint: "Est. avoid",
    },
    "90d": {
      uptime: "99.4%",
      meanDowntime: "18m",
      workCompleted: "1.1k",
      costAvoided: "$240k",
      uptimeHint: "90d rolling",
      meanHint: "Per incident",
      woHint: "This quarter",
      costHint: "Est.",
    },
    ytd: {
      uptime: "99.3%",
      meanDowntime: "19m",
      workCompleted: "2.8k",
      costAvoided: "$580k",
      uptimeHint: "YTD blended",
      meanHint: "Per incident",
      woHint: "Closed YTD",
      costHint: "Est. avoid",
    },
  },
  main: {
    "30d": {
      uptime: "99.5%",
      meanDowntime: "16m",
      workCompleted: "228",
      costAvoided: "$48k",
      uptimeHint: "Main campus",
      meanHint: "Per incident",
      woHint: "Closed",
      costHint: "Est. avoid",
    },
    "90d": {
      uptime: "99.5%",
      meanDowntime: "15m",
      workCompleted: "802",
      costAvoided: "$186k",
      uptimeHint: "Main · 90d",
      meanHint: "Per incident",
      woHint: "Quarter",
      costHint: "Est.",
    },
    ytd: {
      uptime: "99.4%",
      meanDowntime: "17m",
      workCompleted: "2.1k",
      costAvoided: "$420k",
      uptimeHint: "Main YTD",
      meanHint: "Per incident",
      woHint: "Closed",
      costHint: "Est. avoid",
    },
  },
  north: {
    "30d": {
      uptime: "98.7%",
      meanDowntime: "31m",
      workCompleted: "84",
      costAvoided: "$14k",
      uptimeHint: "North pavilion",
      meanHint: "Per incident",
      woHint: "Closed",
      costHint: "Est. avoid",
    },
    "90d": {
      uptime: "99.1%",
      meanDowntime: "24m",
      workCompleted: "298",
      costAvoided: "$54k",
      uptimeHint: "North · 90d",
      meanHint: "Per incident",
      woHint: "Quarter",
      costHint: "Est.",
    },
    ytd: {
      uptime: "99.0%",
      meanDowntime: "25m",
      workCompleted: "712",
      costAvoided: "$160k",
      uptimeHint: "North YTD",
      meanHint: "Per incident",
      woHint: "Closed",
      costHint: "Est. avoid",
    },
  },
};

const DEPT_VOLUME: Record<
  SiteFilter,
  { label: string; pct: number; wo: number }[]
> = {
  all: [
    { label: "Imaging", pct: 92, wo: 318 },
    { label: "ICU", pct: 78, wo: 271 },
    { label: "ER", pct: 65, wo: 226 },
    { label: "Nephrology", pct: 54, wo: 188 },
    { label: "Cardiology", pct: 48, wo: 166 },
    { label: "Lab / pathology", pct: 41, wo: 142 },
  ],
  main: [
    { label: "Imaging", pct: 88, wo: 244 },
    { label: "ICU", pct: 81, wo: 224 },
    { label: "ER", pct: 70, wo: 194 },
    { label: "OR", pct: 58, wo: 160 },
    { label: "Cardiology", pct: 52, wo: 144 },
    { label: "Pharmacy", pct: 36, wo: 100 },
  ],
  north: [
    { label: "Rehab", pct: 72, wo: 88 },
    { label: "Oncology", pct: 64, wo: 78 },
    { label: "Imaging", pct: 55, wo: 67 },
    { label: "Med/surg", pct: 48, wo: 58 },
    { label: "Dialysis", pct: 40, wo: 49 },
  ],
};

type ModalityRow = {
  modality: string;
  wo: string;
  downtime: string;
  trend: string;
  trendDir: "up" | "down" | "flat";
};

const MODALITY_BY_SITE: Record<SiteFilter, ModalityRow[]> = {
  all: [
    {
      modality: "Patient monitors",
      wo: "412",
      downtime: "12m",
      trend: "+4%",
      trendDir: "up",
    },
    {
      modality: "Infusion",
      wo: "289",
      downtime: "22m",
      trend: "−2%",
      trendDir: "down",
    },
    {
      modality: "Ventilation",
      wo: "156",
      downtime: "31m",
      trend: "+1%",
      trendDir: "up",
    },
    {
      modality: "Imaging (large)",
      wo: "98",
      downtime: "45m",
      trend: "—",
      trendDir: "flat",
    },
    {
      modality: "Anesthesia",
      wo: "76",
      downtime: "28m",
      trend: "−6%",
      trendDir: "down",
    },
    {
      modality: "Telemetry / connectivity",
      wo: "203",
      downtime: "19m",
      trend: "+3%",
      trendDir: "up",
    },
  ],
  main: [
    {
      modality: "Patient monitors",
      wo: "301",
      downtime: "11m",
      trend: "+2%",
      trendDir: "up",
    },
    {
      modality: "Infusion",
      wo: "214",
      downtime: "19m",
      trend: "−4%",
      trendDir: "down",
    },
    {
      modality: "Ventilation",
      wo: "118",
      downtime: "27m",
      trend: "—",
      trendDir: "flat",
    },
    {
      modality: "Imaging (large)",
      wo: "82",
      downtime: "38m",
      trend: "+1%",
      trendDir: "up",
    },
    {
      modality: "Sterilization / SPD",
      wo: "64",
      downtime: "24m",
      trend: "−3%",
      trendDir: "down",
    },
  ],
  north: [
    {
      modality: "Patient monitors",
      wo: "111",
      downtime: "15m",
      trend: "+8%",
      trendDir: "up",
    },
    {
      modality: "Infusion",
      wo: "75",
      downtime: "29m",
      trend: "+5%",
      trendDir: "up",
    },
    {
      modality: "Dialysis machines",
      wo: "52",
      downtime: "41m",
      trend: "−1%",
      trendDir: "down",
    },
    {
      modality: "Imaging (portable)",
      wo: "38",
      downtime: "33m",
      trend: "—",
      trendDir: "flat",
    },
  ],
};

const UPTIME_TREND: Record<PeriodFilter, number[]> = {
  "30d": [99.0, 99.1, 98.9, 99.2, 99.3, 99.2, 99.2],
  "90d": [
    98.8, 98.9, 99.0, 99.0, 99.1, 99.2, 99.1, 99.2, 99.3, 99.2, 99.4, 99.4,
  ],
  ytd: [
    98.6, 98.8, 98.9, 99.0, 99.0, 99.1, 99.1, 99.2, 99.2, 99.3, 99.3, 99.3,
  ],
};

const WO_THROUGHPUT: Record<PeriodFilter, number[]> = {
  "30d": [38, 42, 36, 44, 41, 39, 45],
  "90d": [32, 35, 38, 40, 36, 42, 44, 41, 39, 43, 46, 44],
  ytd: [28, 30, 33, 36, 38, 40, 42, 41, 44, 46, 48, 47],
};

/** 5 weeks × 7 days — utilization index 0–100 per cell */
const HEATMAP: Record<SiteFilter, number[][]> = {
  all: [
    [42, 55, 61, 58, 52, 38, 28],
    [48, 62, 68, 71, 65, 44, 32],
    [51, 64, 72, 74, 69, 46, 35],
    [49, 60, 67, 70, 63, 42, 33],
    [45, 58, 64, 66, 60, 40, 30],
  ],
  main: [
    [48, 58, 64, 62, 56, 42, 34],
    [52, 66, 72, 75, 70, 48, 38],
    [55, 68, 76, 78, 73, 50, 40],
    [53, 64, 71, 74, 68, 46, 37],
    [50, 61, 67, 69, 64, 44, 35],
  ],
  north: [
    [35, 42, 48, 46, 40, 30, 22],
    [38, 46, 52, 54, 48, 34, 26],
    [40, 48, 55, 58, 50, 36, 28],
    [37, 44, 50, 52, 46, 32, 25],
    [36, 43, 49, 51, 44, 31, 24],
  ],
};

const HEAT_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

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
          : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function heatColor(v: number) {
  const t = v / 100;
  const r = Math.round(14 + (45 - 14) * (1 - t));
  const g = Math.round(165 + (200 - 165) * t);
  const b = Math.round(162 + (220 - 162) * t);
  return `rgb(${r} ${g} ${b} / ${0.22 + t * 0.55})`;
}

export function AnalyticsView() {
  const [site, setSite] = useState<SiteFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("90d");

  const kpi = KPI_SLICES[site][period];
  const deptRows = DEPT_VOLUME[site];
  const modalityRows = MODALITY_BY_SITE[site];
  const uptimeData = UPTIME_TREND[period];
  const woData = WO_THROUGHPUT[period];
  const heatCells = HEATMAP[site];

  const kpiCards = useMemo(
    () => [
      {
        label: "Uptime",
        value: kpi.uptime,
        hint: kpi.uptimeHint,
      },
      {
        label: "Mean downtime",
        value: kpi.meanDowntime,
        hint: kpi.meanHint,
      },
      {
        label: "Work completed",
        value: kpi.workCompleted,
        hint: kpi.woHint,
      },
      {
        label: "Cost avoided",
        value: kpi.costAvoided,
        hint: kpi.costHint,
      },
    ],
    [kpi]
  );

  const c = sectionConfigs.analytics;

  return (
    <ViewPage>
      <PageHeader
        icon={BarChart3}
        title={c.title}
        description={c.description}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-lg text-xs font-semibold"
            type="button"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <SectionCard className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Site
          </span>
          <FilterPill active={site === "all"} onClick={() => setSite("all")}>
            All sites
          </FilterPill>
          <FilterPill active={site === "main"} onClick={() => setSite("main")}>
            Main campus
          </FilterPill>
          <FilterPill
            active={site === "north"}
            onClick={() => setSite("north")}
          >
            North pavilion
          </FilterPill>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Period
          </span>
          <FilterPill
            active={period === "30d"}
            onClick={() => setPeriod("30d")}
          >
            30d
          </FilterPill>
          <FilterPill
            active={period === "90d"}
            onClick={() => setPeriod("90d")}
          >
            90d
          </FilterPill>
          <FilterPill active={period === "ytd"} onClick={() => setPeriod("ytd")}>
            YTD
          </FilterPill>
        </div>
        <Badge variant="neutral" className="w-fit text-[10px] font-medium">
          Demo aggregates
        </Badge>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard>
          <MiniAreaChart
            data={uptimeData}
            height={88}
            strokeClassName="stroke-emerald-600"
            fillClassName="fill-emerald-500/12"
            label={`Uptime % (${period})`}
            animateOnMount
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Rolling average of connected-device availability — excludes planned
            vendor downtime windows.
          </p>
        </SectionCard>
        <SectionCard>
          <MiniAreaChart
            data={woData}
            height={88}
            strokeClassName="stroke-blue-600"
            fillClassName="fill-blue-500/10"
            label={`Work orders closed (${period})`}
            animateOnMount
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Throughput normalized per week in view — use with department bars
            to spot load shift.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Work volume by department
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {period} ·{" "}
              {site === "all"
                ? "All sites"
                : site === "main"
                  ? "Main"
                  : "North"}
            </span>
          </div>
          <ul className="space-y-4">
            {deptRows.map((b) => (
              <li key={b.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{b.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {b.pct}% · {b.wo} WOs
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-500"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Utilization heatmap
            </h2>
            <span className="text-[10px] text-slate-500">
              Last 5 weeks · device hours vs baseline
            </span>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-slate-400">
            {HEAT_WEEKDAYS.map((d, i) => (
              <div key={`${d}-${i}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {heatCells.flatMap((week, wi) =>
              week.map((v, di) => (
                <div
                  key={`${wi}-${di}`}
                  className="aspect-square rounded-md ring-1 ring-slate-900/[0.04]"
                  style={{ backgroundColor: heatColor(v) }}
                  title={`W${wi + 1} ${HEAT_WEEKDAYS[di]} · ${v}% of baseline`}
                />
              ))
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm ring-1 ring-slate-200/80"
                style={{ backgroundColor: heatColor(30) }}
              />
              Low
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm ring-1 ring-slate-200/80"
                style={{ backgroundColor: heatColor(65) }}
              />
              Mid
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm ring-1 ring-slate-200/80"
                style={{ backgroundColor: heatColor(92) }}
              />
              High
            </span>
          </div>
        </SectionCard>
      </div>

      <TableCard
        title="Modality breakdown"
        description={`Mean downtime is MTTR-style, per modality (${period}).`}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-slate-500">
                Modality
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Work orders
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Mean downtime
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                vs prior
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modalityRows.map((r) => (
              <TableRow key={r.modality} className="border-slate-100">
                <TableCell className="font-medium text-slate-900">
                  {r.modality}
                </TableCell>
                <TableCell className="tabular-nums text-slate-600">
                  {r.wo}
                </TableCell>
                <TableCell className="tabular-nums text-slate-600">
                  {r.downtime}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    r.trendDir === "up" && "text-rose-700",
                    r.trendDir === "down" && "text-emerald-700",
                    r.trendDir === "flat" && "text-slate-500"
                  )}
                >
                  {r.trend}
                  {r.trendDir === "up" ? (
                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                      worse
                    </span>
                  ) : null}
                  {r.trendDir === "down" ? (
                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                      better
                    </span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCard>
    </ViewPage>
  );
}
