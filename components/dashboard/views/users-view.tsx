"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Mail,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  mfa: boolean;
  last: string;
};

const ALL_USERS: DirectoryUser[] = [
  {
    id: "usr-01",
    name: "Morgan Reyes",
    email: "morgan.reyes@regency.med",
    department: "Administration",
    role: "Hospital admin",
    mfa: true,
    last: "Active now",
  },
  {
    id: "usr-02",
    name: "Alex Morgan",
    email: "a.morgan@regency.med",
    department: "Clinical Engineering",
    role: "Senior biomed",
    mfa: true,
    last: "2h ago",
  },
  {
    id: "usr-03",
    name: "Jordan Patel",
    email: "j.patel@regency.med",
    department: "Healthcare IT",
    role: "Integration engineer",
    mfa: true,
    last: "Yesterday",
  },
  {
    id: "usr-04",
    name: "Casey Liu",
    email: "c.liu@regency.med",
    department: "Biomedical Engineering",
    role: "BMET II",
    mfa: false,
    last: "3d ago",
  },
  {
    id: "usr-05",
    name: "Devon Wright",
    email: "d.wright@regency.med",
    department: "Clinical Engineering",
    role: "Imaging specialist",
    mfa: true,
    last: "4h ago",
  },
  {
    id: "usr-06",
    name: "Chris Reynolds",
    email: "c.reynolds@regency.med",
    department: "Device Operations",
    role: "Fleet coordinator",
    mfa: true,
    last: "1h ago",
  },
  {
    id: "usr-07",
    name: "Morgan Ellis",
    email: "m.ellis@regency.med",
    department: "Security",
    role: "IAM analyst",
    mfa: true,
    last: "30m ago",
  },
  {
    id: "usr-08",
    name: "Riley Chen",
    email: "r.chen@regency.med",
    department: "Radiology",
    role: "Modality manager",
    mfa: false,
    last: "5d ago",
  },
  {
    id: "usr-09",
    name: "Sam Ortiz",
    email: "s.ortiz@regency.med",
    department: "ICU",
    role: "Charge nurse",
    mfa: true,
    last: "6h ago",
  },
  {
    id: "usr-10",
    name: "Taylor Kim",
    email: "t.kim@regency.med",
    department: "Facilities",
    role: "Zone supervisor",
    mfa: false,
    last: "2d ago",
  },
  {
    id: "usr-11",
    name: "Jamie Fox",
    email: "j.fox@regency.med",
    department: "Nephrology",
    role: "Clinical educator",
    mfa: true,
    last: "1d ago",
  },
  {
    id: "usr-12",
    name: "Quinn Harper",
    email: "q.harper@regency.med",
    department: "Healthcare IT",
    role: "Service desk lead",
    mfa: true,
    last: "45m ago",
  },
  {
    id: "usr-13",
    name: "Avery Blake",
    email: "a.blake@regency.med",
    department: "Imaging",
    role: "PACS admin",
    mfa: true,
    last: "3h ago",
  },
  {
    id: "usr-14",
    name: "Reese Park",
    email: "r.park@regency.med",
    department: "Clinical Engineering",
    role: "BMET I",
    mfa: false,
    last: "1w ago",
  },
  {
    id: "usr-15",
    name: "Dakota Singh",
    email: "d.singh@regency.med",
    department: "Compliance",
    role: "Quality specialist",
    mfa: true,
    last: "12h ago",
  },
  {
    id: "usr-16",
    name: "Skyler Moss",
    email: "s.moss@regency.med",
    department: "ER",
    role: "Nurse manager",
    mfa: true,
    last: "20m ago",
  },
  {
    id: "usr-17",
    name: "Rowan Vega",
    email: "r.vega@regency.med",
    department: "Procurement",
    role: "Contract analyst",
    mfa: false,
    last: "4d ago",
  },
  {
    id: "usr-18",
    name: "Emerson Lake",
    email: "e.lake@regency.med",
    department: "Biomedical Engineering",
    role: "BMET III",
    mfa: true,
    last: "8h ago",
  },
  {
    id: "usr-19",
    name: "Priya Shah",
    email: "p.shah@regency.med",
    department: "Clinical Engineering",
    role: "BMET II",
    mfa: true,
    last: "50m ago",
  },
];

const PENDING_INVITES = [
  {
    id: "inv-1",
    email: "n.garcia@regency.med",
    role: "BMET I · Clinical Engineering",
    sent: "Apr 2, 2026",
    expires: "Apr 9, 2026",
  },
  {
    id: "inv-2",
    email: "l.nguyen@regency.med",
    role: "Read-only · Radiology",
    sent: "Apr 1, 2026",
    expires: "Apr 8, 2026",
  },
  {
    id: "inv-3",
    email: "vendor-audit@partner.com",
    role: "Time-boxed auditor",
    sent: "Mar 31, 2026",
    expires: "Apr 7, 2026",
  },
];

/** RBAC blurbs for roles that appear in the directory (demo). */
const ROLE_SCOPE_HINT: Partial<Record<string, string>> = {
  "Hospital admin": "Tenant config, users, integrations, billing",
  "Senior biomed": "Fleet, WOs, PM, alerts — all sites",
  "Integration engineer": "HL7/API, device feeds, sandbox",
  "BMET II": "Assigned departments, work orders, fleet read",
  "BMET I": "Work orders, limited config",
  "BMET III": "Fleet + capital + vendor PM coordination",
  "Imaging specialist": "Modality assets, vendor blocks, DICOM context",
  "Fleet coordinator": "Roster, bulk actions, dispatch views",
  "IAM analyst": "Roles, SCIM, access reviews, audit",
  "Modality manager": "Imaging units, utilization reports",
  "Charge nurse": "Bedside devices, alerts — unit scope",
  "Zone supervisor": "Facilities-linked assets, work requests",
  "Clinical educator": "Training mode, read-mostly fleet",
  "Service desk lead": "Tickets bridge, password resets (IdP)",
  "PACS admin": "Imaging interfaces, PHI-adjacent views",
  "Quality specialist": "Compliance reports, read audit samples",
  "Nurse manager": "Department dashboards, escalation",
  "Contract analyst": "Vendor records, no clinical write",
};

const PAGE_SIZE = 10;

type MfaFilter = "all" | "on" | "off";

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

export function UsersView() {
  const c = sectionConfigs.users;
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("All");
  const [mfaFilter, setMfaFilter] = useState<MfaFilter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const departments = useMemo(() => {
    const u = new Set(ALL_USERS.map((x) => x.department));
    return ["All", ...Array.from(u).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_USERS.filter((u) => {
      if (dept !== "All" && u.department !== dept) return false;
      if (mfaFilter === "on" && !u.mfa) return false;
      if (mfaFilter === "off" && u.mfa) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [query, dept, mfaFilter]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, dept, mfaFilter]);

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  const remaining = Math.max(0, filtered.length - visible);

  const mfaOffCount = ALL_USERS.filter((u) => !u.mfa).length;

  const roleSummary = useMemo(() => {
    const m = new Map<string, number>();
    ALL_USERS.forEach((u) => m.set(u.role, (m.get(u.role) ?? 0) + 1));
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, []);

  return (
    <ViewPage>
      <PageHeader
        icon={Users}
        title={c.title}
        description={c.description}
        actions={
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_99_235/0.5)] hover:bg-blue-800"
            type="button"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden />
            Invite user
          </Button>
        }
      />

      <SectionCard
        className="flex flex-col gap-3 bg-slate-50/80 sm:flex-row sm:items-center"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <KeyRound className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            SSO · SCIM · enforced MFA
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Directory syncs from Okta. Custom roles map to RBAC scopes; break-glass
            elevations expire in 4h and are fully audited.
          </p>
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {c.stats.map((s) => (
          <SectionCard key={s.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
              {s.value}
            </p>
            {s.hint ? (
              <p className="mt-0.5 text-xs text-slate-500">{s.hint}</p>
            ) : null}
          </SectionCard>
        ))}
      </div>

      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            RBAC · top roles in directory
          </h2>
          <Badge variant="neutral" className="w-fit text-[10px] font-medium">
            Demo slice · {ALL_USERS.length} users
          </Badge>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {roleSummary.map(([roleName, count]) => (
            <li
              key={roleName}
              className="rounded-xl border border-slate-200/80 bg-white/85 p-3 shadow-sm ring-1 ring-slate-200/40"
            >
              <div className="flex items-start justify-between gap-2">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                  aria-hidden
                />
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {count}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-900">
                {roleName}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {ROLE_SCOPE_HINT[roleName] ??
                  "Workspace access per org policy template"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/15">
        <div className="flex items-center gap-2 border-b border-amber-200/40 px-4 py-3">
          <Mail className="h-4 w-4 text-amber-800" aria-hidden />
          <h2 className="text-sm font-semibold text-amber-950">
            Pending invites ({PENDING_INVITES.length})
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-amber-200/30 hover:bg-transparent bg-amber-50/50">
              <TableHead className="text-xs font-semibold text-amber-900/80">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-amber-900/80">
                Proposed access
              </TableHead>
              <TableHead className="text-xs font-semibold text-amber-900/80">
                Sent
              </TableHead>
              <TableHead className="text-xs font-semibold text-amber-900/80">
                Expires
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PENDING_INVITES.map((inv) => (
              <TableRow key={inv.id} className="border-amber-200/30">
                <TableCell className="font-mono text-xs text-amber-950">
                  {inv.email}
                </TableCell>
                <TableCell className="text-sm text-amber-950/90">
                  {inv.role}
                </TableCell>
                <TableCell className="text-sm text-amber-900/80">
                  {inv.sent}
                </TableCell>
                <TableCell className="text-sm text-amber-900/80">
                  {inv.expires}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, department, or role…"
              className="h-10 rounded-xl border-slate-200 pl-9"
              aria-label="Search directory"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Department
            </p>
            <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto sm:max-h-none">
              {departments.map((d) => (
                <FilterPill
                  key={d}
                  active={dept === d}
                  onClick={() => setDept(d)}
                >
                  {d === "All" ? `All (${ALL_USERS.length})` : d}
                </FilterPill>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              MFA
            </span>
            <FilterPill
              active={mfaFilter === "all"}
              onClick={() => setMfaFilter("all")}
            >
              All
            </FilterPill>
            <FilterPill
              active={mfaFilter === "on"}
              onClick={() => setMfaFilter("on")}
            >
              Enrolled
            </FilterPill>
            <FilterPill
              active={mfaFilter === "off"}
              onClick={() => setMfaFilter("off")}
            >
              Missing ({mfaOffCount})
            </FilterPill>
          </div>
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">{shown.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}
            matching ·{" "}
            <span className="font-semibold text-slate-800">
              {ALL_USERS.length}
            </span>{" "}
            total in demo directory
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/40 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Department
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  MFA
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Last active
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.length === 0 ? (
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No users match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
              {shown.map((r) => (
                <TableRow key={r.id} className="border-slate-100">
                  <TableCell className="font-medium text-slate-900">
                    {r.name}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {r.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium"
                    >
                      {r.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {r.role}
                  </TableCell>
                  <TableCell>
                    {r.mfa ? (
                      <Badge
                        variant="success"
                        className="text-[10px] font-semibold"
                      >
                        Enrolled
                      </Badge>
                    ) : (
                      <Badge
                        variant="danger"
                        className="text-[10px] font-semibold"
                      >
                        Required
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {r.last}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {remaining > 0 ? (
          <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-3 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() =>
                setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))
              }
            >
              View {Math.min(remaining, PAGE_SIZE)} more
            </Button>
          </div>
        ) : null}
      </SectionCard>
    </ViewPage>
  );
}
