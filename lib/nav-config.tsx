import type { ComponentType } from "react";
import { OperationsIntelligenceNavIcon } from "@/components/dashboard/operations-intelligence-icon";
import {
  NavAlertsIcon,
  NavAnalyticsIcon,
  NavAuditIcon,
  NavCalendarIcon,
  NavDashboardIcon,
  NavFleetIcon,
  NavIntegrationsIcon,
  NavLocationsIcon,
  NavMaintenanceIcon,
  NavReportsIcon,
  NavSettingsIcon,
  NavTrendsIcon,
  NavUsersIcon,
  NavVendorsIcon,
  NavWorkOrdersIcon,
} from "@/components/dashboard/nav-figma-icons";

type NavIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

export type NavItem = {
  label: string;
  iconOutline: NavIcon;
  iconFilled: NavIcon;
  href: string;
  badge?: number;
  badgeTone?: "critical" | "warning" | "neutral";
};

export type NavSectionData = {
  label: string;
  items: NavItem[];
};

/** Fleet readiness dashboard — keep the route, hide from this prototype’s nav. */
export const SHOW_DASHBOARD_IN_NAV = false;

function both(icon: NavIcon): Pick<NavItem, "iconOutline" | "iconFilled"> {
  return { iconOutline: icon, iconFilled: icon };
}

const navSectionsSource: NavSectionData[] = [
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Intelligence",
        ...both(OperationsIntelligenceNavIcon),
        href: "/assistant",
      },
      {
        label: "Dashboard",
        ...both(NavDashboardIcon),
        href: "/dashboard",
      },
      {
        label: "Fleet",
        ...both(NavFleetIcon),
        href: "/fleet",
      },
      {
        label: "Alerts & Incidents",
        ...both(NavAlertsIcon),
        href: "/alerts",
        badge: 4,
        badgeTone: "critical",
      },
      {
        label: "Calendar",
        ...both(NavCalendarIcon),
        href: "/calendar",
      },
      {
        label: "Work Orders",
        ...both(NavWorkOrdersIcon),
        href: "/work-orders",
      },
      {
        label: "Maintenance",
        ...both(NavMaintenanceIcon),
        href: "/maintenance",
        badge: 5,
        badgeTone: "warning",
      },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      {
        label: "Analytics",
        ...both(NavAnalyticsIcon),
        href: "/analytics",
      },
      {
        label: "Trends & Forecasts",
        ...both(NavTrendsIcon),
        href: "/trends",
        badge: 10,
        badgeTone: "neutral",
      },
      {
        label: "Audit Log",
        ...both(NavAuditIcon),
        href: "/audit-log",
      },
      {
        label: "Reports",
        ...both(NavReportsIcon),
        href: "/reports",
      },
    ],
  },
  {
    label: "ADMIN",
    items: [
      {
        label: "Users & Roles",
        ...both(NavUsersIcon),
        href: "/users",
      },
      {
        label: "Locations",
        ...both(NavLocationsIcon),
        href: "/locations",
      },
      {
        label: "Integrations",
        ...both(NavIntegrationsIcon),
        href: "/integrations",
      },
      {
        label: "Vendor Management",
        ...both(NavVendorsIcon),
        href: "/vendors",
      },
      {
        label: "System Settings",
        ...both(NavSettingsIcon),
        href: "/settings",
      },
    ],
  },
];

export const navSections: NavSectionData[] = SHOW_DASHBOARD_IN_NAV
  ? navSectionsSource
  : navSectionsSource.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.href !== "/dashboard"),
    }));

export const appHomeHref = "/assistant";

export const sidebarNavTop = navSections.filter((s) => s.label !== "ADMIN");
export const sidebarNavAdmin = navSections.find((s) => s.label === "ADMIN");
