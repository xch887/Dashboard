"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssistantStructuredResponse } from "@/lib/assistant/types";
import { formatListTimestamp } from "@/lib/browser-clock";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trash2 } from "lucide-react";

type ChatTimeOffset =
  | { minutesAgo: number }
  | { daysAgo: number; hour: number; minute: number };

export type PastChat = {
  id: string;
  title: string;
  preview: string;
  group: "Today" | "Yesterday" | "This week";
  userText: string;
  structured: AssistantStructuredResponse;
  time: ChatTimeOffset;
};

export const PAST_CHATS: PastChat[] = [
  {
    id: "pm-gap",
    title: "PM gap before Joint Commission",
    time: { minutesAgo: 14 },
    preview: "78% completion vs 95% goal — Radiology and ICU West first.",
    group: "Today",
    userText: "What would close the PM gap from 78% to 95% this week?",
    structured: {
      explanation:
        "PM completion is 78% against a 95% target. Radiology MRI Suite A and ICU West infusion pumps account for most of the remaining window.",
      likely_reasons: [
        "MRI Suite A preventative maintenance is still open",
        "ICU West firmware work is competing with PM slots",
        "Joint Commission window is pulling report time away from floor work",
      ],
      reasoning_label: "PM ledger + department queue",
      confidence: "high",
      suggested_actions: [
        {
          id: "report-pm",
          label: "Generate PM gap report",
          workflow: "generate_report",
          description: "Leadership pack of overdue PMs by department.",
        },
      ],
      follow_up_questions: [
        "Which techs are free after first case?",
        "What slips if MRI Suite A is pulled forward?",
      ],
    },
  },
  {
    id: "icu-retry",
    title: "ICU West pump retries",
    time: { minutesAgo: 51 },
    preview: "Retry rate 12.4% after firmware v2.14 — east ICU is quiet.",
    group: "Today",
    userText: "Summarize the ICU West pump retry spike.",
    structured: {
      explanation:
        "ICU West pumps are retrying 3.2× the pre-update baseline after firmware v2.14. East ICU did not move — localized to that rollout.",
      likely_reasons: [
        "Firmware v2.14 rolled out six days ago",
        "No matching spike in battery or connectivity",
        "East ICU control group remains at baseline",
      ],
      reasoning_label: "Telemetry · firmware log",
      confidence: "high",
      suggested_actions: [
        {
          id: "diag",
          label: "Schedule diagnostic",
          workflow: "assign_issue",
          description: "Hand the ICU West cluster to biomed for tonight.",
        },
      ],
      follow_up_questions: [
        "How many pumps are still on v2.14?",
        "Should we pause the remaining rollout?",
      ],
    },
  },
  {
    id: "or-delay",
    title: "OR recovery staffing",
    time: { daysAgo: 1, hour: 21, minute: 14 },
    preview: "Block running +38 min with two RNs below coverage.",
    group: "Yesterday",
    userText: "What should we do about tonight’s OR delay risk?",
    structured: {
      explanation:
        "The main OR block is 38 minutes past plan and recovery is two RNs short. Three cases are still queued above Tuesday baseline length.",
      likely_reasons: [
        "Case mix longer than the six-week Tuesday pattern",
        "Recovery roster is two below the coverage model",
        "No float pool tagged for this block",
      ],
      reasoning_label: "OR schedule · roster",
      confidence: "medium",
      suggested_actions: [
        {
          id: "staff",
          label: "Reallocate staff",
          workflow: "notify_team",
          description: "Page recovery for a float before first case.",
        },
      ],
      follow_up_questions: [
        "Who can float from PACU?",
        "Which case is safest to hold?",
      ],
    },
  },
  {
    id: "cal-drift",
    title: "4 West calibration drift",
    time: { daysAgo: 3, hour: 11, minute: 42 },
    preview: "Four sensors past ±2% vendor band, last cal 92 days ago.",
    group: "This week",
    userText: "Review the 4 West calibration cluster.",
    structured: {
      explanation:
        "Four telemetry sensors on 4 West exceed the ±2% vendor band. Drift accelerated over 14 days and last vendor calibration was 92 days ago.",
      likely_reasons: [
        "Cluster is wing-local, not hospital-wide",
        "90-day PM window is already edged",
        "Vendor baseline has not been refreshed",
      ],
      reasoning_label: "Cal records · vendor baseline",
      confidence: "medium",
      suggested_actions: [
        {
          id: "cal-q",
          label: "Open calibration queue",
          workflow: "open_analytics",
          description: "Filter 4 West sensors past tolerance.",
        },
      ],
      follow_up_questions: [
        "Can biomed batch the four sensors tonight?",
        "Is there a loaner set on the floor?",
      ],
    },
  },
];

const GROUPS: PastChat["group"][] = ["Today", "Yesterday", "This week"];

function dateFromOffset(offset: ChatTimeOffset, now: Date): Date {
  const date = new Date(now);
  if ("minutesAgo" in offset) {
    date.setMinutes(date.getMinutes() - offset.minutesAgo);
    return date;
  }
  date.setDate(date.getDate() - offset.daysAgo);
  date.setHours(offset.hour, offset.minute, 0, 0);
  return date;
}

export function ChatHistoryPanel({
  onBack,
  onOpenChat,
}: {
  onBack: () => void;
  onOpenChat: (chat: PastChat) => void;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [items, setItems] = useState(PAST_CHATS);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const stamps = useMemo(() => {
    if (!now) return {};
    return Object.fromEntries(
      items.map((chat) => [
        chat.id,
        formatListTimestamp(dateFromOffset(chat.time, now), now),
      ])
    ) as Record<string, string>;
  }, [items, now]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Briefings</h2>
          <p className="text-[11px] text-slate-500">
            Earlier Intelligence reviews
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500 sm:px-6">
            No saved briefings on this station.
          </p>
        ) : null}
        {GROUPS.map((group) => {
          const grouped = items.filter((chat) => chat.group === group);
          if (grouped.length === 0) return null;
          return (
            <section key={group} className="mb-2 last:mb-0">
              <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:px-6">
                {group}
              </p>
              <ul>
                {grouped.map((chat) => (
                  <li key={chat.id}>
                    <div
                      className={cn(
                        "group flex w-full items-start gap-3 px-5 py-3.5 sm:px-6",
                        "hover:bg-slate-50",
                        "focus-within:bg-slate-50"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenChat(chat)}
                        className="motion-interactive min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                      >
                        <span className="block truncate text-[13px] font-semibold text-slate-900">
                          {chat.title}
                        </span>
                        <span className="mt-1 block line-clamp-2 text-[12px] leading-snug text-slate-500">
                          {chat.preview}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1 pt-0.5">
                        <span className="text-[11px] tabular-nums text-slate-400">
                          {stamps[chat.id] ?? ""}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${chat.title}`}
                          title="Remove"
                          onClick={(event) => {
                            event.stopPropagation();
                            setItems((prev) =>
                              prev.filter((item) => item.id !== chat.id)
                            );
                          }}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400",
                            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                            "hover:bg-white hover:text-rose-700",
                            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
