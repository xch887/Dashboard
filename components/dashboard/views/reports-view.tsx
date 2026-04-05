"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import { Input } from "@/components/ui/input";
import {
  FileText,
  FileSpreadsheet,
  Shield,
  Download,
  CalendarClock,
  Wand2,
  Mail,
  Search,
  Activity,
  Lock,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type ReportCategory =
  | "regulatory"
  | "executive"
  | "operations"
  | "security";

type Template = {
  id: string;
  title: string;
  desc: string;
  category: ReportCategory;
  formats: ("PDF" | "XLSX")[];
  regulatory?: boolean;
  icon: LucideIcon;
  color: string;
};

const TEMPLATES: Template[] = [
  {
    id: "tpl-jc",
    title: "Joint Commission readiness",
    desc: "Device inventory, PM compliance, open alerts, exception log",
    category: "regulatory",
    formats: ["PDF", "XLSX"],
    regulatory: true,
    icon: Shield,
    color:
      "from-violet-500/15 to-violet-600/5 text-violet-700 ring-violet-500/20",
  },
  {
    id: "tpl-cms",
    title: "CMS equipment maintenance",
    desc: "Logs and attestations formatted for surveyor binders",
    category: "regulatory",
    formats: ["PDF"],
    regulatory: true,
    icon: FileSpreadsheet,
    color:
      "from-amber-500/15 to-orange-500/5 text-amber-900 ring-amber-500/20",
  },
  {
    id: "tpl-dnv",
    title: "DNV / HFAP tracer packet",
    desc: "Traceable work orders, vendor COIs, recall attestation",
    category: "regulatory",
    formats: ["PDF"],
    regulatory: true,
    icon: FileText,
    color: "from-rose-500/12 to-rose-600/5 text-rose-900 ring-rose-500/20",
  },
  {
    id: "tpl-exec",
    title: "Monthly executive summary",
    desc: "Uptime, work orders, cost avoidance, risk highlights",
    category: "executive",
    formats: ["PDF", "XLSX"],
    icon: FileText,
    color: "from-blue-500/15 to-sky-500/5 text-blue-800 ring-blue-500/20",
  },
  {
    id: "tpl-capital",
    title: "Capital & replacement forecast",
    desc: "Age bands, OEM EOS, risk score roll-up by department",
    category: "executive",
    formats: ["XLSX", "PDF"],
    icon: Activity,
    color: "from-cyan-500/12 to-sky-500/5 text-cyan-900 ring-cyan-500/20",
  },
  {
    id: "tpl-util",
    title: "Device utilization (modality)",
    desc: "Utilization heatmaps and idle asset candidates",
    category: "operations",
    formats: ["XLSX"],
    icon: Stethoscope,
    color:
      "from-emerald-500/12 to-teal-500/5 text-emerald-900 ring-emerald-500/25",
  },
  {
    id: "tpl-fleet",
    title: "Fleet health export",
    desc: "CSV-friendly manifest: firmware, battery, connectivity",
    category: "operations",
    formats: ["XLSX"],
    icon: FileSpreadsheet,
    color: "from-slate-500/12 to-slate-600/5 text-slate-800 ring-slate-400/25",
  },
  {
    id: "tpl-phi",
    title: "PHI access review",
    desc: "User-device views, export manifests, redaction presets",
    category: "security",
    formats: ["PDF"],
    regulatory: true,
    icon: Lock,
    color: "from-indigo-500/12 to-violet-500/5 text-indigo-900 ring-indigo-500/25",
  },
];

const SCHEDULED: {
  id: string;
  name: string;
  cadence: string;
  nextRun: string;
  format: string;
  recipients: string;
}[] = [
  {
    id: "sch-1",
    name: "Joint Commission readiness",
    cadence: "Weekly · Monday 06:00",
    nextRun: "Apr 7, 2026 06:00",
    format: "PDF",
    recipients: "Quality · CE leadership",
  },
  {
    id: "sch-2",
    name: "Monthly executive summary",
    cadence: "Monthly · 1st 06:00",
    nextRun: "May 1, 2026 06:00",
    format: "PDF + XLSX",
    recipients: "C-suite distro",
  },
  {
    id: "sch-3",
    name: "Open alerts digest",
    cadence: "Daily · 07:30",
    nextRun: "Apr 4, 2026 07:30",
    format: "PDF",
    recipients: "On-call biomed",
  },
  {
    id: "sch-4",
    name: "Failed auth summary",
    cadence: "Weekly · Friday 17:00",
    nextRun: "Apr 4, 2026 17:00",
    format: "XLSX",
    recipients: "Security operations",
  },
];

const RUNS: {
  id: string;
  name: string;
  when: string;
  by: string;
  size: string;
  format: "PDF" | "XLSX";
  status: "success" | "failed";
}[] = [
  {
    id: "run-1",
    name: "Joint Commission readiness",
    when: "Apr 3, 2026 · 06:00",
    by: "Scheduled",
    size: "2.4 MB",
    format: "PDF",
    status: "success",
  },
  {
    id: "run-2",
    name: "Monthly executive summary",
    when: "Apr 1, 2026 · 06:00",
    by: "Scheduled",
    size: "1.1 MB",
    format: "PDF",
    status: "success",
  },
  {
    id: "run-3",
    name: "Device utilization (Q1)",
    when: "Mar 28, 2026 · 14:12",
    by: "M. Reyes",
    size: "890 KB",
    format: "XLSX",
    status: "success",
  },
  {
    id: "run-4",
    name: "PHI access review",
    when: "Mar 27, 2026 · 09:40",
    by: "Security",
    size: "456 KB",
    format: "PDF",
    status: "success",
  },
  {
    id: "run-5",
    name: "Fleet health export",
    when: "Mar 26, 2026 · 22:05",
    by: "api.service",
    size: "—",
    format: "XLSX",
    status: "failed",
  },
  {
    id: "run-6",
    name: "CMS equipment maintenance",
    when: "Mar 25, 2026 · 11:18",
    by: "C. Liu",
    size: "3.2 MB",
    format: "PDF",
    status: "success",
  },
];

const CATEGORY_LABEL: Record<ReportCategory | "all", string> = {
  all: "All",
  regulatory: "Regulatory",
  executive: "Executive",
  operations: "Operations",
  security: "Security",
};

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

export function ReportsView() {
  const c = sectionConfigs.reports;
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <ViewPage>
      <PageHeader
        icon={FileText}
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
            Download last packet
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/10 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300/90">
              Report builder
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
              Create board-ready packs in minutes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Pick a template, scope devices and date range, add PHI-safe
              redaction, then schedule PDF or Excel to leadership inboxes—or
              push to your document store.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-9 gap-2 rounded-xl bg-white font-semibold text-slate-900 hover:bg-slate-100"
                type="button"
              >
                <Wand2 className="h-4 w-4" aria-hidden />
                Start guided build
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/10"
                type="button"
              >
                <CalendarClock className="h-4 w-4" aria-hidden />
                Schedule recurring
              </Button>
            </div>
          </div>
          <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:w-[280px]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <Mail className="h-5 w-5 text-blue-300" aria-hidden />
              <p className="mt-2 text-xs font-semibold">Email delivery</p>
              <p className="text-[11px] text-slate-400">
                CSV, PDF, or link with expiring access.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-blue-300" aria-hidden />
              <p className="mt-2 text-xs font-semibold">Compliance mode</p>
              <p className="text-[11px] text-slate-400">
                Auto footnotes for JC and CMS packets.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/50"
          >
            <p className="text-[11px] font-medium uppercase text-slate-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              {s.value}
            </p>
            <p className="text-xs text-slate-500">{s.hint}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Report library
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {TEMPLATES.length} templates · filter by audience or search by
              keyword
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
              aria-label="Search report templates"
            />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["all", "regulatory", "executive", "operations", "security"] as const).map(
            (cat) => (
              <FilterPill
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}
              </FilterPill>
            )
          )}
        </div>
        {filteredTemplates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
            No templates match this filter.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                className={cn(
                  "flex flex-col rounded-xl border bg-gradient-to-br p-4 text-left shadow-sm ring-1 transition-shadow duration-200 hover:shadow-md",
                  t.color
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <t.icon className="h-8 w-8 shrink-0 opacity-80" />
                  <div className="flex flex-wrap justify-end gap-1">
                    {t.formats.map((f) => (
                      <Badge
                        key={f}
                        variant="outline"
                        className="border-white/40 bg-white/30 text-[9px] font-bold text-current"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold">{t.title}</p>
                <p className="mt-1 text-xs opacity-80">{t.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-semibold opacity-90"
                  >
                    {CATEGORY_LABEL[t.category]}
                  </Badge>
                  {t.regulatory ? (
                    <Badge
                      variant="warning"
                      className="text-[9px] font-semibold"
                    >
                      Regulatory
                    </Badge>
                  ) : null}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold">
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Generate
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <SectionCard className="overflow-hidden p-0">
        <div className="border-b border-slate-100 px-2 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Scheduled deliveries
              </h2>
              <p className="text-xs text-slate-500">
                Recurring jobs · next run in local hospital time
              </p>
            </div>
            <Badge variant="info" className="w-fit text-[10px] font-semibold">
              {SCHEDULED.length} active
            </Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-slate-500">
                Report
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Cadence
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Next run
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Format
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Recipients
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SCHEDULED.map((s) => (
              <TableRow key={s.id} className="border-slate-100">
                <TableCell className="font-medium text-slate-900">
                  {s.name}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {s.cadence}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-slate-600">
                  {s.nextRun}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {s.format}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] text-sm text-slate-500">
                  {s.recipients}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <SectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent runs</h2>
            <p className="text-xs text-slate-500">
              On-demand and scheduled outputs · demo retention window
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
            View all
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  Report
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Generated
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Source
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Format
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Size
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RUNS.map((r) => (
                <TableRow key={r.id} className="border-slate-100">
                  <TableCell className="font-medium text-slate-900">
                    {r.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {r.when}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {r.by}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {r.format}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.status === "success" ? (
                      <Badge variant="success" className="text-[10px] font-semibold">
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="text-[10px] font-semibold">
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{r.size}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                      type="button"
                      disabled={r.status === "failed"}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      Get
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </ViewPage>
  );
}
