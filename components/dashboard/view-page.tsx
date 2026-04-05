import { cn } from "@/lib/utils";

/** Standard vertical rhythm for every app route (below header). */
export const VIEW_PAGE_CLASS = "w-full min-w-0 space-y-6";

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
