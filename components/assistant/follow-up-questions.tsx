import { cn } from "@/lib/utils";

export function FollowUpQuestions({
  questions,
  onSelect,
  disabled,
}: {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Suggested follow-ups
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(q)}
            className={cn(
              "motion-interactive max-w-full rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-left text-xs font-medium leading-snug text-slate-700 shadow-sm",
              "hover:border-blue-200/90 hover:bg-blue-50/55 hover:text-slate-900 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
              "active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
