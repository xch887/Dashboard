import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks copy that reads as model- or AI-assisted operational insight. */
export function InsightBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-blue-200/90 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-800",
        className
      )}
    >
      <Sparkles className="h-3 w-3 shrink-0 text-blue-600" aria-hidden />
      <span aria-hidden>Insight</span>
      <span className="sr-only">AI-assisted operational insight</span>
    </span>
  );
}
