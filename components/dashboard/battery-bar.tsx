import { cn } from "@/lib/utils";

/** Green &gt;60%, yellow 30–60%, red &lt;30% (MediSync+ tokens). */
export function BatteryBar({ pct }: { pct: number }) {
  const safe = Math.min(100, Math.max(0, pct));
  const bar =
    safe > 60
      ? "bg-emerald-500"
      : safe >= 30
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex min-w-[88px] max-w-[120px] flex-col gap-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-200",
            bar
          )}
          style={{ width: `${safe}%` }}
        />
      </div>
      <span className="text-[10px] font-medium tabular-nums text-slate-600">
        {safe}%
      </span>
    </div>
  );
}
