import { Button } from "@/components/ui/button";
import type { SuggestedAction } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";
import {
  Bell,
  FileBarChart,
  Filter,
  LineChart,
  UserPlus,
} from "lucide-react";

const workflowIcon = {
  generate_report: FileBarChart,
  notify_team: Bell,
  assign_issue: UserPlus,
  apply_filters: Filter,
  open_analytics: LineChart,
} as const;

const WORKFLOW_LABELS: Record<SuggestedAction["workflow"], string> = {
  generate_report: "Workflow · Report",
  notify_team: "Workflow · Notify",
  assign_issue: "Workflow · Assign",
  apply_filters: "Workflow · Filters",
  open_analytics: "Workflow · Analytics",
};

export function SuggestedActions({
  actions,
  pendingAction,
  onSelect,
  onConfirm,
  onCancel,
  disabled,
}: {
  actions: SuggestedAction[];
  pendingAction: SuggestedAction | null;
  onSelect: (action: SuggestedAction) => void;
  onConfirm: (action: SuggestedAction) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  if (actions.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Suggested actions
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {actions.map((a) => {
          const Icon = workflowIcon[a.workflow];
          const isPending = pendingAction?.id === a.id;
          return (
            <li key={a.id}>
              <div
                className={cn(
                  "group motion-interactive rounded-xl border bg-white px-3 py-2.5 ring-1 transition-[background-color,border-color,box-shadow] duration-150",
                  isPending
                    ? "border-blue-200 ring-blue-100"
                    : cn(
                        "border-slate-200/90 ring-slate-100",
                        "hover:border-[#2859C5]/[0.25] hover:bg-blue-50/40 hover:ring-[#2859C5]/[0.12]",
                        "hover:shadow-[inset_0_0_0_1px_rgb(40_89_197/0.08)]"
                      )
                )}
              >
                <div className="flex flex-wrap items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-[background-color,color,box-shadow] duration-150",
                      isPending
                        ? "bg-blue-50 text-[#2859C5] ring-blue-200/80"
                        : "bg-slate-50 text-slate-600 ring-slate-200/80 group-hover:bg-[#2859C5]/[0.1] group-hover:text-[#2859C5] group-hover:ring-[#2859C5]/[0.2]"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-[#1e4aa8]">
                      {a.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                      {a.description}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 transition-colors group-hover:text-[#2859C5]">
                      {WORKFLOW_LABELS[a.workflow]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isPending ? "outline" : "default"}
                    className={cn(
                      "h-8 shrink-0 px-3 text-xs font-semibold shadow-none active:scale-[0.98]",
                      isPending
                        ? "border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
                        : cn(
                            "border-transparent bg-[#2859C5] text-white",
                            "hover:bg-[#1e4aa8]",
                            "group-hover:bg-[#1e4aa8]"
                          )
                    )}
                    disabled={disabled}
                    onClick={() => onSelect(a)}
                  >
                    {isPending ? "Review…" : "Run"}
                  </Button>
                </div>
                {isPending && pendingAction ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <p className="min-w-0 flex-1 text-[11px] text-slate-600">
                      Confirm{" "}
                      <span className="font-semibold text-slate-900">
                        {pendingAction.label}
                      </span>{" "}
                      in your workflow?
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 shadow-none"
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border-transparent bg-[#2859C5] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#1e4aa8] active:scale-[0.98]"
                      onClick={() => onConfirm(pendingAction)}
                    >
                      Confirm
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
