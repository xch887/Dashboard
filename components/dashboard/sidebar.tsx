"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardMastheadHeight,
  dashboardSidebarMastheadDivider,
} from "@/lib/dashboard-surface";
import {
  appHomeHref,
  sidebarNavAdmin,
  sidebarNavTop,
  type NavItem,
} from "@/lib/nav-config";
import { useSidebarCollapsed } from "@/components/dashboard/sidebar-context";
import {
  MediSyncLogoMark,
  MediSyncWordmark,
} from "@/components/dashboard/brand-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MdOutlineBusiness,
  MdOutlineExpandMore,
  MdOutlineViewSidebar,
} from "react-icons/md";

const ORG_SITES = [
  {
    id: "main",
    name: "Regency Medical",
    sub: "General Hospital",
    image: "/brand/regency-medical.png",
    avatarClass:
      "bg-gradient-to-br from-blue-600 to-indigo-700 text-white ring-blue-500/35 shadow-sm",
  },
  {
    id: "east",
    name: "Regency East",
    sub: "Outpatient clinic",
    avatarClass:
      "bg-gradient-to-br from-teal-600 to-emerald-700 text-white ring-teal-500/30 shadow-sm",
  },
  {
    id: "south",
    name: "Regency South",
    sub: "Women & children",
    avatarClass:
      "bg-gradient-to-br from-violet-600 to-purple-700 text-white ring-violet-500/30 shadow-sm",
  },
] as const;

function orgInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function OrgAvatar({
  site,
  collapsed,
  size = "md",
}: {
  site: (typeof ORG_SITES)[number];
  collapsed?: boolean;
  size?: "md" | "sm";
}) {
  const dim = size === "sm" ? "h-8 w-8" : collapsed ? "h-9 w-9" : "h-10 w-10";

  if ("image" in site && site.image) {
    return (
      <Image
        src={site.image}
        alt=""
        width={40}
        height={40}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-slate-200/80",
          dim
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ring-1",
        dim,
        site.avatarClass
      )}
    >
      {collapsed ? (
        <MdOutlineBusiness className="h-4 w-4 opacity-95" aria-hidden />
      ) : (
        <span className="text-xs font-bold tracking-tight">
          {orgInitials(site.name)}
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const [siteId, setSiteId] = useState<string>(ORG_SITES[0].id);
  const activeSite = ORG_SITES.find((s) => s.id === siteId) ?? ORG_SITES[0];

  function badgeClasses(
    item: NavItem,
    isActive: boolean,
    collapsed: boolean,
    variant: "main" | "admin"
  ) {
    if (collapsed) {
      const tone = item.badgeTone;
      if (tone === "critical") return "bg-red-600 text-white";
      if (tone === "warning") return "bg-blue-600 text-white";
      if (tone === "neutral")
        return "bg-white text-slate-600 ring-1 ring-slate-200/90";
      if (variant === "admin" && isActive) return "bg-slate-600 text-white";
      return "bg-blue-600 text-white";
    }
    if (isActive) {
      const tone = item.badgeTone;
      if (tone === "critical") return "bg-red-600 text-white";
      if (tone === "warning") return "bg-blue-600 text-white";
      if (tone === "neutral")
        return "bg-white text-slate-600 ring-1 ring-slate-200/90";
      if (variant === "admin") return "bg-slate-200/90 text-slate-800";
      return "bg-blue-100 text-blue-800";
    }
    const tone = item.badgeTone;
    if (tone === "critical") return "bg-red-600 text-white";
    if (tone === "warning") return "bg-blue-600 text-white";
    if (tone === "neutral")
      return "bg-white text-slate-600 ring-1 ring-slate-200/90";
    return "bg-slate-100 text-slate-500";
  }

  function navLink(
    item: NavItem,
    isActive: boolean,
    variant: "main" | "admin" = "main"
  ) {
    const NavIcon = isActive ? item.iconFilled : item.iconOutline;
    const isMain = variant === "main";
    const showEdgeBar = isActive && !collapsed;

    return (
      <div
        key={item.href}
        className={cn("relative", !collapsed && "pr-4")}
      >
        {showEdgeBar ? (
          <span
            className={cn(
              "pointer-events-none absolute left-1 top-1/2 z-10 h-7 w-[3px] -translate-y-1/2 rounded-full",
              isMain ? "bg-blue-600" : "bg-slate-600"
            )}
            aria-hidden
          />
        ) : null}
        <Link
          href={item.href}
          title={collapsed ? item.label : undefined}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "relative flex w-full items-center text-sm outline-none transition-all duration-200",
            "active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            collapsed
              ? "justify-center rounded-lg px-2 py-2.5"
              : "gap-2.5 rounded-lg py-2 pr-2",
            collapsed ? null : showEdgeBar ? "ml-[11px] pl-2.5" : "pl-5",
            isActive &&
              (collapsed
                ? isMain
                  ? "bg-indigo-50 font-semibold text-slate-900"
                  : "bg-slate-100 font-semibold text-slate-900"
                : isMain
                  ? "bg-indigo-50 font-semibold text-slate-900"
                  : "bg-slate-100 font-semibold text-slate-900"),
            !isActive &&
              "font-medium text-slate-600 hover:bg-indigo-50/60 hover:text-slate-900"
          )}
        >
          <NavIcon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
              variant === "admin"
                ? isActive
                  ? "text-slate-700"
                  : "text-slate-400"
                : isActive
                  ? "text-blue-600"
                  : "text-blue-600/65"
            )}
            aria-hidden
          />
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>
              {item.badge != null ? (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums leading-none",
                    item.badge > 9 ? "h-5 min-w-[22px] px-1" : "size-5",
                    badgeClasses(item, isActive, false, variant)
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          ) : item.badge != null ? (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-md text-[9px] font-bold leading-none",
                item.badge > 9 ? "h-4 min-w-[18px] px-0.5" : "size-4",
                badgeClasses(item, isActive, true, variant)
              )}
            >
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          ) : null}
        </Link>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col bg-white transition-[width] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      <div className="shrink-0">
        <div
          className={cn(
            "relative flex items-center",
            collapsed
              ? cn(dashboardMastheadHeight, "flex-col justify-center gap-1 px-2")
              : cn(dashboardMastheadHeight, "px-2 sm:px-3")
          )}
        >
          <Link
            href={appHomeHref}
            title={collapsed ? "Medisync" : undefined}
            aria-label={collapsed ? "Medisync home" : undefined}
            className={cn(
              "flex items-center rounded-md outline-none transition-transform duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              collapsed ? "justify-center" : "absolute inset-0 justify-center"
            )}
          >
            <MediSyncLogoMark collapsed={collapsed} />
            <MediSyncWordmark collapsed={collapsed} />
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "relative z-10 flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-slate-500 outline-none transition-colors hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              !collapsed && "ml-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MdOutlineViewSidebar
              className={cn("h-[18px] w-[18px]", collapsed && "opacity-80")}
              aria-hidden
            />
          </button>
        </div>
        <div
          className={dashboardSidebarMastheadDivider}
          role="separator"
          aria-hidden
        />
      </div>

      <div className={cn("pb-2 pt-3", collapsed ? "px-2" : "px-3")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={collapsed ? activeSite.name : undefined}
              className={cn(
                "flex w-full items-center rounded-lg outline-none transition-colors duration-200 hover:bg-blue-50/90 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                collapsed ? "justify-center py-2" : "gap-3 px-1 py-2"
              )}
            >
              <OrgAvatar site={activeSite} collapsed={collapsed} />
              {!collapsed ? (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                      {activeSite.name}
                    </p>
                    <p className="truncate text-xs leading-tight text-slate-500">
                      {activeSite.sub}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200/90 bg-slate-50 text-slate-500">
                    <MdOutlineExpandMore className="h-4 w-4" aria-hidden />
                  </span>
                </>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-md [backdrop-filter:none] ring-0"
          >
            <DropdownMenuLabel className="bg-white px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Organization
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={siteId} onValueChange={setSiteId}>
              {ORG_SITES.map((s) => (
                <DropdownMenuRadioItem
                  key={s.id}
                  value={s.id}
                  className="items-center gap-2.5 rounded-md py-2 pr-6 pl-8 text-sm"
                >
                  <OrgAvatar site={s} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium leading-tight text-slate-900">
                      {s.name}
                    </span>
                    <span className="text-xs font-normal leading-tight text-slate-500">
                      {s.sub}
                    </span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col" aria-label="Main">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
          {sidebarNavTop.map((section, si) => (
            <div key={section.label} className={cn("mb-4", collapsed && "mb-2")}>
              {collapsed && si > 0 ? (
                <div
                  className="mx-auto mb-2 h-px w-8 bg-slate-200"
                  aria-hidden
                />
              ) : null}
              {!collapsed ? (
                <p className="mb-2 pl-5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {section.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));
                  return navLink(item, isActive, "main");
                })}
              </div>
            </div>
          ))}
        </div>

        {sidebarNavAdmin ? (
          <div className="shrink-0 py-2">
            {!collapsed ? (
              <p className="mb-2 pl-5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {sidebarNavAdmin.label}
              </p>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {sidebarNavAdmin.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));
                return navLink(item, isActive, "admin");
              })}
            </div>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
