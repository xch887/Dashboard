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
                  "motion-interactive rounded-xl border bg-white px-3 py-2.5 shadow-sm ring-1",
                  isPending
                    ? "border-blue-200 ring-blue-100"
                    : "border-slate-200/90 ring-slate-100 hover:border-slate-300/90 hover:shadow-md hover:ring-slate-200/90"
                )}
              >
                <div className="flex flex-wrap items-start gap-2">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200/80">
                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {a.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                      {a.description}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {WORKFLOW_LABELS[a.workflow]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isPending ? "secondary" : "default"}
                    className={cn(
                      "h-8 shrink-0 font-semibold active:scale-[0.98]",
                      !isPending && "bg-slate-900 hover:bg-slate-800"
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
                      className="h-8"
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 bg-blue-600 font-semibold hover:bg-blue-700"
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
