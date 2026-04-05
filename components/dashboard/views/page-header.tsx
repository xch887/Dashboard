import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  eyebrow = "Workspace",
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode | null;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="flex min-w-0 gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            "bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/20"
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {eyebrow}
          </p>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            {title}
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-slate-600 md:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {actions != null ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
