export type DashboardDeadline = {
  id: string;
  title: string;
  department: string;
  deviceCount: number;
  deviceLabel: string;
  detail: string;
  badge: string;
  badgeVariant: "danger" | "warning" | "success" | "info";
};

export const DASHBOARD_DEADLINES: DashboardDeadline[] = [
  {
    id: "1",
    title: "MRI Suite A: Preventative Maintenance",
    department: "Radiology",
    deviceCount: 1,
    deviceLabel: "device",
    detail: "Impact: Imaging temporarily unavailable",
    badge: "High",
    badgeVariant: "danger",
  },
  {
    id: "2",
    title: "Infusion Pumps: Firmware Update",
    department: "ICU",
    deviceCount: 12,
    deviceLabel: "devices",
    detail: "Compliance Risk: Medium",
    badge: "Medium",
    badgeVariant: "warning",
  },
  {
    id: "3",
    title: "Ventilators: Safety Inspection",
    department: "ER",
    deviceCount: 6,
    deviceLabel: "devices",
    detail: "Compliance Risk: High",
    badge: "High",
    badgeVariant: "danger",
  },
  {
    id: "4",
    title: "Philips: Ventilator Contract Renewal",
    department: "Procurement",
    deviceCount: 34,
    deviceLabel: "devices affected",
    detail: "Coverage: Warranty lapses if not renewed",
    badge: "Urgent",
    badgeVariant: "warning",
  },
];
