"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CompactAssistantLoading } from "@/components/assistant/loading-state";
import type {
  ApiAssistantResponse,
  AssistantStructuredResponse,
} from "@/lib/assistant/types";
import {
  formatIntelligenceFabSummary,
  intelligenceThreadToApiMessages,
} from "@/lib/assistant/to-api-messages";
import { motionTransition } from "@/lib/motion";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FabMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      structured: AssistantStructuredResponse;
      demo?: boolean;
    };

export function AssistantFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FabMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollListToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (fabRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (pathname === "/assistant") setOpen(false);
  }, [pathname]);

  if (pathname === "/assistant") return null;

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setError(null);

    const userMsg: FabMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setLoading(true);
    scrollListToEnd();

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: intelligenceThreadToApiMessages(
            nextThread.map((m) =>
              m.role === "user"
                ? { role: "user", text: m.text }
                : { role: "assistant", structured: m.structured }
            )
          ),
        }),
      });
      const json = (await res.json()) as ApiAssistantResponse;

      if (!json.ok) {
        setError(json.error ?? "Request failed");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          structured: json.structured,
          demo: json.demo === true,
        },
      ]);
      scrollListToEnd();
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  const composerRing =
    "rounded-full border border-slate-200/90 transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] focus-within:border-blue-300/80 focus-within:shadow-[0_0_0_3px_rgb(59_130_246/0.1)]";

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="assistant-popover"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby="fab-intelligence-title"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.98 }
            }
            transition={motionTransition(reduceMotion, "base")}
            className={cn(
              "fixed z-[61] flex w-[min(calc(100vw-3rem),22rem)] max-h-[min(70vh,26rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgb(15_23_42/0.25)]",
              "bottom-[5.75rem] right-6 sm:right-6"
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 bg-white px-3 py-3">
              <div className="min-w-0">
                <h2
                  id="fab-intelligence-title"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-900"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Sparkles
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                  Intelligence
                </h2>
                <p className="mt-1 line-clamp-2 pl-9 text-xs leading-snug text-slate-500">
                  {pathname || "/"} — same model as{" "}
                  <Link
                    href="/assistant"
                    className="font-medium text-blue-700 underline-offset-2 hover:underline"
                  >
                    full Intelligence
                  </Link>
                  .
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close Intelligence"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-slate-50/40 px-3 py-3"
            >
              {error ? (
                <p
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs leading-snug text-rose-900"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <motion.p
                    key="empty-hint"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={motionTransition(reduceMotion, "fast")}
                    className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-xs leading-relaxed text-slate-500"
                  >
                    Ask about this screen. Without{" "}
                    <code className="rounded bg-slate-100 px-1 py-px text-[10px] text-slate-700">
                      OPENAI_API_KEY
                    </code>{" "}
                    you get demo answers; add it in{" "}
                    <code className="rounded bg-slate-100 px-1 py-px text-[10px] text-slate-700">
                      .env.local
                    </code>{" "}
                    for live responses.
                  </motion.p>
                ) : null}
              </AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={motionTransition(reduceMotion, "fast")}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed",
                      m.role === "user"
                        ? "border border-blue-600 bg-white text-slate-900 shadow-sm"
                        : "border border-slate-200 bg-white text-slate-800"
                    )}
                  >
                    {m.role === "user" ? (
                      m.text
                    ) : (
                      <div className="space-y-1.5">
                        {m.demo ? (
                          <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                            Demo
                          </span>
                        ) : null}
                        <p className="whitespace-pre-wrap">
                          {formatIntelligenceFabSummary(m.structured)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <AnimatePresence initial={false}>
                {loading ? <CompactAssistantLoading key="fab-loading" /> : null}
              </AnimatePresence>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white p-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 bg-slate-50 py-1 pl-2.5 pr-1",
                  composerRing
                )}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Message…"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={!input.trim() || loading}
                  onClick={() => void send()}
                  className="h-8 w-8 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.97] disabled:opacity-40"
                  aria-label="Send"
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={motionTransition(reduceMotion, "fast")}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full",
          "border border-white/25 bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700",
          "text-white shadow-[0_10px_40px_-10px_rgb(37_99_235/0.65),0_4px_14px_-4px_rgb(79_70_229/0.45)]",
          "transition-[filter,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]",
          "hover:border-white/35 hover:shadow-[0_14px_48px_-10px_rgb(37_99_235/0.75),0_6px_20px_-4px_rgb(99_102_241/0.5)]",
          "hover:brightness-[1.07] active:brightness-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100",
          open && "ring-2 ring-blue-400/50 ring-offset-2 ring-offset-slate-100"
        )}
        aria-label={open ? "Close Intelligence" : "Open Intelligence"}
        title={open ? "Close Intelligence" : "Open Intelligence"}
      >
        <Sparkles
          className="relative h-[1.35rem] w-[1.35rem] shrink-0 drop-shadow-[0_1px_2px_rgb(0_0_0/0.2)]"
          strokeWidth={2}
          fill="currentColor"
          aria-hidden
        />
      </motion.button>
    </>
  );
}
