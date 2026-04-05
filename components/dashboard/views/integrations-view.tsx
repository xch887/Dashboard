"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Puzzle,
  RefreshCw,
  Search,
  Link2,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type IntegrationStatus = "Healthy" | "Degraded" | "Paused" | "Disabled";

export type IntegrationCategory =
  | "hl7"
  | "cmms"
  | "data"
  | "alert"
  | "iam"
  | "other";

export type Connector = {
  id: string;
  name: string;
  vendor: string;
  status: IntegrationStatus;
  last: string;
  events: string;
  category: IntegrationCategory;
  env: "Production" | "Sandbox";
};

const CONNECTORS: Connector[] = [
  {
    id: "conn-epic-adt",
    name: "Epic · HL7 ADT",
    vendor: "Epic",
    status: "Healthy",
    last: "12s ago",
    events: "842/hr inbound",
    category: "hl7",
    env: "Production",
  },
  {
    id: "conn-cerner-fhir",
    name: "Oracle Health · FHIR R4",
    vendor: "Cerner",
    status: "Healthy",
    last: "28s ago",
    events: "126/hr",
    category: "hl7",
    env: "Production",
  },
  {
    id: "conn-mirth",
    name: "Mirth Connect · relay",
    vendor: "NextGen",
    status: "Healthy",
    last: "45s ago",
    events: "412/hr",
    category: "hl7",
    env: "Production",
  },
  {
    id: "conn-snow",
    name: "ServiceNow · CMMS",
    vendor: "ServiceNow",
    status: "Healthy",
    last: "2m ago",
    events: "44/hr sync",
    category: "cmms",
    env: "Production",
  },
  {
    id: "conn-ibm-maximo",
    name: "IBM Maximo · assets",
    vendor: "IBM",
    status: "Healthy",
    last: "4m ago",
    events: "12/hr",
    category: "cmms",
    env: "Sandbox",
  },
  {
    id: "conn-splunk",
    name: "Splunk · SIEM HEC",
    vendor: "Splunk",
    status: "Healthy",
    last: "2m ago",
    events: "1.8k/hr",
    category: "data",
    env: "Production",
  },
  {
    id: "conn-snowflake",
    name: "Snowflake · analytics share",
    vendor: "Snowflake",
    status: "Paused",
    last: "Policy hold",
    events: "—",
    category: "data",
    env: "Production",
  },
  {
    id: "conn-pd",
    name: "PagerDuty · incidents",
    vendor: "PagerDuty",
    status: "Healthy",
    last: "1m ago",
    events: "On-call v2",
    category: "alert",
    env: "Production",
  },
  {
    id: "conn-slack",
    name: "Slack · ops channel",
    vendor: "Slack",
    status: "Healthy",
    last: "45s ago",
    events: "Digest + critical",
    category: "alert",
    env: "Production",
  },
  {
    id: "conn-okta",
    name: "Okta · SCIM + SSO",
    vendor: "Okta",
    status: "Healthy",
    last: "3m ago",
    events: "Users & groups",
    category: "iam",
    env: "Production",
  },
  {
    id: "conn-workday",
    name: "Workday · org chart",
    vendor: "Workday",
    status: "Healthy",
    last: "1h ago",
    events: "Nightly delta",
    category: "other",
    env: "Production",
  },
];

type WebhookRow = {
  id: string;
  name: string;
  destination: string;
  signing: string;
  lastDelivery: string;
  fails24h: number;
  status: IntegrationStatus;
};

const WEBHOOKS: WebhookRow[] = [
  {
    id: "wh-dev-state",
    name: "device.state_changed",
    destination: "https://api.internal.regency.med/v1/hooks/devices",
    signing: "HMAC-SHA256",
    lastDelivery: "2s ago",
    fails24h: 0,
    status: "Healthy",
  },
  {
    id: "wh-alert",
    name: "alert.opened",
    destination: "https://hooks.slack.com/services/…/T9…",
    signing: "Slack signing secret",
    lastDelivery: "18s ago",
    fails24h: 0,
    status: "Healthy",
  },
  {
    id: "wh-wo",
    name: "work_order.closed",
    destination: "https://instance.service-now.com/api/now/…",
    signing: "OAuth 2.0 client",
    lastDelivery: "3m ago",
    fails24h: 0,
    status: "Healthy",
  },
  {
    id: "wh-audit",
    name: "audit.phi_access",
    destination: "https://http-inputs-…splunkcloud.com:443/services/collector",
    signing: "Splunk HEC token",
    lastDelivery: "12m ago",
    fails24h: 3,
    status: "Degraded",
  },
  {
    id: "wh-snowflake",
    name: "export.daily_snapshot",
    destination: "s3://regency-lakehouse/ingest/med-dash/…",
    signing: "STS assume-role",
    lastDelivery: "Paused",
    fails24h: 0,
    status: "Paused",
  },
];

const CATEGORY_LABEL: Record<IntegrationCategory | "all", string> = {
  all: "All",
  hl7: "HL7 / FHIR",
  cmms: "CMMS",
  data: "Data & SIEM",
  alert: "Alerting",
  iam: "IAM",
  other: "Other",
};

const statusStyle: Record<IntegrationStatus, string> = {
  Healthy: "bg-teal-500/10 text-teal-800 border-teal-500/20",
  Degraded: "bg-amber-500/10 text-amber-900 border-amber-500/20",
  Paused: "bg-slate-100 text-slate-600 border-slate-200",
  Disabled: "bg-rose-500/10 text-rose-800 border-rose-500/20",
};

type StatusFilter = "all" | IntegrationStatus;

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

export function IntegrationsView() {
  const c = sectionConfigs.integrations;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IntegrationCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONNECTORS.filter((x) => {
      if (category !== "all" && x.category !== category) return false;
      if (statusFilter !== "all" && x.status !== statusFilter) return false;
      if (!q) return true;
      return (
        x.name.toLowerCase().includes(q) ||
        x.vendor.toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q)
      );
    });
  }, [query, category, statusFilter]);

  const healthyCount = CONNECTORS.filter((x) => x.status === "Healthy").length;

  return (
    <ViewPage>
      <PageHeader
        icon={Puzzle}
        title={c.title}
        description={c.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg text-xs font-semibold"
              type="button"
            >
              View logs
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800"
              type="button"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add connector
            </Button>
          </div>
        }
      />

      <div
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 ring-1 ring-slate-200/50 sm:flex-row sm:items-center"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-800">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Signed webhooks · OAuth scopes · replay IDs
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Outbound events include <code className="rounded bg-white/80 px-1 py-px text-[11px]">X-Request-Id</code>{" "}
            for cross-system trace. Rotate secrets from each connector&apos;s
            security tab — audit log records every change.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/50"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              {s.value}
            </p>
            {s.hint ? (
              <p className="text-xs text-slate-500">{s.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Connectors</h2>
            <p className="text-xs text-slate-500">
              {CONNECTORS.length} configured · {healthyCount} healthy in demo
              set
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, vendor, or ID…"
              className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
              aria-label="Search connectors"
            />
          </div>
        </div>
        <div className="mb-3 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Category
          </p>
          <div className="flex flex-wrap gap-1">
            {(
              [
                "all",
                "hl7",
                "cmms",
                "data",
                "alert",
                "iam",
                "other",
              ] as const
            ).map((cat) => (
              <FilterPill
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABEL[cat]}
              </FilterPill>
            ))}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Status
          </span>
          {(
            [
              "all",
              "Healthy",
              "Degraded",
              "Paused",
            ] as const
          ).map((st) => (
            <FilterPill
              key={st}
              active={statusFilter === st}
              onClick={() => setStatusFilter(st)}
            >
              {st === "all" ? "All statuses" : st}
            </FilterPill>
          ))}
        </div>
        <p className="mb-3 text-[11px] text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
          connector
          {filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-500">
            No connectors match these filters.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((int) => (
              <li
                key={int.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/40 sm:flex-row sm:items-center"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-sm font-bold text-slate-500">
                  {int.vendor.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {int.name}
                    </p>
                    <Badge variant="outline" className="text-[9px] font-semibold">
                      {CATEGORY_LABEL[int.category]}
                    </Badge>
                    <Badge
                      variant={int.env === "Production" ? "info" : "neutral"}
                      className="text-[9px] font-semibold"
                    >
                      {int.env}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{int.vendor}</p>
                  <p className="mt-1 font-mono text-[10px] text-slate-400">
                    {int.id}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      statusStyle[int.status]
                    )}
                  >
                    {int.status}
                  </Badge>
                  <span className="text-xs tabular-nums text-slate-500">
                    {int.last}
                  </span>
                  <span className="text-xs text-slate-400">{int.events}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                    type="button"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" aria-hidden />
                    Test
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-blue-600" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Outbound webhooks
              </h2>
              <p className="text-xs text-slate-500">
                Monitored deliveries · failures roll into retry queue
              </p>
            </div>
          </div>
          <Badge variant="neutral" className="w-fit text-[10px] font-semibold">
            {WEBHOOKS.length} endpoints
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  Event
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Destination
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Signing
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Last OK
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Fails 24h
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WEBHOOKS.map((w) => (
                <TableRow key={w.id} className="border-slate-100">
                  <TableCell className="font-mono text-xs font-semibold text-slate-800">
                    {w.name}
                  </TableCell>
                  <TableCell className="max-w-[min(280px,40vw)] truncate text-xs text-slate-600">
                    {w.destination}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {w.signing}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs tabular-nums text-slate-600">
                    {w.lastDelivery}
                  </TableCell>
                  <TableCell className="tabular-nums text-xs text-slate-600">
                    {w.fails24h}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        statusStyle[w.status]
                      )}
                    >
                      {w.status}
                    </Badge>
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
