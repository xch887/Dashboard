import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dashboardTileOutline, dashboardTileShadow } from "@/lib/dashboard-surface";
import { CalendarClock } from "lucide-react";

type Deadline = {
  id: string;
  title: string;
  department: string;
  deviceCount: number;
  deviceLabel: string;
  detail: string;
  badge: string;
  badgeVariant: "danger" | "warning" | "success" | "info";
  barClass: string;
};

const DEADLINES: Deadline[] = [
  {
    id: "1",
    title: "MRI Suite A: Preventative Maintenance",
    department: "Radiology",
    deviceCount: 1,
    deviceLabel: "device",
    detail: "Impact: Imaging temporarily unavailable during coil inspection window.",
    badge: "High",
    badgeVariant: "danger",
    barClass: "bg-red-500",
  },
  {
    id: "2",
    title: "Infusion Pumps: Firmware Update",
    department: "ICU",
    deviceCount: 12,
    deviceLabel: "devices",
    detail: "Vendor security bundle — staged for after-hours push.",
    badge: "Medium",
    badgeVariant: "warning",
    barClass: "bg-amber-500",
  },
  {
    id: "3",
    title: "Ventilators: Safety Inspection",
    department: "ER",
    deviceCount: 6,
    deviceLabel: "devices",
    detail: "Regulatory inspection due — biomed sign-off required.",
    badge: "High",
    badgeVariant: "danger",
    barClass: "bg-red-500",
  },
  {
    id: "4",
    title: "Philips Ventilator Contract Renewal",
    department: "Procurement",
    deviceCount: 34,
    deviceLabel: "devices affected",
    detail: "Expires in 5 days — coverage: warranty lapses if not renewed.",
    badge: "Urgent",
    badgeVariant: "warning",
    barClass: "bg-amber-500",
  },
];

export function UpcomingMaintenanceDeadlines({
  compact = false,
}: {
  compact?: boolean;
}) {
  const rows = compact ? DEADLINES.slice(0, 3) : DEADLINES;

  return (
    <Card
      className={cn(
        "rounded-lg bg-white",
        dashboardTileOutline,
        dashboardTileShadow
      )}
    >
      <CardHeader
        className={cn(
          "border-b border-black/10",
          compact ? "pb-2 pt-3" : "pb-3"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle
              className={cn(
                "font-semibold text-slate-900",
                compact ? "text-sm" : "text-base"
              )}
            >
              Deadlines
            </CardTitle>
            <p
              className={cn(
                "text-slate-500",
                compact ? "mt-0.5 text-[11px]" : "mt-0.5 text-xs"
              )}
            >
              Upcoming biomedical work and contract windows
            </p>
          </div>
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200",
              compact ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <CalendarClock
              className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")}
              aria-hidden
            />
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn(compact ? "space-y-2 pt-2" : "space-y-3 pt-4")}>
        {rows.map((d, i) => (
          <div
            key={d.id}
            className={cn(
              "rounded-lg border border-black/15 bg-slate-50/80 shadow-[0_4px_18px_-8px_rgb(15_23_42/0.07)] transition-all duration-200",
              "hover:border-black/25 hover:shadow-[0_8px_24px_-10px_rgb(15_23_42/0.1)]",
              compact ? "p-2.5" : "p-3"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {d.department}
                </p>
                <h3
                  className={cn(
                    "mt-0.5 font-semibold text-slate-900",
                    compact ? "text-xs leading-snug" : "text-sm"
                  )}
                >
                  {d.title}
                </h3>
              </div>
              <Badge
                variant={
                  d.badgeVariant === "danger"
                    ? "danger"
                    : d.badgeVariant === "warning"
                      ? "warning"
                      : d.badgeVariant === "success"
                        ? "success"
                        : "info"
                }
                className="shrink-0 text-[10px] font-semibold"
              >
                {d.badge}
              </Badge>
            </div>
            <p
              className={cn(
                "mt-2 text-slate-600",
                compact
                  ? "line-clamp-2 text-[11px] leading-snug"
                  : "text-xs leading-relaxed"
              )}
            >
              {d.detail}
            </p>
            <div
              className={cn(
                "flex flex-wrap items-baseline gap-x-2 text-slate-600",
                compact ? "mt-1.5 text-[11px]" : "mt-2 text-xs"
              )}
            >
              <span className="font-semibold tabular-nums text-slate-900">
                {d.deviceCount}
              </span>
              <span>{d.deviceLabel}</span>
            </div>
            <div
              className={cn(
                "h-1 overflow-hidden rounded-full bg-slate-200",
                compact ? "mt-2" : "mt-3"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  d.barClass
                )}
                style={{
                  width: `${100 - i * 18}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
