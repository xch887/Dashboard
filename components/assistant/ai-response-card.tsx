import { Badge } from "@/components/ui/badge";
import type {
  AssistantStructuredResponse,
  SuggestedAction,
} from "@/lib/assistant/types";
import { cn } from "@/lib/utils";
import { FollowUpQuestions } from "@/components/assistant/follow-up-questions";
import { SuggestedActions } from "@/components/assistant/suggested-actions";

const confidenceStyles: Record<
  AssistantStructuredResponse["confidence"],
  string
> = {
  high: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  medium: "bg-amber-50 text-amber-950 ring-amber-200/70",
  low: "bg-slate-100 text-slate-700 ring-slate-200/80",
};

export function AIResponseCard({
  data,
  demo,
  pendingAction,
  onActionSelect,
  onActionConfirm,
  onActionCancel,
  onFollowUp,
  interactionsDisabled,
}: {
  data: AssistantStructuredResponse;
  demo?: boolean;
  pendingAction: SuggestedAction | null;
  onActionSelect: (action: SuggestedAction) => void;
  onActionConfirm: (action: SuggestedAction) => void;
  onActionCancel: () => void;
  onFollowUp: (q: string) => void;
  interactionsDisabled?: boolean;
}) {
  return (
    <article
      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.03] ring-1 ring-slate-100"
      aria-label="Assistant analysis"
    >
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
              confidenceStyles[data.confidence]
            )}
          >
            Confidence · {data.confidence}
          </span>
          {demo ? (
            <Badge
              variant="outline"
              className="border-amber-200/80 bg-amber-50/80 text-[10px] font-semibold text-amber-950"
            >
              Demo response
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          <span className="font-semibold text-slate-600">Reasoning scope:</span>{" "}
          {data.reasoning_label}
        </p>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Situation
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            {data.explanation}
          </p>
        </section>

        {data.likely_reasons.length > 0 ? (
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Contributing factors
            </h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
              {data.likely_reasons.map((r) => (
                <li key={r} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <SuggestedActions
          actions={data.suggested_actions}
          pendingAction={pendingAction}
          onSelect={onActionSelect}
          onConfirm={onActionConfirm}
          onCancel={onActionCancel}
          disabled={interactionsDisabled}
        />

        <FollowUpQuestions
          questions={data.follow_up_questions}
          onSelect={onFollowUp}
          disabled={interactionsDisabled}
        />
      </div>
    </article>
  );
}
