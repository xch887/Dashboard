"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { HospitalCampusMap } from "@/components/dashboard/hospital-campus-map";
import {
  MapPin,
  Building2,
  ChevronRight,
  Search,
  ExternalLink,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  TableCard,
} from "@/components/dashboard/section-card";

export type LocationBuilding = {
  id: string;
  name: string;
  floors: number;
  rooms: number;
  devices: number;
  bleVerifiedPct: number;
};

export type LocationSite = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  timeZone: string;
  buildings: LocationBuilding[];
};

export type UnplacedDevice = {
  deviceId: string;
  label: string;
  department: string;
  lastBeacon: string;
  suggestedRoom: string;
};

const SITES: LocationSite[] = [
  {
    id: "main",
    name: "Regency Medical — Main campus",
    shortName: "Main",
    address: "1200 Harbor Blvd, Metro City",
    timeZone: "America/New_York",
    buildings: [
      {
        id: "main-north",
        name: "North Tower",
        floors: 8,
        rooms: 214,
        devices: 412,
        bleVerifiedPct: 94,
      },
      {
        id: "main-south",
        name: "South Tower",
        floors: 6,
        rooms: 156,
        devices: 301,
        bleVerifiedPct: 91,
      },
      {
        id: "main-img",
        name: "Imaging Pavilion",
        floors: 2,
        rooms: 42,
        devices: 88,
        bleVerifiedPct: 88,
      },
    ],
  },
  {
    id: "east",
    name: "Regency — East outpatient",
    shortName: "East",
    address: "440 Lakeside Dr",
    timeZone: "America/New_York",
    buildings: [
      {
        id: "east-a",
        name: "Clinic A",
        floors: 3,
        rooms: 89,
        devices: 156,
        bleVerifiedPct: 82,
      },
    ],
  },
  {
    id: "north",
    name: "Regency — North pavilion",
    shortName: "North",
    address: "88 Riverbend Ave",
    timeZone: "America/Chicago",
    buildings: [
      {
        id: "north-med",
        name: "Med/Surg wing",
        floors: 4,
        rooms: 98,
        devices: 142,
        bleVerifiedPct: 79,
      },
      {
        id: "north-onc",
        name: "Oncology annex",
        floors: 2,
        rooms: 54,
        devices: 71,
        bleVerifiedPct: 85,
      },
    ],
  },
  {
    id: "research",
    name: "Regency — Research institute",
    shortName: "Research",
    address: "15 Innovation Way",
    timeZone: "America/New_York",
    buildings: [
      {
        id: "res-lab",
        name: "Lab & sim floor",
        floors: 2,
        rooms: 31,
        devices: 48,
        bleVerifiedPct: 76,
      },
    ],
  },
];

const UNPLACED: UnplacedDevice[] = [
  {
    deviceId: "DEV-9912",
    label: "Telemetry patch (unassigned)",
    department: "ICU",
    lastBeacon: "North Tower · Floor 4 · 12m ago",
    suggestedRoom: "ICU North · Bay 4",
  },
  {
    deviceId: "DEV-9910",
    label: "Infusion pump (dock return)",
    department: "Pharmacy",
    lastBeacon: "South Tower · Loading · 1h ago",
    suggestedRoom: "ICU South · Room 12",
  },
  {
    deviceId: "DEV-9908",
    label: "Portable monitor",
    department: "ER",
    lastBeacon: "Main OR corridor · 22m ago",
    suggestedRoom: "ER · Bay 3",
  },
  {
    deviceId: "DEV-9905",
    label: "Capnography module",
    department: "Anesthesia",
    lastBeacon: "Imaging Pavilion · 45m ago",
    suggestedRoom: "OR 4 · Anesthesia workroom",
  },
  {
    deviceId: "DEV-9903",
    label: "Asset tag only — model TBD",
    department: "SPD",
    lastBeacon: "Sterile core · 3h ago",
    suggestedRoom: "SPD · Decontam intake",
  },
  {
    deviceId: "DEV-9901",
    label: "Syringe pump",
    department: "NICU",
    lastBeacon: "North pavilion · 2d ago",
    suggestedRoom: "NICU · Pod B",
  },
  {
    deviceId: "DEV-9899",
    label: "Temperature logger",
    department: "Pharmacy",
    lastBeacon: "Satellite fridge B · 6h ago",
    suggestedRoom: "Pharmacy · Satellite B",
  },
];

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

export function LocationsView() {
  const c = sectionConfigs.locations;
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visibleSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITES.filter((s) => {
      if (siteFilter !== "all" && s.id !== siteFilter) return false;
      if (!q) return true;
      if (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      ) {
        return true;
      }
      return s.buildings.some(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }).map((s) => {
      if (!q) return s;
      const bMatch = s.buildings.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      );
      if (bMatch.length && !s.name.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) {
        return { ...s, buildings: bMatch };
      }
      return s;
    });
  }, [siteFilter, query]);

  const totalBuildings = visibleSites.reduce((n, s) => n + s.buildings.length, 0);

  return (
    <ViewPage>
      <PageHeader
        icon={MapPin}
        title={c.title}
        description={c.description}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg text-xs font-semibold"
            type="button"
          >
            Import CSV
          </Button>
        }
      />

      <div
        className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 ring-1 ring-slate-200/50 sm:flex-row sm:items-center"
        role="note"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-800">
          <Radio className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">BLE room lock</span>{" "}
          verifies device coordinates against mapped polygons. Unplaced assets
          still contribute to site totals until a room is assigned.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Site
          </span>
          <FilterPill
            active={siteFilter === "all"}
            onClick={() => setSiteFilter("all")}
          >
            All ({SITES.length})
          </FilterPill>
          {SITES.map((s) => (
            <FilterPill
              key={s.id}
              active={siteFilter === s.id}
              onClick={() => setSiteFilter(s.id)}
            >
              {s.shortName}
            </FilterPill>
          ))}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search site, address, or building…"
            className="h-9 rounded-lg border-slate-200 pl-9 text-sm"
            aria-label="Search locations"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {visibleSites.length}
          </span>{" "}
          site
          {visibleSites.length !== 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-slate-800">
            {totalBuildings}
          </span>{" "}
          building
          {totalBuildings !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,380px)] lg:items-start">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50"
          aria-labelledby="campus-map-heading"
        >
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
            <h2
              id="campus-map-heading"
              className="text-sm font-bold text-slate-950"
            >
              Campus map &amp; device density
            </h2>
            <p className="text-xs text-slate-500">
              Main campus overlay — dots are approximate clusters (demo). Pair
              with the hierarchy to resolve unplaced assets.
            </p>
          </div>
          <div className="min-h-[min(56vh,560px)] w-full bg-slate-50/50 p-3 sm:p-4">
            <div className="h-full min-h-[420px] w-full overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-inner">
              <HospitalCampusMap />
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {visibleSites.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-500">
              No sites match this search.
            </p>
          ) : null}
          {visibleSites.map((site) => (
            <div
              key={site.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm ring-1 ring-slate-200/50"
            >
              <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {site.name}
                  </h3>
                  <p className="text-xs text-slate-500">{site.address}</p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    {site.timeZone.replace(/_/g, " ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  type="button"
                >
                  Edit
                </Button>
              </div>
              {site.buildings.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-slate-500">
                  No buildings match your search.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {site.buildings.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {b.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {b.floors} floors · {b.rooms} rooms mapped · BLE{" "}
                            {b.bleVerifiedPct}% verified
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 tabular-nums text-[10px] font-semibold"
                        >
                          {b.devices} devices
                        </Badge>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-slate-300"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/35 shadow-sm ring-1 ring-amber-500/15">
        <div className="flex flex-col gap-1 border-b border-amber-200/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-amber-950">
              Unplaced devices
            </h2>
            <p className="text-xs text-amber-900/80">
              No confirmed room polygon — triage from last beacon hit (
              {UNPLACED.length} in demo)
            </p>
          </div>
          <Badge variant="warning" className="w-fit text-[10px] font-bold">
            Needs room
          </Badge>
        </div>
        <div className="overflow-x-auto bg-white/60">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-200/40 hover:bg-transparent bg-amber-50/50">
                <TableHead className="text-xs font-semibold text-amber-900/80">
                  Device
                </TableHead>
                <TableHead className="text-xs font-semibold text-amber-900/80">
                  Label
                </TableHead>
                <TableHead className="text-xs font-semibold text-amber-900/80">
                  Dept
                </TableHead>
                <TableHead className="text-xs font-semibold text-amber-900/80">
                  Last beacon
                </TableHead>
                <TableHead className="text-xs font-semibold text-amber-900/80">
                  Suggested room
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-amber-900/80">
                  Fleet
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UNPLACED.map((u) => (
                <TableRow key={u.deviceId} className="border-amber-200/30">
                  <TableCell className="font-mono text-xs font-semibold text-amber-950">
                    {u.deviceId}
                  </TableCell>
                  <TableCell className="text-sm text-slate-800">
                    {u.label}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium"
                    >
                      {u.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] text-sm text-slate-600">
                    {u.lastBeacon}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-800">
                    {u.suggestedRoom}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs font-semibold text-blue-700"
                      asChild
                    >
                      <Link
                        href={`/fleet?device=${encodeURIComponent(u.deviceId)}`}
                      >
                        Open
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ViewPage>
  );
}
