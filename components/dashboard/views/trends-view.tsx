"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MiniAreaChart } from "@/components/dashboard/mini-chart";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import {
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  BatteryWarning,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightBadge } from "@/components/dashboard/insight-badge";
import {
  SectionCard,
  StatCard,
} from "@/components/dashboard/section-card";

type HorizonKey = "7d" | "14d" | "30d" | "60d";

const FORECAST_WINDOWS: {
  key: HorizonKey;
  label: string;
  failures: string;
  band: string;
  conf: "High" | "Med" | "Low";
}[] = [
  {
    key: "7d",
    label: "7 days",
    failures: "18",
    band: "14–22",
    conf: "High",
  },
  {
    key: "14d",
    label: "14 days",
    failures: "31",
    band: "26–38",
    conf: "Med",
  },
  {
    key: "30d",
    label: "30 days",
    failures: "54",
    band: "44–63",
    conf: "Med",
  },
  {
    key: "60d",
    label: "60 days",
    failures: "97",
    band: "81–114",
    conf: "Low",
  },
];

const HAZARD_SERIES: Record<HorizonKey, number[]> = {
  "7d": [52, 54, 51, 56, 58, 55, 60],
  "14d": [48, 50, 52, 51, 55, 54, 58, 57, 61, 60, 63, 62, 64, 66],
  "30d": [40, 42, 44, 43, 46, 48, 47, 51, 52, 54, 53, 58],
  "60d": [
    32, 34, 35, 38, 40, 39, 42, 44, 45, 48, 50, 52, 51, 54, 56, 58, 60, 62,
    64, 63, 66, 68, 70, 72,
  ],
};

const HORIZON_KPI: Record<
  HorizonKey,
  { highRisk: string; accuracy: string; refreshNote: string }
> = {
  "7d": {
    highRisk: "412",
    accuracy: "0.84",
    refreshNote: "Short window · recalibrated nightly",
  },
  "14d": {
    highRisk: "428",
    accuracy: "0.83",
    refreshNote: "Balanced signal / noise",
  },
  "30d": {
    highRisk: "441",
    accuracy: "0.81",
    refreshNote: "Default planning horizon",
  },
  "60d": {
    highRisk: "468",
    accuracy: "0.76",
    refreshNote: "Wider bands — use for capacity only",
  },
};

type RiskBucket = "critical" | "elevated" | "watch";

type RiskDevice = {
  id: string;
  name: string;
  score: number;
  drivers: string;
  bucket: RiskBucket;
  batteryNote?: string;
};

function bucketForScore(score: number): RiskBucket {
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "elevated";
  return "watch";
}

const RISK_DEVICES: RiskDevice[] = [
  {
    id: "DEV-9022",
    name: "TempGuard Pro",
    score: 0.91,
    drivers: "Battery fade curve · excursion rate vs pharmacy SOP",
    batteryNote: "−4.2% cap / mo",
  },
  {
    id: "DEV-3312",
    name: "Baxter Spectrum IQ Infusion Pump",
    score: 0.84,
    drivers: "Motor hours · Wi‑Fi RSSI variance · alert burst index",
    batteryNote: "−2.8% / mo",
  },
  {
    id: "DEV-5510",
    name: "Capsule Neuron 2",
    score: 0.79,
    drivers: "Sync gap entropy · VLAN handoff failures",
  },
  {
    id: "DEV-1088",
    name: "Siemens MAGNETOM Vida",
    score: 0.72,
    drivers: "Cryogen model residual · vibration HF energy",
  },
  {
    id: "DEV-2041",
    name: "Philips IntelliVue MX800",
    score: 0.68,
    drivers: "NIBP motor duty cycle · lead impedance drift",
    batteryNote: "−1.1% / mo",
  },
  {
    id: "DEV-4401",
    name: "GE Revolution Apex CT",
    score: 0.61,
    drivers: "Tube scan-hours vs cooling duty · heat-soak index",
  },
  {
    id: "DEV-0892",
    name: "Maquet Servo-air Ventilator",
    score: 0.58,
    drivers: "O₂ sensor delta · high-flow duty hours",
  },
  {
    id: "DEV-6120",
    name: "Roche cobas interface",
    score: 0.55,
    drivers: "HL7 error slope · queue depth autocorr",
  },
  {
    id: "DEV-8891",
    name: "Eaton 9PX UPS",
    score: 0.52,
    drivers: "Battery impedance spread · self-test deferrals",
    batteryNote: "String 2 aging",
  },
  {
    id: "DEV-7734",
    name: "Maxtec O2 analyzer",
    score: 0.48,
    drivers: "Calibration drift · bench vs bedside delta",
  },
].map((d) => ({ ...d, bucket: bucketForScore(d.score) }));

const BATTERY_FADE = [
  {
    label: "Telemetry patches · ICU",
    health: 78,
    fadeMo: "−2.1%",
    note: "2023 cell batch — plan swap Q3",
  },
  {
    label: "Infusion fleet (wireless)",
    health: 71,
    fadeMo: "−2.8%",
    note: "Correlated with high-traffic pods",
  },
  {
    label: "Portable patient monitors",
    health: 84,
    fadeMo: "−1.3%",
    note: "Within expected decay",
  },
  {
    label: "Temp probes · cold chain",
    health: 62,
    fadeMo: "−3.6%",
    note: "Probe flex fatigue cluster",
  },
];

const WORKLOAD = {
  predictedHrs: 416,
  capacityHrs: 520,
  baselineHrs: 380,
  peakWeek: "Apr 7–13",
};

type ScoreFilter = "all" | "critical" | "elevated";

const confVariant = {
  High: "success",
  Med: "warning",
  Low: "neutral",
} as const;

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

export function TrendsView() {
  const c = sectionConfigs.trends;
  const [horizonFocus, setHorizonFocus] = useState<HorizonKey>("30d");
  const [modelOutputOpen, setModelOutputOpen] = useState(true);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");

  const kpiExtra = HORIZON_KPI[horizonFocus];

  const displayStats = useMemo(() => {
    return c.stats.map((s) => {
      if (s.label === "High-risk devices") {
        return { ...s, value: kpiExtra.highRisk };
      }
      if (s.label === "Forecast horizon") {
        return { ...s, value: horizonFocus.toUpperCase() };
      }
      if (s.label === "Accuracy") {
        return { ...s, value: kpiExtra.accuracy };
      }
      return s;
    });
  }, [c.stats, horizonFocus, kpiExtra]);

  const filteredRisk = useMemo(() => {
    return RISK_DEVICES.filter((d) => {
      if (scoreFilter === "critical") return d.bucket === "critical";
      if (scoreFilter === "elevated")
        return d.bucket === "critical" || d.bucket === "elevated";
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [scoreFilter]);

  const hazardData = HAZARD_SERIES[horizonFocus];
  const workloadPct = Math.round(
    (WORKLOAD.predictedHrs / WORKLOAD.capacityHrs) * 100
  );

  return (
    <ViewPage>
      <PageHeader
        icon={TrendingUp}
        title={c.title}
        description={c.description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" className="text-[10px] font-semibold">
              Model v2.6.1
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-xs font-semibold"
              type="button"
            >
              Export scenario
            </Button>
          </div>
        }
      />

      <SectionCard className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Hazard horizon
          </span>
          {FORECAST_WINDOWS.map((w) => (
            <FilterPill
              key={w.key}
              active={horizonFocus === w.key}
              onClick={() => setHorizonFocus(w.key)}
            >
              {w.label}
            </FilterPill>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Refresh:</span> Daily
          06:12 UTC · {kpiExtra.refreshNote}
        </p>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            hint={s.hint}
          />
        ))}
      </div>

      <SectionCard as="section">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                High-risk devices — ranked
              </h2>
              <InsightBadge />
            </div>
            <p className="text-[11px] text-slate-500">
              Model-ranked failure risk (0–1); filter to focus triage.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Score
            </span>
            <FilterPill
              active={scoreFilter === "all"}
              onClick={() => setScoreFilter("all")}
            >
              All ({RISK_DEVICES.length})
            </FilterPill>
            <FilterPill
              active={scoreFilter === "critical"}
              onClick={() => setScoreFilter("critical")}
            >
              ≥0.85
            </FilterPill>
            <FilterPill
              active={scoreFilter === "elevated"}
              onClick={() => setScoreFilter("elevated")}
            >
              ≥0.65
            </FilterPill>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRisk.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm ring-1 ring-slate-200/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      d.bucket === "critical" && "bg-rose-500/10 text-rose-600",
                      d.bucket === "elevated" &&
                        "bg-amber-500/10 text-amber-700",
                      d.bucket === "watch" && "bg-slate-100 text-slate-600"
                    )}
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight text-slate-900">
                      {d.name}
                    </p>
                    <Link
                      href={`/fleet?device=${encodeURIComponent(d.id)}`}
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-700 hover:underline"
                    >
                      {d.id}
                      <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                    </Link>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500">
                      {d.drivers}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-bold tabular-nums text-rose-700">
                    {d.score.toFixed(2)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-semibold",
                      d.bucket === "critical" &&
                        "border-rose-200 bg-rose-50 text-rose-900",
                      d.bucket === "elevated" &&
                        "border-amber-200 bg-amber-50 text-amber-950",
                      d.bucket === "watch" &&
                        "border-slate-200 bg-slate-50 text-slate-700"
                    )}
                  >
                    {d.bucket === "critical"
                      ? "Critical"
                      : d.bucket === "elevated"
                        ? "Elevated"
                        : "Watch"}
                  </Badge>
                </div>
              </div>
              {d.batteryNote ? (
                <p className="text-[10px] font-medium text-amber-800">
                  Battery: {d.batteryNote}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard as="section" className="bg-gradient-to-br from-blue-500/[0.06] to-transparent ring-blue-500/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Predicted corrective events
              </h2>
              <InsightBadge />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Poisson–gamma blend on telemetry features — 90% posterior bands.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FORECAST_WINDOWS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setHorizonFocus(f.key)}
              className={cn(
                "rounded-xl border bg-white/90 p-4 text-left shadow-sm transition-[box-shadow,ring]",
                horizonFocus === f.key
                  ? "ring-2 ring-blue-500/35 ring-offset-2 ring-offset-slate-50"
                  : "border-white/80 hover:ring-1 hover:ring-slate-200/80"
              )}
            >
              <p className="text-xs font-medium text-slate-500">{f.label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                {f.failures}
              </p>
              <p className="text-xs text-slate-500">90% band: {f.band}</p>
              <Badge
                variant={confVariant[f.conf]}
                className="mt-3 text-[10px] font-semibold"
              >
                Confidence · {f.conf}
              </Badge>
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-blue-500/15 pt-4">
          <button
            type="button"
            onClick={() => setModelOutputOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-slate-200/60 hover:bg-white/40"
            aria-expanded={modelOutputOpen}
            id="trends-model-output-toggle"
          >
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Hazard index trajectory
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Normalized failure risk — scales with selected horizon
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200",
                modelOutputOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>
          {modelOutputOpen ? (
            <div
              className="mt-4 rounded-xl border border-blue-500/20 bg-white/80 px-4 py-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
              role="region"
              aria-labelledby="trends-model-output-toggle"
            >
              <MiniAreaChart
                data={hazardData}
                height={112}
                strokeClassName="stroke-blue-600"
                fillClassName="fill-blue-500/12"
                label={`Hazard index · ${horizonFocus} resolution`}
                animateOnMount
              />
              <p className="mt-2 text-[11px] leading-snug text-slate-500">
                Uptick mid-series reflects scheduled vendor windows and census
                overlay — not a model fault.
              </p>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard as="section">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <BatteryWarning className="h-4 w-4 text-amber-600" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-900">
              Battery fade — fleet cohorts
            </h2>
            <InsightBadge />
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Rolling 90d regression on effective capacity; used as a prior in
            device risk scores.
          </p>
          <ul className="space-y-4">
            {BATTERY_FADE.map((b) => (
              <li key={b.label}>
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-800">{b.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {b.fadeMo} / mo · health {b.health}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      b.health >= 75
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : b.health >= 65
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                          : "bg-gradient-to-r from-rose-500 to-orange-400"
                    )}
                    style={{ width: `${b.health}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{b.note}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard as="section">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-900">
              Workload forecast
            </h2>
            <InsightBadge />
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Predicted corrective labor for {horizonFocus} vs staffed capacity —
            peak week {WORKLOAD.peakWeek}.
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Predicted hours</span>
              <span className="tabular-nums">
                {WORKLOAD.predictedHrs}h / {WORKLOAD.capacityHrs}h cap
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500",
                  workloadPct >= 85 && "from-amber-500 to-orange-500"
                )}
                style={{ width: `${Math.min(100, workloadPct)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Baseline trend {WORKLOAD.baselineHrs}h — add{" "}
              <span className="font-semibold text-slate-700">
                {WORKLOAD.predictedHrs - WORKLOAD.baselineHrs}h
              </span>{" "}
              vs last horizon for same cohort.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Overtime risk
              </p>
              <p className="mt-0.5 text-lg font-bold text-amber-800">Medium</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Contractor lift
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-800">+32h</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </ViewPage>
  );
}
