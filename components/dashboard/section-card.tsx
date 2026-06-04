import { cn } from "@/lib/utils";
import { dashboardCardClass } from "@/lib/dashboard-surface";

/**
 * Shared dashboard surfaces — borderless cards with soft lift.
 */

export const sectionPanelClass = dashboardCardClass;

const panelBase = sectionPanelClass;

export function SectionCard({
  children,
  className,
  as: Comp = "div",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Comp className={cn(panelBase, "p-5 sm:p-6", className)} {...props}>
      {children}
    </Comp>
  );
}

type StatTone = "default" | "critical" | "warning";

const statTones: Record<StatTone, string> = {
  default: "border-slate-200 bg-white",
  critical: "border-red-200 bg-red-50/40",
  warning: "border-amber-200 bg-amber-50/35",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  labelStyle = "uppercase",
  className,
  children,
  ...props
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  labelStyle?: "uppercase" | "default";
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  const hasTone = tone !== "default";
  return (
    <div
      className={cn(
        "relative p-5 transition-shadow duration-200 sm:p-6",
        dashboardCardClass,
        "hover:shadow-[0_16px_48px_-14px_rgb(99_102_241/0.14)]",
        tone === "default" && "border-0",
        tone !== "default" && "border",
        statTones[tone],
        className
      )}
      {...props}
    >
      {hasTone && (
        <span
          className={cn(
            "absolute bottom-3 left-0 top-3 w-1 rounded-full",
            tone === "critical" ? "bg-red-600" : "bg-amber-500"
          )}
          aria-hidden
        />
      )}
      <p
        className={cn(
          labelStyle === "uppercase" &&
            "text-[10px] font-semibold uppercase tracking-wide",
          labelStyle === "default" && "text-xs font-medium text-slate-600",
          labelStyle === "uppercase" && tone === "critical" && "text-red-900",
          labelStyle === "uppercase" && tone === "warning" && "text-amber-950",
          labelStyle === "uppercase" && tone === "default" && "text-slate-500"
        )}
      >
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}

export function TableCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", dashboardCardClass, className)}>
      <div className="flex flex-col gap-1 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function HighlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "border border-blue-200/70 bg-gradient-to-b from-blue-50/50 to-white p-5 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
