"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
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
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineExpandMore,
} from "react-icons/md";
import { Button } from "@/components/ui/button";

const ORG_SITES = [
  {
    id: "main",
    name: "Regency Medical",
    sub: "General Hospital",
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
      if (tone === "critical") return "bg-rose-600 text-white";
      if (tone === "warning") return "bg-amber-500 text-white";
      if (tone === "neutral") return "bg-slate-500 text-white";
      if (variant === "admin" && isActive) return "bg-slate-600 text-white";
      return "bg-blue-600 text-white";
    }
    if (isActive) {
      if (variant === "admin") return "bg-slate-200/90 text-slate-800";
      return "bg-blue-100 text-blue-800";
    }
    const tone = item.badgeTone;
    if (tone === "critical") return "bg-rose-100 text-rose-800 ring-1 ring-rose-200/80";
    if (tone === "warning") return "bg-amber-100 text-amber-950 ring-1 ring-amber-200/70";
    if (tone === "neutral") return "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80";
    return "bg-slate-100 text-slate-500";
  }

  function navLink(
    item: NavItem,
    isActive: boolean,
    variant: "main" | "admin" = "main"
  ) {
    const NavIcon = isActive ? item.iconFilled : item.iconOutline;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative flex w-full items-center rounded-lg text-sm outline-none transition-all duration-200",
          "active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 py-2 pl-3 pr-2.5",
          isActive && variant === "main"
            ? "bg-blue-50 font-semibold text-blue-950 shadow-[inset_0_0_0_1px_rgb(37_99_235/0.22)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-blue-600 before:content-[''] collapsed:before:hidden"
            : null,
          isActive && variant === "admin"
            ? "bg-slate-100/90 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgb(148_163_184/0.45)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-slate-600 before:content-[''] collapsed:before:hidden"
            : null,
          !isActive
            ? "font-medium before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-transparent before:content-[''] before:transition-colors collapsed:before:hidden"
            : null,
          variant === "admin" && !isActive
            ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            : null,
          variant === "main" && !isActive
            ? "text-blue-950/80 hover:bg-blue-50/60 hover:text-blue-950"
            : null
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
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {item.badge != null ? (
              <span
                className={cn(
                  "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[0.625rem] font-semibold tabular-nums leading-none",
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
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white",
              badgeClasses(item, isActive, true, variant)
            )}
          >
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-slate-200/90 bg-white shadow-[1px_0_0_rgb(0_0_0/0.03)] transition-[width] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      <div
        className={cn(
          "flex gap-1 border-b border-slate-100",
          collapsed
            ? "flex-col items-center py-2"
            : "h-[3.25rem] items-center justify-between px-2 sm:px-3"
        )}
      >
        <Link
          href={appHomeHref}
          title={collapsed ? "MediSync" : undefined}
          aria-label={collapsed ? "MediSync home" : undefined}
          className={cn(
            "flex min-w-0 items-center rounded-md outline-none transition-transform duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            collapsed ? "justify-center" : "min-w-0 flex-1 gap-2.5"
          )}
        >
          <MediSyncLogoMark collapsed={collapsed} />
          <MediSyncWordmark collapsed={collapsed} />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn(
            "shrink-0 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            collapsed ? "h-7 w-7" : "h-8 w-8"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <MdOutlineChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <MdOutlineChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </div>

      <div className="border-b border-slate-100 px-2 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={collapsed ? activeSite.name : undefined}
              className={cn(
                "flex w-full items-center rounded-lg outline-none transition-colors duration-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                collapsed ? "justify-center py-2" : "gap-2.5 px-2 py-2"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1",
                  activeSite.avatarClass
                )}
              >
                {collapsed ? (
                  <MdOutlineBusiness className="h-4 w-4 opacity-95" aria-hidden />
                ) : (
                  <span className="text-xs font-bold tracking-tight">
                    {orgInitials(activeSite.name)}
                  </span>
                )}
              </div>
              {!collapsed ? (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium leading-tight text-slate-900">
                      {activeSite.name}
                    </p>
                    <p className="truncate text-xs leading-tight text-slate-500">
                      {activeSite.sub}
                    </p>
                  </div>
                  <MdOutlineExpandMore
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden
                  />
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
                  className="items-start gap-2.5 rounded-md py-2 pr-6 pl-8 text-sm"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1",
                      s.avatarClass
                    )}
                  >
                    <span className="text-xs font-bold tracking-tight">
                      {orgInitials(s.name)}
                    </span>
                  </div>
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
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
          {sidebarNavTop.map((section, si) => (
            <div key={section.label} className={cn("mb-4", collapsed && "mb-2")}>
              {collapsed && si > 0 ? (
                <div
                  className="mx-auto mb-2 h-px w-8 bg-slate-200"
                  aria-hidden
                />
              ) : null}
              {!collapsed ? (
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">
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
          <div
            className={cn(
              "shrink-0 border-t border-slate-100 bg-slate-50/40 px-2 py-2",
              collapsed && "bg-slate-50/60"
            )}
          >
            {!collapsed ? (
              <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">
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
