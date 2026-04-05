"use client";

import { Button } from "@/components/ui/button";
import { Clock, Cpu, ShieldAlert, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type AttentionItem = {
  id: string;
  title: string;
  context: string;
  urgency: "critical" | "soon" | "plan";
  countdown: string;
  actionLabel: string;
};

const ITEMS: AttentionItem[] = [
  {
    id: "1",
    title: "MRI Scanner A — PM overdue",
    context: "Radiology · Joint Commission window",
    urgency: "critical",
    countdown: "OVERDUE · 1 day",
    actionLabel: "Schedule now",
  },
  {
    id: "2",
    title: "Ventilator #6 — safety inspection",
    context: "ER · Regulatory due today",
    urgency: "critical",
    countdown: "Due in 4 hours",
    actionLabel: "Start inspection",
  },
  {
    id: "3",
    title: "ICU infusion fleet — battery swap batch",
    context: "14 devices below 30%",
    urgency: "soon",
    countdown: "Due today",
    actionLabel: "Schedule batch",
  },
  {
    id: "4",
    title: "CT Scanner B — telemetry gap",
    context: "Imaging · No sync 6 hr",
    urgency: "soon",
    countdown: "Due tomorrow",
    actionLabel: "Dispatch tech",
  },
  {
    id: "5",
    title: "Philips contract renewal",
    context: "34 devices · Warranty lapse risk",
    urgency: "plan",
    countdown: "5 days left",
    actionLabel: "Review contract",
  },
];

const tone: Record<
  AttentionItem["urgency"],
  { bar: string; badge: string; icon: typeof ShieldAlert }
> = {
  critical: {
    bar: "bg-rose-500",
    badge: "bg-rose-100 text-rose-900 ring-rose-200/80",
    icon: ShieldAlert,
  },
  soon: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-950 ring-amber-200/80",
    icon: Clock,
  },
  plan: {
    bar: "bg-slate-300",
    badge: "bg-slate-100 text-slate-700 ring-slate-200/80",
    icon: Wrench,
  },
};

export function DashboardAttentionToday({
  onAction,
}: {
  onAction?: (message: string) => void;
}) {
  return (
    <section
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-200/50 sm:p-5"
      aria-labelledby="attention-today-heading"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Start here
          </p>
          <h2
            id="attention-today-heading"
            className="mt-1 text-lg font-bold tracking-tight text-slate-950"
          >
            Good morning — here&apos;s what needs you today
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Sorted by patient impact and regulatory due windows.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Cpu className="h-3.5 w-3.5" aria-hidden />
          <span>Priority queue · demo data</span>
        </div>
      </div>
      <ul className="space-y-2.5">
        {ITEMS.map((item, i) => {
          const t = tone[item.urgency];
          const Icon = t.icon;
          return (
            <li
              key={item.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 shadow-sm ring-1 ring-slate-100 transition-shadow duration-200 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                "hover:shadow-md",
                i === 0 && "border-rose-100/80 bg-rose-50/30 ring-rose-100/60"
              )}
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <span
                  className={cn("mt-0.5 h-10 w-1 shrink-0 rounded-full", t.bar)}
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                        t.badge
                      )}
                    >
                      {item.countdown}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.context}</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className={cn(
                  "h-9 shrink-0 font-semibold sm:min-w-[128px]",
                  item.urgency === "critical"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() =>
                  onAction?.(`${item.actionLabel} · ${item.title.slice(0, 28)}…`)
                }
              >
                {item.actionLabel}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
