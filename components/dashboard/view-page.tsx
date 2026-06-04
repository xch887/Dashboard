import { cn } from "@/lib/utils";
import { dashboardCardStackGap } from "@/lib/dashboard-surface";

/** Standard vertical rhythm for every app route (below header). */
export const VIEW_PAGE_CLASS = cn("w-full min-w-0", dashboardCardStackGap);

export function ViewPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(VIEW_PAGE_CLASS, className)}>{children}</div>;
}

/** In-card section heading (h2). */
export const sectionHeadingClass = "text-sm font-semibold text-slate-900";

/** Secondary line under headings. */
export const sectionDescriptionClass = "text-xs text-slate-500";
