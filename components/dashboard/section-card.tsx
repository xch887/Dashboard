import { cn } from "@/lib/utils";

/**
 * Shared surfaces — one border, one radius, minimal shadow.
 * Prefer these over ad-hoc rounded-2xl / ring / bg-white/85 combos.
 */

const panelBase =
  "rounded-xl border border-slate-200 bg-white shadow-sm";

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
    <Comp className={cn(panelBase, "p-4 sm:p-5", className)} {...props}>
      {children}
    </Comp>
  );
}

type StatTone = "default" | "critical" | "warning";

const statTones: Record<StatTone, string> = {
  default: "border-slate-200 bg-white",
  critical: "border-rose-200 bg-rose-50/40",
  warning: "border-amber-200 bg-amber-50/35",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className,
  children,
  ...props
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  const hasTone = tone !== "default";
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 shadow-sm transition-shadow duration-200",
        "hover:shadow-md",
        statTones[tone],
        className
      )}
      {...props}
    >
      {hasTone && (
        <span
          className={cn(
            "absolute bottom-3 left-0 top-3 w-1 rounded-full",
            tone === "critical" ? "bg-rose-500" : "bg-amber-500"
          )}
          aria-hidden
        />
      )}
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          tone === "critical" && "text-rose-900",
          tone === "warning" && "text-amber-950",
          tone === "default" && "text-slate-500"
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
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
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
        "rounded-xl border border-blue-200/70 bg-gradient-to-b from-blue-50/50 to-white p-4 shadow-sm sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
