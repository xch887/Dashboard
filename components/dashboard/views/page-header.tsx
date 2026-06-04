import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { dashboardPageHeaderInset } from "@/lib/dashboard-surface";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode | null;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between lg:gap-4",
        dashboardPageHeaderInset
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/20"
          )}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </div>
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-balance text-lg font-bold tracking-tight text-slate-950 md:text-xl">
            {title}
          </h1>
          <p className="text-pretty text-xs leading-relaxed text-slate-600 md:text-sm">
            {description}
          </p>
        </div>
      </div>
      {actions != null ? (
        <div className="flex shrink-0 flex-wrap gap-2 pr-2.5 sm:pr-3">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
