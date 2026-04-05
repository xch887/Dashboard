import type { IconType } from "react-icons";
import {
  MdAssignment,
  MdBarChart,
  MdBubbleChart,
  MdBuild,
  MdBusiness,
  MdCalendarToday,
  MdDescription,
  MdExtension,
  MdHistory,
  MdLocationOn,
  MdOutlineAssignment,
  MdOutlineBarChart,
  MdOutlineBubbleChart,
  MdOutlineBuild,
  MdOutlineBusiness,
  MdOutlineCalendarToday,
  MdOutlineDescription,
  MdOutlineExtension,
  MdOutlineHistory,
  MdOutlineLocationOn,
  MdOutlinePeople,
  MdOutlineSettings,
  MdOutlineSmartphone,
  MdOutlineSpaceDashboard,
  MdOutlineTrendingUp,
  MdOutlineWarning,
  MdPeople,
  MdSettings,
  MdSmartphone,
  MdSpaceDashboard,
  MdTrendingUp,
  MdWarning,
} from "react-icons/md";

export type NavItem = {
  label: string;
  /** Material-style: outlined when route inactive. */
  iconOutline: IconType;
  /** Material-style: filled when route active. */
  iconFilled: IconType;
  href: string;
  badge?: number;
  /** Sidebar badge color by highest-severity item in that queue (demo). */
  badgeTone?: "critical" | "warning" | "neutral";
};

export type NavSectionData = {
  label: string;
  items: NavItem[];
};

/**
 * Flip to `true` when the Dashboard route should appear in the sidebar and at `/` again.
 */
export const SHOW_DASHBOARD_IN_NAV = false;

const navSectionsSource: NavSectionData[] = [
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Intelligence",
        iconOutline: MdOutlineBubbleChart,
        iconFilled: MdBubbleChart,
        href: "/assistant",
      },
      {
        label: "Dashboard",
        iconOutline: MdOutlineSpaceDashboard,
        iconFilled: MdSpaceDashboard,
        href: "/dashboard",
      },
      {
        label: "Fleet",
        iconOutline: MdOutlineSmartphone,
        iconFilled: MdSmartphone,
        href: "/fleet",
      },
      {
        label: "Alerts & Incidents",
        iconOutline: MdOutlineWarning,
        iconFilled: MdWarning,
        href: "/alerts",
        badge: 4,
        badgeTone: "critical",
      },
      {
        label: "Calendar",
        iconOutline: MdOutlineCalendarToday,
        iconFilled: MdCalendarToday,
        href: "/calendar",
      },
      {
        label: "Work Orders",
        iconOutline: MdOutlineAssignment,
        iconFilled: MdAssignment,
        href: "/work-orders",
      },
      {
        label: "Maintenance",
        iconOutline: MdOutlineBuild,
        iconFilled: MdBuild,
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
        iconOutline: MdOutlineBarChart,
        iconFilled: MdBarChart,
        href: "/analytics",
      },
      {
        label: "Trends & Forecasts",
        iconOutline: MdOutlineTrendingUp,
        iconFilled: MdTrendingUp,
        href: "/trends",
        badge: 10,
        badgeTone: "neutral",
      },
      {
        label: "Audit Log",
        iconOutline: MdOutlineHistory,
        iconFilled: MdHistory,
        href: "/audit-log",
      },
      {
        label: "Reports",
        iconOutline: MdOutlineDescription,
        iconFilled: MdDescription,
        href: "/reports",
      },
    ],
  },
  {
    label: "ADMIN",
    items: [
      {
        label: "Users & Roles",
        iconOutline: MdOutlinePeople,
        iconFilled: MdPeople,
        href: "/users",
      },
      {
        label: "Locations",
        iconOutline: MdOutlineLocationOn,
        iconFilled: MdLocationOn,
        href: "/locations",
      },
      {
        label: "Integrations",
        iconOutline: MdOutlineExtension,
        iconFilled: MdExtension,
        href: "/integrations",
      },
      {
        label: "Vendor Management",
        iconOutline: MdOutlineBusiness,
        iconFilled: MdBusiness,
        href: "/vendors",
      },
      {
        label: "System Settings",
        iconOutline: MdOutlineSettings,
        iconFilled: MdSettings,
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

/** Landing target for logo / root when Dashboard is hidden. */
export const appHomeHref = SHOW_DASHBOARD_IN_NAV ? "/dashboard" : "/assistant";

/** Sidebar: Operations + Insights scroll above; Admin pinned to the bottom. */
export const sidebarNavTop = navSections.filter((s) => s.label !== "ADMIN");
export const sidebarNavAdmin = navSections.find((s) => s.label === "ADMIN");
