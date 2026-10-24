export const kpis = [
  {
    value: "441",
    unit: "devices",
    title: "Predicted Failures",
    delta: "+ 5.2%",
    deltaTone: "up" as const,
    spark: [9, 13, 8, 12, 10, 15, 14],
    sparkTone: "good" as const,
  },
  {
    value: "179",
    unit: "tasks",
    title: "Active Maintenance",
    delta: "+ 2.1%",
    deltaTone: "up" as const,
    spark: [8, 12, 9, 14, 11, 13, 16],
    sparkTone: "good" as const,
  },
  {
    value: "4.3",
    unit: "hours",
    title: "Average Resolution Time",
    delta: "+ 0.8%",
    deltaTone: "down" as const,
    spark: [14, 11, 13, 9, 12, 8, 10],
    sparkTone: "bad" as const,
  },
  {
    value: "77%",
    unit: "of fleet",
    title: "Fleet Availability",
    delta: "+ 1.4%",
    deltaTone: "up" as const,
    spark: [10, 8, 12, 11, 15, 13, 16],
    sparkTone: "good" as const,
  },
];

export const healthSlices = [
  { key: "healthy", label: "Healthy", pct: 82, count: 6940, color: "#17C964" },
  { key: "warning", label: "Warning", pct: 11, count: 931, color: "#F5A524" },
  { key: "critical", label: "Critical", pct: 4, count: 339, color: "#F31260" },
  { key: "offline", label: "Offline", pct: 3, count: 253, color: "#889096" },
];

export const calendarDays = [
  { w: "Mon", d: "18" },
  { w: "Tue", d: "19", selected: true },
  { w: "Wed", d: "20" },
  { w: "Thu", d: "21" },
  { w: "Fri", d: "22" },
  { w: "Sat", d: "23" },
  { w: "Sun", d: "24" },
];

export const deadlines = [
  {
    title: "MRI Suite A: Preventative Maintenance",
    meta: "Radiology • 1 device",
    detail: "Impact: Imaging temporarily unavailable",
    icon: "file" as const,
  },
  {
    title: "Infusion Pumps: Firmware Update",
    meta: "ICU • 12 devices",
    detail: "Compliance Risk: Medium",
    icon: "pump" as const,
  },
  {
    title: "Ventilators: Safety Inspection",
    meta: "ER • 6 devices",
    detail: "Compliance Risk: High",
    icon: "vent" as const,
  },
  {
    title: "Philips: Ventilator Contract Renewal",
    meta: "Expires in 5 days • 34 devices affected",
    detail: "Coverage: Warranty lapses if not renewed",
    icon: "contract" as const,
  },
];

export const months = [
  "Sept",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
] as const;

export const complianceBlue = [78, 76, 74, 77, 82, 80, 83, 85, 86, 88, 90, 92];
export const complianceViolet = [74, 72, 70, 73, 76, 75, 78, 80, 82, 84, 86, 88];

export const taskSlices = [
  { key: "overdue", label: "Overdue", pct: 25, count: 45, color: "#F31260" },
  { key: "scheduled", label: "Scheduled", pct: 16, count: 29, color: "#F5A524" },
  { key: "progress", label: "In Progress", pct: 37, count: 66, color: "#006FEE" },
  { key: "resolved", label: "Resolved", pct: 22, count: 39, color: "#17C964" },
];

export type QueueStatus =
  | "Action Required"
  | "Resolved"
  | "In Progress"
  | "Deferred";

export type QueueRisk = "High" | "Low" | "Med" | "None";

export const queueRows: {
  name: string;
  id: string;
  department: string;
  risk: QueueRisk;
  action: string;
  assignee: string;
  team: string;
  due: string;
  status: QueueStatus;
}[] = [
  {
    name: "MRI Scanner A",
    id: "70AR911",
    department: "Radiology",
    risk: "High",
    action: "Schedule maintenance",
    assignee: "Alex Morgan",
    team: "Clinical Engineering",
    due: "Aug 26",
    status: "Action Required",
  },
  {
    name: "Infusion Pump #12",
    id: "23XR017",
    department: "ICU",
    risk: "Low",
    action: "Firmware update",
    assignee: "Jordan Patel",
    team: "Healthcare IT Systems",
    due: "Aug 28",
    status: "Resolved",
  },
  {
    name: "Ventilator #6",
    id: "B2XR58",
    department: "ER",
    risk: "High",
    action: "Safety inspection",
    assignee: "Chris Reynolds",
    team: "Device Operations",
    due: "Aug 28",
    status: "Action Required",
  },
  {
    name: "CT Scanner B",
    id: "F3US118",
    department: "Imaging",
    risk: "Med",
    action: "Performance review",
    assignee: "Devon Wright",
    team: "Clinical Engineering",
    due: "Aug 30",
    status: "In Progress",
  },
  {
    name: "Dialysis Unit #3",
    id: "3BUP971",
    department: "Nephrology",
    risk: "None",
    action: "Monitor trend",
    assignee: "Casey Liu",
    team: "Biomedical Engineering",
    due: "Sept 1",
    status: "Deferred",
  },
  {
    name: "Ultrasound Unit #7",
    id: "21MG458",
    department: "Imaging",
    risk: "Low",
    action: "Firmware update",
    assignee: "Jordan Patel",
    team: "Healthcare IT Systems",
    due: "Sept 1",
    status: "In Progress",
  },
];
