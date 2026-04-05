import type { LucideIcon } from "lucide-react";
import {
  MonitorSmartphone,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Wrench,
  BarChart3,
  TrendingUp,
  FileText,
  ScrollText,
  Users,
  MapPin,
  Puzzle,
  Building2,
  Settings,
  Radio,
  ShieldCheck,
  LineChart,
  Download,
  Filter,
  BellRing,
  Clock,
  Cpu,
  Link2,
  FileSpreadsheet,
  Mail,
} from "lucide-react";

export type SectionStat = { label: string; value: string; hint?: string };

export type SectionTile = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SectionPageConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: SectionStat[];
  tiles: SectionTile[];
};

export const sectionSlugs = [
  "fleet",
  "alerts",
  "calendar",
  "work-orders",
  "maintenance",
  "analytics",
  "trends",
  "audit-log",
  "reports",
  "users",
  "locations",
  "integrations",
  "vendors",
  "settings",
] as const;

export type SectionSlug = (typeof sectionSlugs)[number];

export const sectionConfigs: Record<SectionSlug, SectionPageConfig> = {
  fleet: {
    title: "Fleet",
    description:
      "Live inventory, connectivity, and firmware posture across all monitored devices.",
    icon: MonitorSmartphone,
    stats: [
      { label: "Online now", value: "1,284", hint: "99.2% reachable" },
      { label: "Needs attention", value: "23", hint: "Battery / sync" },
      { label: "Firmware behind", value: "41", hint: "OTA eligible" },
      { label: "New this month", value: "18", hint: "Onboarded" },
    ],
    tiles: [
      {
        title: "Live map",
        description: "Floor and department view of device health.",
        icon: Radio,
      },
      {
        title: "Bulk actions",
        description: "Schedule updates and policy pushes to groups.",
        icon: Cpu,
      },
      {
        title: "Export roster",
        description: "CSV or HL7-friendly device manifests.",
        icon: Download,
      },
      {
        title: "Compliance tags",
        description: "Joint Commission–ready grouping and filters.",
        icon: ShieldCheck,
      },
    ],
  },
  alerts: {
    title: "Alerts & incidents",
    description:
      "Triage open incidents, assign owners, and close the loop with audit-friendly notes.",
    icon: AlertTriangle,
    stats: [
      { label: "Open", value: "4", hint: "2 critical" },
      { label: "MTTR (7d)", value: "3.2h", hint: "Team avg" },
      { label: "Acknowledged", value: "12", hint: "Today" },
      { label: "Escalations", value: "1", hint: "Pending exec" },
    ],
    tiles: [
      {
        title: "Runbooks",
        description: "Attach SOPs and device-specific checklists.",
        icon: FileText,
      },
      {
        title: "On-call",
        description: "Pager rotations tied to department ownership.",
        icon: BellRing,
      },
      {
        title: "SLA watch",
        description: "Breached timers highlighted in the queue.",
        icon: Clock,
      },
      {
        title: "Post-incident",
        description: "Export timelines for quality review.",
        icon: ScrollText,
      },
    ],
  },
  calendar: {
    title: "Calendar",
    description:
      "Preventive maintenance, vendor visits, and calibration windows in one hospital-wide view.",
    icon: Calendar,
    stats: [
      { label: "This week", value: "34", hint: "Events" },
      { label: "Conflicts", value: "2", hint: "Rooms" },
      { label: "Vendor blocks", value: "6", hint: "Approved" },
      { label: "Auto-scheduled", value: "71%", hint: "Of PM tasks" },
    ],
    tiles: [
      {
        title: "Drag to reschedule",
        description: "Conflict detection for shared bays.",
        icon: Calendar,
      },
      {
        title: "Subscribe (ICS)",
        description: "Sync biomed and IT calendars.",
        icon: Link2,
      },
      {
        title: "Room holds",
        description: "Block imaging suites during downtime.",
        icon: Building2,
      },
      {
        title: "Reminders",
        description: "SMS and in-app nudges before due windows.",
        icon: BellRing,
      },
    ],
  },
  "work-orders": {
    title: "Work orders",
    description:
      "Create, route, and complete work orders with parts, labor codes, and device context.",
    icon: ClipboardList,
    stats: [
      { label: "Open", value: "56", hint: "Across sites" },
      { label: "Due today", value: "9", hint: "High priority 3" },
      { label: "Avg cycle", value: "1.4d", hint: "Closed (30d)" },
      { label: "First-time fix", value: "88%", hint: "Rolling" },
    ],
    tiles: [
      {
        title: "Templates",
        description: "Standard WO types for common devices.",
        icon: FileText,
      },
      {
        title: "Approvals",
        description: "Capital and vendor spend gates.",
        icon: ShieldCheck,
      },
      {
        title: "Mobile tech",
        description: "Technician checklist mode.",
        icon: MonitorSmartphone,
      },
      {
        title: "Billing hooks",
        description: "Export to ERP / CMMS charge codes.",
        icon: FileSpreadsheet,
      },
    ],
  },
  maintenance: {
    title: "Maintenance",
    description:
      "PM schedules, meter-based triggers, and documentation stored per asset.",
    icon: Wrench,
    stats: [
      { label: "Due (14d)", value: "5", hint: "Tasks" },
      { label: "Overdue", value: "2", hint: "Escalate" },
      { label: "PM compliance", value: "94%", hint: "YTD" },
      { label: "Labor hours", value: "412", hint: "This month" },
    ],
    tiles: [
      {
        title: "Meter readings",
        description: "Import usage counters from connected devices.",
        icon: LineChart,
      },
      {
        title: "Checklists",
        description: "Digital sign-off with photo capture.",
        icon: ClipboardList,
      },
      {
        title: "Parts usage",
        description: "Deplete stock on close-out.",
        icon: Puzzle,
      },
      {
        title: "Vendor PM",
        description: "Co-managed schedules with OEMs.",
        icon: Building2,
      },
    ],
  },
  analytics: {
    title: "Analytics",
    description:
      "Operational KPIs, utilization, and reliability metrics sliced by site and modality.",
    icon: BarChart3,
    stats: [
      { label: "Uptime", value: "99.4%", hint: "90d" },
      { label: "Mean downtime", value: "18m", hint: "Per incident" },
      { label: "Work completed", value: "1.1k", hint: "This quarter" },
      { label: "Cost avoided", value: "$240k", hint: "Est." },
    ],
    tiles: [
      {
        title: "Dashboards",
        description: "Save and share executive views.",
        icon: BarChart3,
      },
      {
        title: "Benchmarks",
        description: "Compare departments and peer cohorts.",
        icon: TrendingUp,
      },
      {
        title: "Scheduled email",
        description: "Weekly PDF to leadership.",
        icon: Mail,
      },
      {
        title: "Drill-through",
        description: "Click a KPI to open affected devices.",
        icon: Filter,
      },
    ],
  },
  trends: {
    title: "Trends & forecasts",
    description:
      "Model failure risk, battery fade, and workload so teams can plan ahead.",
    icon: TrendingUp,
    stats: [
      { label: "High-risk devices", value: "441", hint: "Model score" },
      { label: "Forecast horizon", value: "30d", hint: "Default" },
      { label: "Model refresh", value: "Daily", hint: "Auto" },
      { label: "Accuracy", value: "0.81", hint: "AUC proxy" },
    ],
    tiles: [
      {
        title: "What-if",
        description: "Simulate staffing and SLA changes.",
        icon: LineChart,
      },
      {
        title: "Explainability",
        description: "Top drivers per prediction.",
        icon: Cpu,
      },
      {
        title: "Alert tuning",
        description: "Reduce noise with learned thresholds.",
        icon: BellRing,
      },
      {
        title: "API export",
        description: "Stream scores to your data lake.",
        icon: Link2,
      },
    ],
  },
  "audit-log": {
    title: "Audit log",
    description:
      "Immutable history of sign-ins, configuration changes, and PHI-touching actions.",
    icon: ScrollText,
    stats: [
      { label: "Events (24h)", value: "18.4k", hint: "Ingested" },
      { label: "PHI actions", value: "312", hint: "Reviewed" },
      { label: "Failed auth", value: "14", hint: "Flagged" },
      { label: "Retention", value: "7 yr", hint: "Policy" },
    ],
    tiles: [
      {
        title: "Immutable store",
        description: "WORM-backed event stream.",
        icon: ShieldCheck,
      },
      {
        title: "Search",
        description: "Actor, object, and correlation ID.",
        icon: Filter,
      },
      {
        title: "Legal hold",
        description: "Freeze subsets for investigations.",
        icon: FileText,
      },
      {
        title: "SIEM forward",
        description: "Syslog and Splunk connectors.",
        icon: Link2,
      },
    ],
  },
  reports: {
    title: "Reports",
    description:
      "Regulatory packets, joint commission binders, and custom exports—scheduled or on-demand.",
    icon: FileText,
    stats: [
      { label: "Library", value: "28", hint: "Templates" },
      { label: "Runs (30d)", value: "164", hint: "Successful" },
      { label: "Next scheduled", value: "Mon 6am", hint: "Compliance" },
      { label: "Avg build", value: "42s", hint: "PDF" },
    ],
    tiles: [
      {
        title: "Packet builder",
        description: "Drag sections and cover pages.",
        icon: FileText,
      },
      {
        title: "Signatures",
        description: "Route for digital approval.",
        icon: ShieldCheck,
      },
      {
        title: "Versioning",
        description: "Compare runs month over month.",
        icon: ScrollText,
      },
      {
        title: "Share link",
        description: "Time-boxed secure download.",
        icon: Link2,
      },
    ],
  },
  users: {
    title: "Users & roles",
    description:
      "Provision hospital staff, map RBAC, and enforce MFA across connected systems.",
    icon: Users,
    stats: [
      { label: "Active users", value: "312", hint: "Last 30d" },
      { label: "Roles", value: "14", hint: "Custom 6" },
      { label: "Pending invites", value: "3", hint: "Expire 7d" },
      { label: "MFA coverage", value: "100%", hint: "Enforced" },
    ],
    tiles: [
      {
        title: "SCIM",
        description: "Sync from your IdP.",
        icon: Link2,
      },
      {
        title: "Break-glass",
        description: "Time-limited elevated access.",
        icon: ShieldCheck,
      },
      {
        title: "Access reviews",
        description: "Quarterly attestations.",
        icon: ClipboardList,
      },
      {
        title: "API keys",
        description: "Rotate integration credentials.",
        icon: Cpu,
      },
    ],
  },
  locations: {
    title: "Locations",
    description:
      "Sites, buildings, floors, and rooms—used for routing, permissions, and device placement.",
    icon: MapPin,
    stats: [
      { label: "Sites", value: "4", hint: "Active" },
      { label: "Rooms mapped", value: "612", hint: "BLE verified" },
      { label: "Unplaced devices", value: "7", hint: "Needs room" },
      { label: "Time zones", value: "2", hint: "DST aware" },
    ],
    tiles: [
      {
        title: "Floor plans",
        description: "Upload PDF or CAD overlays.",
        icon: Building2,
      },
      {
        title: "Wayfinding",
        description: "Deep links for tech dispatch.",
        icon: MapPin,
      },
      {
        title: "Hierarchy",
        description: "Drag-drop reorganize.",
        icon: Filter,
      },
      {
        title: "Import",
        description: "Bulk CSV from facilities.",
        icon: Download,
      },
    ],
  },
  integrations: {
    title: "Integrations",
    description:
      "Connect CMMS, EHR adjacent systems, alerting, and data warehouses with monitored webhooks.",
    icon: Puzzle,
    stats: [
      { label: "Connected", value: "11", hint: "Production" },
      { label: "Healthy", value: "10", hint: "200 OK" },
      { label: "Events / hr", value: "2.1k", hint: "Outbound" },
      { label: "Retry queue", value: "0", hint: "Clear" },
    ],
    tiles: [
      {
        title: "Webhooks",
        description: "Signed payloads with replay protection.",
        icon: Link2,
      },
      {
        title: "OAuth apps",
        description: "Scoped tokens per vendor.",
        icon: ShieldCheck,
      },
      {
        title: "Sandbox",
        description: "Test connectors without prod data.",
        icon: Cpu,
      },
      {
        title: "Logs",
        description: "Request/response trace (redacted).",
        icon: ScrollText,
      },
    ],
  },
  vendors: {
    title: "Vendor management",
    description:
      "Contracts, contacts, and service-level tracking for OEMs and third-party maintainers.",
    icon: Building2,
    stats: [
      { label: "Active vendors", value: "37", hint: "Under contract" },
      { label: "Contracts expiring", value: "3", hint: "< 90d" },
      { label: "Open POs", value: "12", hint: "Biomed" },
      { label: "CSAT", value: "4.6", hint: "Rolling" },
    ],
    tiles: [
      {
        title: "Contract vault",
        description: "Renewal reminders and clauses.",
        icon: FileText,
      },
      {
        title: "Contacts",
        description: "Escalation trees per modality.",
        icon: Users,
      },
      {
        title: "Performance",
        description: "SLA breach history.",
        icon: LineChart,
      },
      {
        title: "Onsite visits",
        description: "Align with calendar holds.",
        icon: Calendar,
      },
    ],
  },
  settings: {
    title: "System settings",
    description:
      "Branding, data residency, feature flags, and hospital-wide policies for MediSync+.",
    icon: Settings,
    stats: [
      { label: "Environment", value: "Prod", hint: "US-East" },
      { label: "Feature flags", value: "18", hint: "8 beta" },
      { label: "Last release", value: "v2.14", hint: "3d ago" },
      { label: "Backups", value: "OK", hint: "Hourly" },
    ],
    tiles: [
      {
        title: "Branding",
        description: "Logo, colors, email footers.",
        icon: Building2,
      },
      {
        title: "Security",
        description: "Session TTL, IP allowlists.",
        icon: ShieldCheck,
      },
      {
        title: "Data regions",
        description: "Residency and retention.",
        icon: MapPin,
      },
      {
        title: "API limits",
        description: "Rate caps per integration.",
        icon: Cpu,
      },
    ],
  },
};
