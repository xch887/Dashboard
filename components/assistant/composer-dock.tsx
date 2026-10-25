"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOTION_DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  loadAIResponseFeedback,
  saveAIResponseFeedback,
  trackAIResponseFeedback,
} from "@/lib/assistant/feedback";
import { ArrowUp, History, ImagePlus, Mic, Paperclip, ThumbsDown, ThumbsUp } from "lucide-react";

const RECENT_KEY = "med-dash-intelligence-recent";

const SEEDED_RECENT = [
  "Who owns Ventilator #6 safety inspection?",
  "Show offline devices on 4 West",
];

/** Named lookups — what someone would actually type, not a second briefing. */
const LOOKUPS = [
  {
    name: "Ventilator #6",
    hint: "Open inspection — who owns it",
    prompt: "Who owns the open safety inspection on Ventilator #6?",
  },
  {
    name: "ICU West pumps",
    hint: "Retries since firmware v2.14",
    prompt: "Show ICU West pump retries compared with east ICU since v2.14.",
  },
  {
    name: "MRI Suite A",
    hint: "Open PM before Joint Commission",
    prompt: "What is still open on MRI Suite A PM, and when is the next window?",
  },
] as const;

const TONIGHT = [
  {
    name: "On-call Biomed",
    hint: "Who takes 4 West before first case",
    prompt: "Who is on call for Clinical Engineering if 4 West pages before first case?",
  },
  {
    name: "Overdue tonight",
    hint: "PM and cal that cannot slip",
    prompt: "What PM and calibration work cannot slip before first case?",
  },
  {
    name: "4 West offline",
    hint: "Devices down on that floor",
    prompt: "Which devices are offline on 4 West right now?",
  },
] as const;

/** Phrase chips — one-tap asks, same voice as a typed question. */
const SUGGESTED_CHIPS = [
  {
    label: "Tonight's shift priorities",
    prompt: "What should Clinical Engineering prioritize before tonight's shift?",
  },
  {
    label: "Open risk summary",
    prompt: "Summarize open risk across the fleet that needs action tonight.",
  },
  {
    label: "PM compliance this week",
    prompt: "How is PM compliance this week versus the 95% goal?",
  },
] as const;

const sendButtonClass =
  "h-8 w-8 shrink-0 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97] disabled:opacity-40";

function readRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeRecent(prompt: string) {
  const next = [prompt, ...readRecent().filter((item) => item !== prompt)].slice(
    0,
    5
  );
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function ComposerDock({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
  showPhiNote = false,
  expandable = false,
  onOpenHistory,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (text?: string) => void;
  disabled: boolean;
  placeholder: string;
  showPhiNote?: boolean;
  expandable?: boolean;
  onOpenHistory?: () => void;
}) {
  const dockRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const collapse = useCallback(() => {
    setExpanded(false);
  }, []);

  const expand = useCallback(() => {
    if (!expandable) return;
    setExpanded(true);
  }, [expandable]);

  useEffect(() => {
    if (!expanded) return;
    const onPointer = (event: MouseEvent) => {
      if (!dockRef.current?.contains(event.target as Node)) {
        collapse();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") collapse();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded, collapse]);

  const submit = useCallback(
    (text?: string) => {
      const next = (text ?? value).trim();
      if (!next || disabled) return;
      setRecent(writeRecent(next));
      collapse();
      onSend(text ? next : undefined);
    },
    [collapse, disabled, onSend, value]
  );

  const recentItems = recent.length > 0 ? recent : SEEDED_RECENT;
  const durationMs = reduceMotion ? 0 : MOTION_DURATION.slow * 1000;

  const open = expandable && expanded;

  return (
    <div
      ref={dockRef}
      className="relative z-20 isolate shrink-0 bg-white"
    >
      {expandable ? (
      <div
        className={cn(
          "absolute inset-x-0 bottom-full z-30 overflow-hidden bg-white",
          open &&
            "border-t border-slate-200/90 shadow-[0_-16px_40px_-12px_rgb(15_23_42/0.28)]"
        )}
      >
      <div
        className="grid bg-white transition-[grid-template-rows]"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionDuration: `${durationMs}ms`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="min-h-0 overflow-hidden bg-white" aria-hidden={!open} inert={open ? undefined : true}>
          <div className="max-h-[min(22rem,46vh)] space-y-4 overflow-y-auto bg-white px-4 pt-4 sm:px-6">
            <p className="text-[12px] leading-snug text-slate-500">
              Type a device, a unit, or an owner. Forks live in Needs a decision.
              Standing jobs live in Workflows.
            </p>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Try asking
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTED_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => submit(chip.prompt)}
                    className={cn(
                      "motion-interactive rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700",
                      "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Look up
              </p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {LOOKUPS.map((item) => (
                  <li key={item.name}>
                    <PromptRow
                      promptId={`composer-prompt:${item.name}`}
                      eyebrow={item.name}
                      label={item.hint}
                      onSelect={() => submit(item.prompt)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                On the floor tonight
              </p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {TONIGHT.map((item) => (
                  <li key={item.name}>
                    <PromptRow
                      promptId={`composer-prompt:${item.name}`}
                      eyebrow={item.name}
                      label={item.hint}
                      onSelect={() => submit(item.prompt)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {recent.length > 0 ? "You asked" : "On this station"}
              </p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {recentItems.map((item) => (
                  <li key={item}>
                    <PromptRow
                      promptId={`composer-prompt:${item}`}
                      label={item}
                      onSelect={() => submit(item)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
      </div>
      ) : null}

      <div
        className={cn(
          "relative z-30 border-t border-slate-200/90 bg-white px-4 sm:px-6",
          expandable ? "py-4 sm:py-5" : "py-3 sm:py-3.5"
        )}
      >
        <div
          className={cn(
            "flex w-full gap-0.5 rounded-xl border bg-white px-1.5 py-1",
            open ? "items-end" : "items-center",
            open
              ? "border-blue-300 ring-2 ring-blue-500/20"
              : "border-slate-200/90 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20"
          )}
        >
          <ComposerChromeIcon
            label="Briefings"
            onActivate={() => {
              collapse();
              onOpenHistory?.();
            }}
          >
            <History strokeWidth={1.75} />
          </ComposerChromeIcon>
          <textarea
            ref={fieldRef}
            rows={open ? 3 : 1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={expand}
            onClick={expand}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "block min-w-0 flex-1 resize-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50",
              open
                ? "py-1.5 leading-snug"
                : "h-8 overflow-hidden py-0 leading-8"
            )}
          />
          <ComposerChromeIcon
            label="Attach file"
            onActivate={() => {
              expand();
              fieldRef.current?.focus();
            }}
          >
            <Paperclip strokeWidth={1.75} />
          </ComposerChromeIcon>
          <ComposerChromeIcon
            label="Add image"
            onActivate={() => {
              expand();
              fieldRef.current?.focus();
            }}
          >
            <ImagePlus strokeWidth={1.75} />
          </ComposerChromeIcon>
          <ComposerChromeIcon
            label="Voice input"
            onActivate={() => {
              expand();
              fieldRef.current?.focus();
            }}
          >
            <Mic strokeWidth={1.75} />
          </ComposerChromeIcon>
          <Button
            type="button"
            size="icon"
            onClick={() => submit()}
            disabled={!value.trim() || disabled}
            className={sendButtonClass}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
          </Button>
        </div>
        {showPhiNote ? (
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Responses are generated server-side. Do not paste PHI.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ComposerChromeIcon({
  label,
  onActivate,
  children,
}: {
  label: string;
  onActivate: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onActivate}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
    >
      <span className="[&_svg]:h-4 [&_svg]:w-4">{children}</span>
    </button>
  );
}

function PromptRow({
  promptId,
  eyebrow,
  label,
  onSelect,
}: {
  promptId: string;
  eyebrow?: string;
  label: string;
  onSelect: () => void;
}) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const stored = loadAIResponseFeedback(promptId);
    if (!stored) return;
    setVote(stored.helpful ? "up" : "down");
  }, [promptId]);

  const voteOn = (helpful: boolean) => {
    const next = helpful ? "up" : "down";
    setVote(next);
    const feedback = {
      responseId: promptId,
      helpful,
      source: "composer-prompt" as const,
      timestamp: new Date().toISOString(),
    };
    saveAIResponseFeedback(feedback);
    trackAIResponseFeedback(feedback);
  };

  return (
    <div
      className={cn(
        "group flex w-full items-start gap-2 rounded-md px-2 py-1.5",
        "hover:bg-slate-50",
        "focus-within:bg-slate-50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="motion-interactive min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35"
      >
        {eyebrow ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2859C5]">
            {eyebrow}
          </span>
        ) : null}
        <span className="block text-[13px] leading-snug text-slate-700">
          {label}
        </span>
      </button>
      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5 pt-0.5",
          vote
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        <PromptVoteButton
          label="This is useful"
          pressed={vote === "up"}
          onClick={() => voteOn(true)}
        >
          <ThumbsUp strokeWidth={1.75} />
        </PromptVoteButton>
        <PromptVoteButton
          label="This isn't useful"
          pressed={vote === "down"}
          down
          onClick={() => voteOn(false)}
        >
          <ThumbsDown strokeWidth={1.75} />
        </PromptVoteButton>
      </div>
    </div>
  );
}

function PromptVoteButton({
  label,
  pressed,
  down,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  down?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
        pressed
          ? down
            ? "bg-rose-50 text-rose-700"
            : "bg-emerald-50 text-emerald-700"
          : "text-slate-400 hover:bg-white hover:text-slate-700"
      )}
    >
      <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{children}</span>
    </button>
  );
}
