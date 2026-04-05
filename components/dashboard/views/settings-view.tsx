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
  Settings,
  Search,
  Server,
  Palette,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

type SettingGroup = {
  title: string;
  description: string;
  fields: (
    | { key: string; label: string; value: string; type: "text" }
    | { key: string; label: string; value: boolean; type: "toggle" }
  )[];
};

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Organization",
    description: "Name, timezone, and default locale for reports.",
    fields: [
      {
        key: "displayName",
        label: "Display name",
        value: "Regency Medical",
        type: "text",
      },
      {
        key: "timezone",
        label: "Default timezone",
        value: "America/New_York",
        type: "text",
      },
      {
        key: "locale",
        label: "Locale",
        value: "en-US",
        type: "text",
      },
    ],
  },
  {
    title: "Security",
    description: "Sessions, MFA, and API access policies.",
    fields: [
      {
        key: "sessionTtl",
        label: "Session timeout",
        value: "30 minutes",
        type: "text",
      },
      { key: "enforceMfa", label: "Enforce MFA", value: true, type: "toggle" },
      { key: "ipAllowlist", label: "IP allowlist", value: false, type: "toggle" },
      {
        key: "breakGlass",
        label: "Break-glass TTL",
        value: "4 hours",
        type: "text",
      },
    ],
  },
  {
    title: "Data & retention",
    description: "Where audit and device telemetry are stored.",
    fields: [
      {
        key: "region",
        label: "Primary region",
        value: "US-East (Virginia)",
        type: "text",
      },
      {
        key: "telemetryRetention",
        label: "Telemetry retention",
        value: "400 days",
        type: "text",
      },
      {
        key: "auditRetention",
        label: "Audit retention",
        value: "7 years (WORM)",
        type: "text",
      },
      {
        key: "exportPhiLogs",
        label: "Export PHI in logs",
        value: false,
        type: "toggle",
      },
    ],
  },
];

export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  tier: "beta" | "ga";
  defaultOn: boolean;
};

const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: "ai_assistant",
    label: "AI assistant drawer",
    description: "Contextual help and fleet Q&A in the shell",
    tier: "beta",
    defaultOn: true,
  },
  {
    key: "predictive_pm",
    label: "Predictive PM hints",
    description: "Surfaces model scores on maintenance views",
    tier: "beta",
    defaultOn: true,
  },
  {
    key: "fleet_bulk_ota",
    label: "Fleet bulk OTA",
    description: "Staged firmware pushes with rollback",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "phi_safe_exports",
    label: "PHI-safe export defaults",
    description: "Redact identifiers on CSV/PDF unless elevated",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "calendar_ics",
    label: "Calendar ICS subscribe",
    description: "Personal feeds for PM and vendor holds",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "vendor_sso",
    label: "Vendor SSO portals",
    description: "Time-boxed OEM login to work orders",
    tier: "beta",
    defaultOn: false,
  },
  {
    key: "scim_groups",
    label: "SCIM group push",
    description: "Mirror IdP groups to MediSync+ roles",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "audit_siem",
    label: "Audit SIEM stream",
    description: "Forward redacted security events",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "mobile_offline",
    label: "Mobile offline checklists",
    description: "Technician mode without continuous connectivity",
    tier: "beta",
    defaultOn: true,
  },
  {
    key: "ble_room_lock",
    label: "BLE room lock",
    description: "Bind telemetry coordinates to room polygons",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "jc_packet_builder",
    label: "Joint Commission packet",
    description: "Regulatory report template in Reports",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "sandbox_connectors",
    label: "Sandbox connectors",
    description: "Duplicate integration endpoints for UAT",
    tier: "beta",
    defaultOn: true,
  },
  {
    key: "branded_executive_pdf",
    label: "Branded executive PDF",
    description: "Logo and color tokens on monthly summary",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "strict_rate_limits",
    label: "Strict API rate limits",
    description: "Lower caps for unauthenticated routes",
    tier: "ga",
    defaultOn: false,
  },
  {
    key: "baa_mode",
    label: "HIPAA BAA mode",
    description: "Extra logging and DPA footers site-wide",
    tier: "ga",
    defaultOn: true,
  },
  {
    key: "device_shadow",
    label: "Device shadow twin",
    description: "Cached last-known config for edge devices",
    tier: "beta",
    defaultOn: false,
  },
  {
    key: "voice_dispatch",
    label: "Voice dispatch hooks",
    description: "Read-aloud critical alerts on supported clients",
    tier: "beta",
    defaultOn: false,
  },
  {
    key: "graphql_public",
    label: "GraphQL read API",
    description: "Partner query surface (scoped)",
    tier: "beta",
    defaultOn: false,
  },
];

const API_LIMITS = [
  { name: "REST · default tenant", rpm: "1,200", burst: "80" },
  { name: "Webhooks · outbound", rpm: "600", burst: "40" },
  { name: "HL7 · ADT ingress", rpm: "N/A", burst: "50 conn" },
  { name: "Assistant · completions", rpm: "60", burst: "10" },
];

type FlagFilter = "all" | "beta" | "ga" | "on" | "off";

function initToggleState(): Record<string, boolean> {
  const s: Record<string, boolean> = {};
  SETTING_GROUPS.forEach((g) => {
    g.fields.forEach((f) => {
      if (f.type === "toggle") s[f.key] = f.value;
    });
  });
  return s;
}

function initFlagState(): Record<string, boolean> {
  const s: Record<string, boolean> = {};
  FEATURE_FLAGS.forEach((f) => {
    s[f.key] = f.defaultOn;
  });
  return s;
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

function ToggleSwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none",
        checked ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function SettingsView() {
  const c = sectionConfigs.settings;
  const [toggles, setToggles] = useState(initToggleState);
  const [flagOn, setFlagOn] = useState(initFlagState);
  const [flagQuery, setFlagQuery] = useState("");
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");

  const betaCount = FEATURE_FLAGS.filter((f) => f.tier === "beta").length;

  const filteredFlags = useMemo(() => {
    const q = flagQuery.trim().toLowerCase();
    return FEATURE_FLAGS.filter((f) => {
      if (flagFilter === "beta" && f.tier !== "beta") return false;
      if (flagFilter === "ga" && f.tier !== "ga") return false;
      if (flagFilter === "on" && !flagOn[f.key]) return false;
      if (flagFilter === "off" && flagOn[f.key]) return false;
      if (!q) return true;
      return (
        f.key.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      );
    });
  }, [flagQuery, flagFilter, flagOn]);

  return (
    <ViewPage>
      <PageHeader
        icon={Settings}
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
              View change audit
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              type="button"
              disabled
            >
              Save changes
            </Button>
          </div>
        }
      />

      <div
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 ring-1 ring-slate-200/50 sm:flex-row sm:items-center"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-800">
          <Server className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Production</span> in{" "}
          <span className="font-mono text-xs">us-east-1</span> — PHI stays in
          US regions. Changes below are{" "}
          <span className="font-semibold">demo-only</span> and do not persist.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/50"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-600/[0.07] to-white p-5 shadow-sm ring-1 ring-slate-200/50">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-blue-700" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Applied to PDF exports, login screen, and email footers.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">
              LOGO
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Primary
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="size-8 rounded-lg border border-slate-200 shadow-sm"
                  style={{ backgroundColor: "#1d4ed8" }}
                  title="#1d4ed8"
                />
                <span className="font-mono text-xs text-slate-600">
                  #1d4ed8
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Accent
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="size-8 rounded-lg border border-slate-200 shadow-sm"
                  style={{ backgroundColor: "#0ea5e9" }}
                  title="#0ea5e9"
                />
                <span className="font-mono text-xs text-slate-600">
                  #0ea5e9
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm ring-1 ring-slate-200/50">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-600" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-900">API limits</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Per-tenant rolling windows (demo values).
          </p>
          <ul className="mt-3 space-y-2">
            {API_LIMITS.map((row) => (
              <li
                key={row.name}
                className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <p className="text-[11px] font-semibold text-slate-800">
                  {row.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {row.rpm} rpm · burst {row.burst}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Feature flags
              </h2>
              <p className="text-xs text-slate-500">
                {FEATURE_FLAGS.length} flags · {betaCount} in beta channel
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={flagQuery}
                onChange={(e) => setFlagQuery(e.target.value)}
                placeholder="Search key or description…"
                className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
                aria-label="Search feature flags"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                "all",
                "beta",
                "ga",
                "on",
                "off",
              ] as const
            ).map((f) => (
              <FilterPill
                key={f}
                active={flagFilter === f}
                onClick={() => setFlagFilter(f)}
              >
                {f === "all"
                  ? `All (${FEATURE_FLAGS.length})`
                  : f === "beta"
                    ? `Beta (${betaCount})`
                    : f === "ga"
                      ? `GA (${FEATURE_FLAGS.length - betaCount})`
                      : f === "on"
                        ? "Enabled"
                        : "Disabled"}
              </FilterPill>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  Key
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Flag
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Channel
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500">
                  Enabled
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlags.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No flags match this filter.
                  </TableCell>
                </TableRow>
              ) : null}
              {filteredFlags.map((f) => (
                <TableRow key={f.key} className="border-slate-100">
                  <TableCell className="font-mono text-xs text-slate-500">
                    {f.key}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-900">
                      {f.label}
                    </p>
                    <p className="text-xs text-slate-500">{f.description}</p>
                  </TableCell>
                  <TableCell>
                    {f.tier === "beta" ? (
                      <Badge
                        variant="warning"
                        className="text-[10px] font-bold"
                      >
                        Beta
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] font-semibold">
                        GA
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ToggleSwitch
                      id={`flag-${f.key}`}
                      checked={flagOn[f.key] ?? false}
                      onChange={(v) =>
                        setFlagOn((prev) => ({ ...prev, [f.key]: v }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <div className="space-y-6">
        {SETTING_GROUPS.map((g) => (
          <SectionCard as="section" key={g.title}>
            <h2 className="text-sm font-semibold text-slate-900">{g.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{g.description}</p>
            <ul className="mt-4 space-y-4">
              {g.fields.map((f) => (
                <li
                  key={f.key}
                  className="flex flex-col gap-2 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {f.label}
                  </span>
                  {f.type === "toggle" ? (
                    <ToggleSwitch
                      id={`set-${f.key}`}
                      checked={toggles[f.key] ?? false}
                      onChange={(v) =>
                        setToggles((prev) => ({ ...prev, [f.key]: v }))
                      }
                    />
                  ) : (
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-sm text-slate-700">
                      {f.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Demo controls — toggles update local UI only; nothing is persisted.
      </p>
    </ViewPage>
  );
}
