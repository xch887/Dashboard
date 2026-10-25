"use client";

import { forwardRef, useEffect, useId } from "react";
import Image from "next/image";
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

export const ExperienceEntryGate = forwardRef<
  HTMLDivElement,
  ExperienceEntryGateProps
>(function ExperienceEntryGate({ onRequestEnter }, ref) {
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
      data-entry-gate=""
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center overflow-hidden",
        "bg-[#ecfdf5] text-slate-900"
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
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(980px_480px_at_0%_-8%,rgb(16_185_129/0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_420px_at_100%_0%,rgb(5_150_105/0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_380px_at_50%_100%,rgb(52_211_153/0.1),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.72)_0%,transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,36rem)] flex-col items-center px-6 py-12 sm:px-10">
        <motion.div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-emerald-200/80 p-8 shadow-[0_20px_50px_-24px_rgb(5_150_105/0.28)] ring-1 ring-emerald-500/[0.08]",
            "bg-gradient-to-b from-[rgb(236_253_245/0.95)] from-0% via-white via-35% to-white to-100%",
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
          <div className="mb-6 flex justify-center">
            <Image
              src="/brand/medisync-lockup.svg"
              alt="Medisync"
              width={73}
              height={18}
              unoptimized
              priority
              className="h-7 w-auto object-contain sm:h-8"
            />
          </div>
          <div
            className="mx-auto mb-6 h-1 w-14 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 shadow-[0_0_20px_rgb(16_185_129/0.4)]"
            aria-hidden
          />
          <h1
            id={titleId}
            className="text-center text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl md:text-[2.35rem]"
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
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={motionTransition(reduceMotion, "fast")}
            >
              <Button
                id={ENTRY_CTA_ID}
                type="button"
                size="lg"
                className={cn(
                  "h-11 min-w-[14rem] rounded-lg px-8 text-sm font-semibold",
                  "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white",
                  "shadow-md shadow-emerald-700/25",
                  "transition-[box-shadow,filter] duration-200",
                  "hover:from-emerald-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-700/30 hover:brightness-105",
                  "active:brightness-95",
                  "focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
                )}
                onClick={onRequestEnter}
              >
                {entryGateCopy.cta}
              </Button>
            </motion.div>
            <p className="text-center text-[11px] leading-snug text-slate-500">
              {entryGateCopy.descriptor}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

ExperienceEntryGate.displayName = "ExperienceEntryGate";
