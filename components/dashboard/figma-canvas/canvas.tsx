"use client";

import {
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  FileSignature,
  FileText,
  Filter,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Wind,
} from "lucide-react";
import {
  calendarDays,
  complianceBlue,
  complianceViolet,
  deadlines,
  healthSlices,
  kpis,
  months,
  queueRows,
  taskSlices,
  type QueueRisk,
  type QueueStatus,
} from "@/components/dashboard/figma-canvas/data";

const tile =
  "overflow-hidden rounded-[10px] border-0 bg-white shadow-[0_0_20px_0_rgba(1,53,141,0.08)]";
const heading = "text-[13px] font-semibold leading-none text-slate-900";
const meta = "text-[11px] leading-none text-slate-400";
const control =
  "inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600";

const kpiIcons = [BarChart3, Users, Clock, CheckCircle2];

function sparkParts(values: number[]) {
  const w = 64;
  const h = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return { x, y };
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  return { w, h, line, area };
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlice(
  start: number,
  sweep: number,
  rOut: number,
  rIn: number,
  cx = 100,
  cy = 100,
  gap = 0.4
) {
  const s = start + gap;
  const e = start + sweep - gap;
  if (e <= s) return "";
  const p1o = polar(cx, cy, rOut, s);
  const p2o = polar(cx, cy, rOut, e);
  const p2i = polar(cx, cy, rIn, e);
  const p1i = polar(cx, cy, rIn, s);
  const large = sweep - gap * 2 > 180 ? 1 : 0;
  return `M ${p1o.x} ${p1o.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2o.x} ${p2o.y} L ${p2i.x} ${p2i.y} A ${rIn} ${rIn} 0 ${large} 0 ${p1i.x} ${p1i.y} Z`;
}

function smoothLine(
  values: number[],
  xAt: (i: number) => number,
  yAt: (v: number) => number
) {
  const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = (p1.x - p0.x) * 0.4;
    d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function riskClass(risk: QueueRisk) {
  if (risk === "High") return "bg-[#FDE8E8] text-[#F31260]";
  if (risk === "Med") return "bg-[#FEF3C7] text-[#B45309]";
  if (risk === "None") return "bg-[#E6F1FE] text-[#006FEE]";
  return "bg-slate-100 text-slate-500";
}

function statusClass(status: QueueStatus) {
  if (status === "Action Required") return "bg-[#FDE8E8] text-[#F31260]";
  if (status === "Resolved") return "bg-[#E8FAF0] text-[#12A150]";
  if (status === "In Progress") return "bg-[#E6F1FE] text-[#006FEE]";
  return "bg-slate-100 text-slate-500";
}

function HealthDonut() {
  let angle = -22;
  const slices = healthSlices.map((s) => {
    const start = angle;
    const sweep = (s.pct / 100) * 360;
    angle += sweep;
    return { ...s, d: donutSlice(start, sweep, 84, 60) };
  });
  const total = healthSlices.reduce((a, s) => a + s.count, 0);

  return (
    <section className={`${tile} flex h-full flex-col px-3.5 py-3`}>
      <div className="flex items-center justify-between">
        <h2 className={heading}>Device Health Overview</h2>
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-slate-100 text-slate-400">
          <Settings className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center gap-3">
        <div className="relative h-[124px] w-[124px] shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {slices.map((s) => (
              <path key={s.key} d={s.d} fill={s.color} />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[9px] leading-none text-slate-400">Total</p>
            <p className="mt-1 text-[17px] font-bold leading-none tabular-nums text-slate-900">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-[9px] leading-none text-slate-400">
              Devices
            </p>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {healthSlices.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between gap-2 text-[11px] leading-none"
            >
              <span className="flex items-center gap-1.5 text-slate-600">
                <span
                  className="h-1.5 w-1.5 rounded-[2px]"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </span>
              <span className="tabular-nums text-slate-400">
                {s.pct}% ({s.count.toLocaleString()})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ComplianceChart() {
  const W = 640;
  const H = 210;
  const L = 36;
  const R = 8;
  const T = 8;
  const B = 22;
  const innerW = W - L - R;
  const innerH = H - T - B;
  const yMin = 60;
  const yMax = 100;
  const xAt = (i: number) => L + (i / 11) * innerW;
  const yAt = (v: number) => T + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  return (
    <section className={`${tile} flex h-full min-h-0 flex-col px-4 pt-3.5 pb-2`}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h2 className={heading}>Maintenance Compliance</h2>
          <p className={meta}>
            % of devices meeting scheduled maintenance requirements
          </p>
        </div>
        <button type="button" className={control}>
          Monthly
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full min-h-[188px] w-full"
          preserveAspectRatio="none"
        >
          {[60, 70, 80, 90, 100].map((g) => (
            <g key={g}>
              <line
                x1={L}
                x2={W - R}
                y1={yAt(g)}
                y2={yAt(g)}
                stroke="#E4E4E7"
                strokeDasharray={g === 60 || g === 100 ? "0" : "3 4"}
              />
              <text
                x={L - 8}
                y={yAt(g) + 3}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {g}%
              </text>
            </g>
          ))}
          <rect
            x={L}
            y={yAt(90)}
            width={innerW}
            height={yAt(80) - yAt(90)}
            fill="rgb(134 239 172 / 0.35)"
            rx="2"
          />
          <text
            x={L + 8}
            y={yAt(90) + 12}
            className="fill-emerald-700/70 text-[9px]"
          >
            Target Range
          </text>
          <path
            d={smoothLine(complianceViolet, xAt, yAt)}
            fill="none"
            stroke="#7C6BF0"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d={smoothLine(complianceBlue, xAt, yAt)}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {months.map((m, i) => (
            <text
              key={m}
              x={xAt(i)}
              y={H - 4}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

const deadlineIcons = {
  file: FileText,
  pump: Cpu,
  vent: Wind,
  contract: FileSignature,
};

function MaintenanceGauge() {
  const total = taskSlices.reduce((a, s) => a + s.count, 0);
  let angle = 228;
  const slices = taskSlices.map((s) => {
    const start = angle;
    const sweep = (s.count / total) * 264;
    angle += sweep;
    return { ...s, d: donutSlice(start, sweep, 90, 64, 100, 100, 1.6) };
  });

  return (
    <section className={`${tile} flex h-full flex-col p-3.5`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className={heading}>Maintenance Status</h2>
          <p className={`${meta} mt-1`}>Last update 1 day ago</p>
        </div>
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-slate-100 text-slate-400">
          <RefreshCw className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
        </span>
      </div>
      <div className="relative mx-auto my-auto h-[140px] w-[180px]">
        <svg viewBox="4 8 192 148" className="h-full w-full">
          {slices.map((s) => (
            <path key={s.key} d={s.d} fill={s.color} />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center text-center">
          <p className="text-[28px] font-bold leading-none tabular-nums text-slate-900">
            {total}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Total Tasks</p>
        </div>
      </div>
      <ul className="mt-1 grid grid-cols-2 gap-1.5">
        {taskSlices.map((s) => (
          <li
            key={s.key}
            className="rounded-lg border border-slate-100 px-2 py-1.5"
          >
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label} - {s.pct}%
            </p>
            <p className="mt-0.5 pl-[13px] text-[10px] text-slate-400">
              Total - {s.count}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function KpiTile({
  kpi,
  icon: Icon,
}: {
  kpi: (typeof kpis)[number];
  icon: typeof Activity;
}) {
  const good = kpi.sparkTone !== "bad";
  const spark = sparkParts(kpi.spark);
  const stroke = good ? "#17C964" : "#F31260";
  const fill = good ? "rgba(23,201,100,0.16)" : "rgba(243,18,96,0.12)";

  return (
    <article className={`${tile} flex h-full items-start justify-between gap-2 px-3 py-2.5`}>
      <div className="min-w-0">
        <p className="flex items-baseline gap-1 leading-none">
          <span className="text-[22px] font-bold tabular-nums tracking-tight text-slate-900">
            {kpi.value}
          </span>
          <span className="text-[10px] text-slate-400">{kpi.unit}</span>
        </p>
        <p className="mt-2 text-[10px] leading-none text-slate-500">
          {kpi.title}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1">
          <svg
            viewBox={`0 0 ${spark.w} ${spark.h}`}
            className="h-[18px] w-[46px]"
            aria-hidden
          >
            <path d={spark.area} fill={fill} />
            <path
              d={spark.line}
              fill="none"
              stroke={stroke}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-slate-100 text-slate-400">
            <Icon className="h-2.5 w-2.5" strokeWidth={2.2} />
          </span>
        </div>
        <p className="flex flex-col items-end gap-0.5 text-right">
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] leading-none ${
              good ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {kpi.deltaTone === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="font-semibold">{kpi.delta}</span>
          </span>
          <span className="text-[9px] leading-none text-slate-400">
            from last week
          </span>
        </p>
      </div>
    </article>
  );
}

export function FigmaDashboardCanvas() {
  return (
    <div className="grid min-h-0 flex-1 items-stretch gap-2.5 lg:grid-cols-12 lg:grid-rows-[auto_minmax(220px,1fr)_auto]">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-12 lg:col-span-8 lg:row-start-1">
        <div className="grid grid-cols-2 gap-2.5 sm:col-span-7">
          {kpis.map((kpi, i) => (
            <KpiTile key={kpi.title} kpi={kpi} icon={kpiIcons[i]!} />
          ))}
        </div>
        <div className="sm:col-span-5">
          <HealthDonut />
        </div>
      </div>

      <section
        className={`${tile} flex min-h-0 flex-col p-3.5 lg:col-span-4 lg:row-span-2 lg:row-start-1`}
      >
        <div className="flex items-center justify-between">
          <h2 className={heading}>Calendar</h2>
          <button type="button" className={`${control} h-[22px] px-1.5 text-[10px]`}>
            <CalendarIcon className="h-3 w-3 text-slate-400" />
            August
            <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-7">
          {calendarDays.map((day) => (
            <div
              key={day.d}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span className="text-[10px] text-slate-400">{day.w}</span>
              <span
                className={
                  day.selected
                    ? "flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[11px] font-semibold text-white"
                    : "flex h-5 w-5 items-center justify-center text-[11px] font-medium text-slate-700"
                }
              >
                {day.d}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col border-t border-slate-100 pt-3">
          <h3 className={`${heading} mb-2`}>Deadlines</h3>
          <ul className="flex flex-1 flex-col gap-1.5">
            {deadlines.map((d) => {
              const DeadlineIcon = deadlineIcons[d.icon];
              return (
                <li
                  key={d.title}
                  className="flex flex-1 items-start gap-2 rounded-[10px] border border-slate-100 px-2.5 py-2"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400">
                    <DeadlineIcon className="h-3 w-3" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold leading-snug text-slate-900">
                        {d.title}
                      </p>
                      <MoreHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] leading-snug text-slate-500">
                      <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                      {d.meta}
                    </p>
                    <p className="text-[10px] leading-snug text-slate-500">
                      {d.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="min-h-0 lg:col-span-8 lg:row-start-2">
        <ComplianceChart />
      </div>

      <section className={`${tile} lg:col-span-8 lg:row-start-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className={heading}>Device Action Queue</h2>
            <p className={meta}>2 devices requiring action</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={control}>
              Next 14 days
              <ChevronDown className="h-3 w-3" />
            </button>
            <button type="button" className={control}>
              <Filter className="h-3 w-3" />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-y border-slate-100 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2 font-medium">Device</th>
                <th className="px-2 py-2 font-medium">Department</th>
                <th className="px-2 py-2 font-medium">Risk</th>
                <th className="px-2 py-2 font-medium">Recommended Action</th>
                <th className="px-2 py-2 font-medium">Assigned To</th>
                <th className="px-2 py-2 font-medium">Due By</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    <p className="text-[10px] text-slate-400">{row.id}</p>
                  </td>
                  <td className="px-2 py-2.5 text-slate-600">
                    {row.department}
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${riskClass(row.risk)}`}
                    >
                      {row.risk}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-slate-700">{row.action}</td>
                  <td className="px-2 py-2.5">
                    <p className="text-slate-800">{row.assignee}</p>
                    <p className="text-[10px] text-slate-400">{row.team}</p>
                  </td>
                  <td className="px-2 py-2.5 text-slate-600">{row.due}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-slate-50"
                      aria-label={`Actions for ${row.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="lg:col-span-4 lg:row-start-3">
        <MaintenanceGauge />
      </div>
    </div>
  );
}
