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
  Building2,
  Search,
  FileText,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type VendorRow = {
  id: string;
  name: string;
  category: string;
  contractEndLabel: string;
  contractEndSort: string;
  expiringSoon: boolean;
  openPOs: number;
  csat: number;
  contact: string;
  contactRole: string;
};

const VENDORS: VendorRow[] = [
  {
    id: "vnd-siemens",
    name: "Siemens Healthineers",
    category: "Imaging OEM",
    contractEndLabel: "Aug 14, 2027",
    contractEndSort: "2027-08-14",
    expiringSoon: false,
    openPOs: 2,
    csat: 4.7,
    contact: "Elena Vogt",
    contactRole: "Account executive",
  },
  {
    id: "vnd-ge",
    name: "GE HealthCare",
    category: "Imaging OEM",
    contractEndLabel: "Dec 2, 2026",
    contractEndSort: "2026-12-02",
    expiringSoon: false,
    openPOs: 2,
    csat: 4.5,
    contact: "Marcus Reid",
    contactRole: "Service director",
  },
  {
    id: "vnd-philips",
    name: "Philips",
    category: "Imaging OEM",
    contractEndLabel: "Apr 28, 2026",
    contractEndSort: "2026-04-28",
    expiringSoon: true,
    openPOs: 0,
    csat: 4.4,
    contact: "Ingrid Vos",
    contactRole: "Clinical partnerships",
  },
  {
    id: "vnd-medtronic",
    name: "Medtronic",
    category: "Devices",
    contractEndLabel: "Mar 9, 2028",
    contractEndSort: "2028-03-09",
    expiringSoon: false,
    openPOs: 0,
    csat: 4.8,
    contact: "Priya Nair",
    contactRole: "Hospital solutions",
  },
  {
    id: "vnd-baxter",
    name: "Baxter",
    category: "Devices",
    contractEndLabel: "May 20, 2026",
    contractEndSort: "2026-05-20",
    expiringSoon: true,
    openPOs: 2,
    csat: 4.3,
    contact: "Tomás Ortega",
    contactRole: "Infusion support",
  },
  {
    id: "vnd-steris",
    name: "Steris",
    category: "Sterilization",
    contractEndLabel: "Jan 18, 2027",
    contractEndSort: "2027-01-18",
    expiringSoon: false,
    openPOs: 3,
    csat: 4.2,
    contact: "Laura Chen",
    contactRole: "SPD programs",
  },
  {
    id: "vnd-fresenius",
    name: "Fresenius Medical Care",
    category: "Devices",
    contractEndLabel: "Jun 15, 2026",
    contractEndSort: "2026-06-15",
    expiringSoon: true,
    openPOs: 1,
    csat: 4.1,
    contact: "Dana Frost",
    contactRole: "Renal accounts",
  },
  {
    id: "vnd-roche",
    name: "Roche Diagnostics",
    category: "Lab",
    contractEndLabel: "Sep 30, 2027",
    contractEndSort: "2027-09-30",
    expiringSoon: false,
    openPOs: 1,
    csat: 4.6,
    contact: "Samuel Okonkwo",
    contactRole: "LIS interfaces",
  },
  {
    id: "vnd-impinj",
    name: "Impinj",
    category: "IT / IoT",
    contractEndLabel: "Nov 1, 2026",
    contractEndSort: "2026-11-01",
    expiringSoon: false,
    openPOs: 0,
    csat: 4.0,
    contact: "Jordan Lee",
    contactRole: "RFID sales engineer",
  },
  {
    id: "vnd-eaton",
    name: "Eaton",
    category: "Facilities",
    contractEndLabel: "Feb 22, 2028",
    contractEndSort: "2028-02-22",
    expiringSoon: false,
    openPOs: 1,
    csat: 4.5,
    contact: "Chris Patel",
    contactRole: "Power services",
  },
];

type OpenPO = {
  id: string;
  vendorName: string;
  title: string;
  amount: string;
  status: "In progress" | "Approved" | "Receiving";
  opened: string;
};

const OPEN_POS: OpenPO[] = [
  {
    id: "PO-8821",
    vendorName: "Steris",
    title: "Autoclave gasket kit · OR block",
    amount: "$18,400",
    status: "Receiving",
    opened: "Mar 28, 2026",
  },
  {
    id: "PO-8814",
    vendorName: "Siemens Healthineers",
    title: "MR coldhead service bundle",
    amount: "$42,900",
    status: "Approved",
    opened: "Mar 22, 2026",
  },
  {
    id: "PO-8808",
    vendorName: "Baxter",
    title: "Infusion admin sets · ICU",
    amount: "$6,120",
    status: "In progress",
    opened: "Mar 19, 2026",
  },
  {
    id: "PO-8801",
    vendorName: "GE HealthCare",
    title: "CT tube provisional",
    amount: "$112,000",
    status: "Approved",
    opened: "Mar 12, 2026",
  },
  {
    id: "PO-8795",
    vendorName: "Fresenius Medical Care",
    title: "Dialysis concentrate · Q2",
    amount: "$24,800",
    status: "In progress",
    opened: "Mar 8, 2026",
  },
  {
    id: "PO-8788",
    vendorName: "Steris",
    title: "Sterilant chemistry",
    amount: "$9,200",
    status: "Receiving",
    opened: "Mar 5, 2026",
  },
  {
    id: "PO-8782",
    vendorName: "Roche Diagnostics",
    title: "Reagent restock · core lab",
    amount: "$31,500",
    status: "In progress",
    opened: "Mar 1, 2026",
  },
  {
    id: "PO-8776",
    vendorName: "Eaton",
    title: "UPS battery string · satellite",
    amount: "$7,950",
    status: "Approved",
    opened: "Feb 26, 2026",
  },
  {
    id: "PO-8770",
    vendorName: "Siemens Healthineers",
    title: "Ultrasound probe repair",
    amount: "$4,100",
    status: "In progress",
    opened: "Feb 20, 2026",
  },
  {
    id: "PO-8764",
    vendorName: "Baxter",
    title: "Syringe pump accessories",
    amount: "$3,400",
    status: "Receiving",
    opened: "Feb 14, 2026",
  },
  {
    id: "PO-8758",
    vendorName: "Steris",
    title: "Washer disinfector PM parts",
    amount: "$11,200",
    status: "Approved",
    opened: "Feb 9, 2026",
  },
  {
    id: "PO-8751",
    vendorName: "GE HealthCare",
    title: "Mammography detector swap",
    amount: "$58,000",
    status: "In progress",
    opened: "Feb 2, 2026",
  },
];

const CATEGORIES = [
  "All",
  "Imaging OEM",
  "Devices",
  "Sterilization",
  "Lab",
  "IT / IoT",
  "Facilities",
] as const;

const poStatusClass: Record<OpenPO["status"], string> = {
  "In progress": "bg-amber-500/12 text-amber-950 border-amber-500/25",
  Approved: "bg-emerald-500/12 text-emerald-900 border-emerald-500/25",
  Receiving: "bg-blue-500/12 text-blue-900 border-blue-500/25",
};

function csatTone(score: number) {
  if (score >= 4.5) return "text-emerald-700";
  if (score >= 4.0) return "text-slate-800";
  return "text-amber-800";
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

export function VendorsView() {
  const c = sectionConfigs.vendors;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [expiringOnly, setExpiringOnly] = useState(false);

  const expiringList = useMemo(
    () => VENDORS.filter((v) => v.expiringSoon),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENDORS.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (expiringOnly && !v.expiringSoon) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.contact.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.contractEndSort.localeCompare(b.contractEndSort));
  }, [query, category, expiringOnly]);

  return (
    <ViewPage>
      <PageHeader
        icon={Building2}
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
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Upload contract
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800"
              type="button"
            >
              Add vendor
            </Button>
          </div>
        }
      />

      <SectionCard
        className="flex flex-col gap-3 bg-slate-50/80 sm:flex-row sm:items-center"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-800">
          <FileText className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Contract vault</span>{" "}
          stores executed PDFs, renewal clauses, and COI uploads. Renewals
          within 90 days surface here and in the executive calendar.
        </p>
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
              <p className="text-xs text-slate-500">{s.hint}</p>
            ) : null}
          </SectionCard>
        ))}
      </div>

      {expiringList.length ? (
        <section className="overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/20">
          <div className="flex items-center gap-2 border-b border-amber-200/50 px-5 py-3">
            <AlertTriangle
              className="h-4 w-4 text-amber-800"
              aria-hidden
            />
            <div>
              <h2 className="text-sm font-semibold text-amber-950">
                Contracts expiring in &lt; 90 days
              </h2>
              <p className="text-xs text-amber-900/85">
                {expiringList.length} vendor
                {expiringList.length !== 1 ? "s" : ""} — align with legal and
                capital planning
              </p>
            </div>
          </div>
          <ul className="divide-y divide-amber-200/40">
            {expiringList.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-amber-950">{v.name}</p>
                  <p className="text-xs text-amber-900/80">
                    Ends {v.contractEndLabel} · {v.contact} · {v.contactRole}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning" className="text-[10px] font-bold">
                    Renew
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-amber-300/60 bg-white/80 text-xs text-amber-950"
                    type="button"
                  >
                    Open folder
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Vendor directory
            </h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vendor, category, or contact…"
                className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
                aria-label="Search vendors"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Category
            </span>
            {CATEGORIES.map((cat) => (
              <FilterPill
                key={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              active={!expiringOnly}
              onClick={() => setExpiringOnly(false)}
            >
              All vendors
            </FilterPill>
            <FilterPill
              active={expiringOnly}
              onClick={() => setExpiringOnly(true)}
            >
              Expiring &lt; 90d ({expiringList.length})
            </FilterPill>
          </div>
          <p className="text-[11px] text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filtered.length}
            </span>{" "}
            of {VENDORS.length} in demo slice
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  Vendor
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Contract end
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  CSAT
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Open POs
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Primary contact
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-slate-500"
                  >
                    No vendors match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
              {filtered.map((v) => (
                <TableRow
                  key={v.id}
                  className={cn(
                    "border-slate-100",
                    v.expiringSoon && "bg-amber-50/30"
                  )}
                >
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex flex-wrap items-center gap-2">
                      {v.name}
                      {v.expiringSoon ? (
                        <Badge
                          variant="warning"
                          className="text-[9px] font-bold"
                        >
                          &lt; 90d
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {v.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {v.contractEndLabel}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      csatTone(v.csat)
                    )}
                  >
                    {v.csat.toFixed(1)}
                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                      /5
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {v.openPOs === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className="font-medium tabular-nums">
                        {v.openPOs} PO
                        {v.openPOs !== 1 ? "s" : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-800">
                      {v.contact}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Phone className="h-3 w-3 shrink-0" aria-hidden />
                      {v.contactRole}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard className="overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Open purchase orders
          </h2>
          <p className="text-xs text-slate-500">
            Biomed-owned requisitions · {OPEN_POS.length} active in demo (
            aligns with portfolio stats)
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500">
                  PO #
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Vendor
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Description
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Opened
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OPEN_POS.map((p) => (
                <TableRow key={p.id} className="border-slate-100">
                  <TableCell className="font-mono text-xs font-semibold text-slate-800">
                    {p.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-900">
                    {p.vendorName}
                  </TableCell>
                  <TableCell className="max-w-[240px] text-sm text-slate-600">
                    {p.title}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm text-slate-700">
                    {p.amount}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-500">
                    {p.opened}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold",
                        poStatusClass[p.status]
                      )}
                    >
                      {p.status}
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
