"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { sectionConfigs } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";
import {
  ScrollText,
  Search,
  Download,
  Shield,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AuditAction =
  | "VIEW"
  | "CONFIG_CHANGE"
  | "EXPORT"
  | "LOGIN"
  | "LOGIN_FAILED"
  | "UPDATE"
  | "DELETE"
  | "ROLE_ASSIGN"
  | "PRINT"
  | "DOWNLOAD"
  | "API_ACCESS";

export type AuditEvent = {
  id: string;
  ts: string;
  actor: string;
  action: AuditAction;
  resource: string;
  phi: boolean;
  outcome?: "success" | "failure";
  correlationId: string;
};

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt-9c2f1a",
    ts: "2026-04-03 14:22:01",
    actor: "morgan.reyes",
    action: "VIEW",
    resource: "Patient device context · DEV-2041 · ICU",
    phi: true,
    outcome: "success",
    correlationId: "corr-77aa9012",
  },
  {
    id: "evt-9c2e88",
    ts: "2026-04-03 14:18:44",
    actor: "system",
    action: "CONFIG_CHANGE",
    resource: "Integration · HL7 ADT endpoint · prod-east",
    phi: false,
    outcome: "success",
    correlationId: "corr-system-441",
  },
  {
    id: "evt-9c2d10",
    ts: "2026-04-03 14:05:12",
    actor: "j.patel",
    action: "EXPORT",
    resource: "Work order packet · WO-44790 (PDF)",
    phi: true,
    outcome: "success",
    correlationId: "corr-export-8821",
  },
  {
    id: "evt-9c2b9c",
    ts: "2026-04-03 13:51:03",
    actor: "c.liu",
    action: "LOGIN",
    resource: "SSO · Okta · SAML",
    phi: false,
    outcome: "success",
    correlationId: "corr-auth-aa01",
  },
  {
    id: "evt-9c2a40",
    ts: "2026-04-03 13:48:22",
    actor: "unknown",
    action: "LOGIN_FAILED",
    resource: "SSO · Okta · IP 10.44.12.88",
    phi: false,
    outcome: "failure",
    correlationId: "corr-auth-fail-903",
  },
  {
    id: "evt-9c28f1",
    ts: "2026-04-03 13:40:19",
    actor: "a.morgan",
    action: "UPDATE",
    resource: "Maintenance record · PM-8821 · signed closeout",
    phi: false,
    outcome: "success",
    correlationId: "corr-pm-2210",
  },
  {
    id: "evt-9c2766",
    ts: "2026-04-03 13:22:08",
    actor: "s.rivera",
    action: "VIEW",
    resource: "Lab interface queue · DEV-6120 · no PHI payload",
    phi: false,
    outcome: "success",
    correlationId: "corr-view-lab-12",
  },
  {
    id: "evt-9c25dd",
    ts: "2026-04-03 12:58:41",
    actor: "p.shah",
    action: "ROLE_ASSIGN",
    resource: "RBAC · Biomed tier-2 · j.lee",
    phi: false,
    outcome: "success",
    correlationId: "corr-rbac-771",
  },
  {
    id: "evt-9c2440",
    ts: "2026-04-03 12:41:15",
    actor: "d.wright",
    action: "PRINT",
    resource: "Device service history · DEV-1088 · imaging",
    phi: true,
    outcome: "success",
    correlationId: "corr-print-334",
  },
  {
    id: "evt-9c22b8",
    ts: "2026-04-03 12:09:33",
    actor: "api.service",
    action: "API_ACCESS",
    resource: "REST /v1/devices · scope:read:fleet",
    phi: false,
    outcome: "success",
    correlationId: "corr-api-9ff12",
  },
  {
    id: "evt-9c2102",
    ts: "2026-04-03 11:55:00",
    actor: "unknown",
    action: "LOGIN_FAILED",
    resource: "Local fallback · kiosk-west · 5 failures",
    phi: false,
    outcome: "failure",
    correlationId: "corr-lockout-204",
  },
  {
    id: "evt-9c1f8e",
    ts: "2026-04-03 11:31:27",
    actor: "c.okonkwo",
    action: "DOWNLOAD",
    resource: "Audit sample · PHI redacted CSV · legal hold LH-992",
    phi: true,
    outcome: "success",
    correlationId: "corr-legal-88",
  },
  {
    id: "evt-9c1e04",
    ts: "2026-04-03 10:44:52",
    actor: "system",
    action: "CONFIG_CHANGE",
    resource: "Retention policy · audit index · 7yr confirm",
    phi: false,
    outcome: "success",
    correlationId: "corr-ret-01",
  },
  {
    id: "evt-9c1c90",
    ts: "2026-04-03 10:12:18",
    actor: "j.patel",
    action: "DELETE",
    resource: "Stale draft WO · WO-DRAFT-9912 · soft-delete",
    phi: false,
    outcome: "success",
    correlationId: "corr-del-wo-9912",
  },
];

const actionStyles: Partial<Record<AuditAction, string>> = {
  VIEW: "bg-sky-500/12 text-sky-900 border-sky-500/25",
  CONFIG_CHANGE: "bg-violet-500/12 text-violet-900 border-violet-500/25",
  EXPORT: "bg-amber-500/12 text-amber-950 border-amber-500/25",
  DOWNLOAD: "bg-amber-500/12 text-amber-950 border-amber-500/25",
  LOGIN: "bg-emerald-500/12 text-emerald-900 border-emerald-500/25",
  LOGIN_FAILED: "bg-rose-500/12 text-rose-900 border-rose-500/30",
  UPDATE: "bg-blue-500/12 text-blue-900 border-blue-500/25",
  DELETE: "bg-rose-500/10 text-rose-800 border-rose-500/20",
  ROLE_ASSIGN: "bg-indigo-500/12 text-indigo-900 border-indigo-500/25",
  PRINT: "bg-slate-500/12 text-slate-800 border-slate-500/20",
  API_ACCESS: "bg-cyan-500/12 text-cyan-900 border-cyan-500/25",
};

type QuickFilter = "all" | "phi" | "auth_fail" | "config";

function isAuthFailure(e: AuditEvent) {
  return e.action === "LOGIN_FAILED" || e.outcome === "failure";
}

function isConfigish(e: AuditEvent) {
  return (
    e.action === "CONFIG_CHANGE" ||
    e.action === "ROLE_ASSIGN" ||
    e.action === "DELETE"
  );
}

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

export function AuditLogView() {
  const c = sectionConfigs["audit-log"];
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<QuickFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter((e) => {
      if (quick === "phi" && !e.phi) return false;
      if (quick === "auth_fail" && !isAuthFailure(e)) return false;
      if (quick === "config" && !isConfigish(e)) return false;
      if (!q) return true;
      return (
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.correlationId.toLowerCase().includes(q)
      );
    });
  }, [query, quick]);

  const phiCount = AUDIT_EVENTS.filter((e) => e.phi).length;
  const failCount = AUDIT_EVENTS.filter((e) => isAuthFailure(e)).length;

  return (
    <ViewPage>
      <PageHeader
        icon={ScrollText}
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
            Export slice
          </Button>
        }
      />

      <div
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 ring-1 ring-slate-200/40 sm:flex-row sm:items-start"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <Lock className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-emerald-600" aria-hidden />
            Immutable event store
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Records are append-only with nightly hash chaining (00:00 UTC).
            Tamper detection alerts to Security; retention per policy below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">
              {s.value}
            </p>
            {s.hint ? (
              <p className="mt-0.5 text-[11px] text-slate-500">{s.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200/55 bg-white shadow-[0_10px_36px_-12px_rgb(15_23_42/0.1)]">
        <div className="flex flex-col gap-3 border-b border-slate-100/90 bg-slate-50/40 px-5 py-3.5">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <div>
              <h2 className="text-[15px] font-bold leading-tight tracking-tight text-slate-950">
                Audit events
              </h2>
              <p className="text-[11px] leading-snug text-slate-500">
                Search and quick-filter the demo append-only window
              </p>
            </div>
            <p className="shrink-0 text-[11px] font-medium tabular-nums text-slate-500">
              Showing {filtered.length} of {AUDIT_EVENTS.length}
            </p>
          </div>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action, resource, event or correlation ID…"
              className="h-10 rounded-lg border-slate-200/90 bg-white pl-9 text-sm"
              aria-label="Search audit events"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Quick filter
              </span>
              <FilterPill
                active={quick === "all"}
                onClick={() => setQuick("all")}
              >
                All ({AUDIT_EVENTS.length})
              </FilterPill>
              <FilterPill active={quick === "phi"} onClick={() => setQuick("phi")}>
                PHI ({phiCount})
              </FilterPill>
              <FilterPill
                active={quick === "auth_fail"}
                onClick={() => setQuick("auth_fail")}
              >
                Failed auth ({failCount})
              </FilterPill>
              <FilterPill
                active={quick === "config"}
                onClick={() => setQuick("config")}
              >
                Config &amp; admin
              </FilterPill>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/25 hover:bg-transparent">
              <TableHead className="h-9 whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Timestamp (UTC)
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Event ID
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Actor
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Action
              </TableHead>
              <TableHead className="h-9 min-w-[200px] px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Resource
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                PHI
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Outcome
              </TableHead>
              <TableHead className="h-9 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Correlation
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableCell
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-600"
                >
                  No events match your search or filters.
                </TableCell>
              </TableRow>
            ) : null}
            {filtered.map((e) => (
              <TableRow
                key={e.id}
                className={cn(
                  "group border-slate-100 transition-[background-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
                  "hover:bg-blue-500/[0.04] hover:shadow-[inset_0_0_0_1px_rgb(37_99_235/0.08)]"
                )}
              >
                <TableCell className="whitespace-nowrap px-3 py-2.5 text-sm tabular-nums text-slate-600">
                  {e.ts}
                </TableCell>
                <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-500">
                  {e.id}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-sm font-medium text-slate-900">
                  {e.actor}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px] font-semibold",
                      actionStyles[e.action] ??
                        "border-slate-200 bg-slate-50 text-slate-700"
                    )}
                  >
                    {e.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[min(360px,55vw)] whitespace-normal px-3 py-2.5 text-sm leading-snug text-slate-600">
                  {e.resource}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  {e.phi ? (
                    <Badge variant="danger" className="text-[10px] font-bold">
                      PHI
                    </Badge>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  {e.outcome === "failure" ? (
                    <Badge
                      variant="destructive"
                      className="text-[10px] font-semibold"
                    >
                      Failure
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] font-semibold">
                      Success
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5 font-mono text-xs text-slate-500">
                  {e.correlationId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ViewPage>
  );
}
