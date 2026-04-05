import { FileBarChart, Filter, Radio, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Full prompts for cards; `chip` is the compact label shown under the search bar. */
export const ASSISTANT_PROMPT_OPTIONS = [
  {
    chip: "Tonight’s shift priorities",
    prompt:
      "What should Clinical Engineering prioritize before tonight’s shift?",
  },
  {
    chip: "Open risk summary",
    prompt:
      "Summarize open risk: offline devices, firmware gaps, and overdue PM.",
  },
  {
    chip: "PM compliance this week",
    prompt:
      "Which departments are most likely to breach PM compliance this week?",
  },
] as const;

export function EmptyState({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (text: string) => void;
}) {
  return (
    <div className="w-full space-y-6 text-center sm:space-y-7">
      <div className="grid gap-2 text-left sm:gap-2.5">
        {ASSISTANT_PROMPT_OPTIONS.map(({ prompt }) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectSuggestion(prompt)}
            className={cn(
              "motion-interactive rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-100 sm:px-4 sm:py-3",
              "hover:border-blue-200/90 hover:bg-blue-50/50 hover:text-slate-900 hover:shadow-md hover:ring-blue-100/80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
            )}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-6 sm:pt-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Example workflows
        </p>
        <ul className="mt-3 grid gap-2 text-left text-xs text-slate-600 sm:mt-4 sm:grid-cols-2 sm:gap-2.5">
          <li className="flex gap-2 rounded-lg bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100">
            <FileBarChart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Generate compliance or executive reports</span>
          </li>
          <li className="flex gap-2 rounded-lg bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100">
            <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Notify on-call or department channels</span>
          </li>
          <li className="flex gap-2 rounded-lg bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100">
            <UserPlus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Assign or escalate an issue</span>
          </li>
          <li className="flex gap-2 rounded-lg bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100">
            <Filter className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Apply saved views and analytics</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
