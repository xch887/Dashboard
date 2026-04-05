"use client";

import { forwardRef, useEffect, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOTION_DURATION, MOTION_EASE, motionTransition } from "@/lib/motion";
import { entryGateCopy } from "./entry-gate-copy";
import { cn } from "@/lib/utils";

const ENTRY_CTA_ID = "experience-entry-cta";

type ExperienceEntryGateProps = {
  /** Called when the user clicks the CTA; parent should unmount this via AnimatePresence exit. */
  onRequestEnter: () => void;
};

export const ExperienceEntryGate = forwardRef<HTMLDivElement, ExperienceEntryGateProps>(
  function ExperienceEntryGate({ onRequestEnter }, ref) {
    const reduceMotion = useReducedMotion();
    const titleId = useId();
    const descId = useId();

    const tEnter = motionTransition(reduceMotion, "base");
    const exitDuration = reduceMotion ? MOTION_DURATION.fast : MOTION_DURATION.slow;

    useEffect(() => {
      document.getElementById(ENTRY_CTA_ID)?.focus();
    }, []);

    return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center overflow-hidden",
        "bg-[#f8fafc] text-slate-900"
      )}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: reduceMotion ? 1 : 1.015,
      }}
      transition={{
        duration: exitDuration,
        ease: MOTION_EASE.out,
      }}
    >
      {/* Canvas: same blues as globals + primary-tinted washes (--primary #2563eb, --ring #3b82f6) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(980px_480px_at_0%_-8%,rgb(37_99_235/0.11),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_420px_at_100%_0%,rgb(59_130_246/0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_380px_at_50%_100%,rgb(37_99_235/0.05),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(680px_400px_at_100%_0%,rgb(14_165_233/0.06),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.82)_0%,transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,36rem)] flex-col items-center px-6 py-12 sm:px-10">
        <motion.div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-slate-200/90 p-8 shadow-[0_20px_50px_-24px_rgb(37_99_235/0.14)] ring-1 ring-blue-500/[0.07]",
            "bg-gradient-to-b from-[rgb(239_246_255/0.85)] from-0% via-white via-35% to-white to-100%",
            "sm:p-10 md:p-12"
          )}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...tEnter,
            delay: reduceMotion ? 0 : 0.06,
            ease: MOTION_EASE.out,
          }}
        >
          <div
            className="mx-auto mb-6 h-1 w-14 rounded-full bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-sky-400 shadow-[0_0_20px_rgb(37_99_235/0.35)]"
            aria-hidden
          />
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {entryGateCopy.eyebrow}
          </p>
          <h1
            id={titleId}
            className="mt-4 text-center text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl md:text-[2.35rem]"
          >
            {entryGateCopy.headline}
          </h1>
          <p
            id={descId}
            className="mx-auto mt-4 max-w-[28rem] text-center text-[0.9375rem] leading-relaxed text-slate-600 sm:text-base"
          >
            {entryGateCopy.supporting}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              id={ENTRY_CTA_ID}
              type="button"
              size="lg"
              className="h-11 min-w-[11.5rem] rounded-lg px-8 text-sm font-semibold shadow-md shadow-blue-600/20"
              onClick={onRequestEnter}
            >
              {entryGateCopy.cta}
            </Button>
            <p className="text-center text-[11px] leading-snug text-slate-500">
              {entryGateCopy.descriptor}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
    );
  }
);

ExperienceEntryGate.displayName = "ExperienceEntryGate";
