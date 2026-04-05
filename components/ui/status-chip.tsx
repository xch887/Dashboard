import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChipVariant =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral"
  | "process";

export function StatusChip({
  variant,
  icon: Icon,
  children,
  className,
}: {
  variant: ChipVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant={variant} className={cn(className)}>
      {Icon ? <Icon strokeWidth={2} aria-hidden /> : null}
      {children}
    </Badge>
  );
}

/** Priority column: thick left bar + label (hospital pre-cert style). */
export function PriorityStrip({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const bar =
    level === "High"
      ? "bg-rose-500"
      : level === "Med"
        ? "bg-amber-500"
        : level === "Low"
          ? "bg-orange-500"
          : "bg-slate-300";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn("h-5 w-1 shrink-0 rounded-sm", bar)}
        aria-hidden
      />
      <span className="text-xs font-medium text-slate-800">{level}</span>
    </div>
  );
}
