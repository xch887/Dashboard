"use client";

import { Button } from "@/components/ui/button";
import { Battery, FileWarning, RefreshCw, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Suggestion = {
  id: string;
  title: string;
  body: string;
  action: string;
  icon: typeof Battery;
  accent: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: "batt",
    title: "ICU battery cluster",
    body: "5 devices in ICU have batteries below 30%. Schedule a bulk swap before shift change?",
    action: "Schedule all",
    icon: Battery,
    accent: "bg-amber-50 text-amber-900 ring-amber-200/80",
  },
  {
    id: "fw",
    title: "Ventilator firmware gap",
    body: "Ventilator #6 is 3 versions behind. A security patch is available on the vendor channel.",
    action: "Push update",
    icon: RefreshCw,
    accent: "bg-sky-50 text-sky-900 ring-sky-200/80",
  },
  {
    id: "pm",
    title: "PM completion dip",
    body: "Preventative maintenance completion dropped 8% this month. 12 tasks are overdue in Radiology.",
    action: "View overdue",
    icon: TrendingDown,
    accent: "bg-rose-50 text-rose-900 ring-rose-200/80",
  },
  {
    id: "contract",
    title: "Philips warranty cliff",
    body: "Contract expires in 5 days. 34 devices will lose warranty coverage without renewal.",
    action: "Review contract",
    icon: FileWarning,
    accent: "bg-violet-50 text-violet-900 ring-violet-200/80",
  },
];

export function DashboardSuggestedActions({
  onAction,
}: {
  onAction?: (message: string) => void;
}) {
  return (
    <section
      className="space-y-3"
      aria-labelledby="suggested-actions-heading"
    >
      <div>
        <h2
          id="suggested-actions-heading"
          className="text-sm font-bold text-slate-900"
        >
          Suggested next steps
        </h2>
        <p className="text-xs text-slate-500">
          Prioritized from telemetry, PM backlog, and vendor signals.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={cn(
                "flex flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow duration-200",
                "hover:shadow-md"
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-9 w-9 items-center justify-center rounded-xl ring-1",
                  s.accent
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </div>
              <p className="text-sm font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">
                {s.body}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3 h-8 w-full font-semibold"
                variant="secondary"
                onClick={() => onAction?.(`${s.action} — ${s.title}`)}
              >
                {s.action}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
