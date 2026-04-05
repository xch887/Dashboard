"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const barClass =
  "h-2.5 rounded bg-slate-200/90";

function ShimmerBar({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(barClass, className)}
      initial={{ opacity: 0.45 }}
      animate={
        reduce ? { opacity: 0.72 } : { opacity: [0.45, 0.92, 0.45] }
      }
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 1.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }
      }
    />
  );
}

export function LoadingState() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100"
      aria-busy="true"
      aria-label="Generating response"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={motionTransition(reduce, "base")}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 items-center justify-center" aria-hidden>
          <motion.span
            className="block h-2 w-2 rounded-full bg-blue-600"
            animate={
              reduce
                ? {}
                : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </span>
        <p className="text-xs font-medium text-slate-600">
          Synthesizing operational context…
        </p>
      </div>
      <div className="space-y-2">
        <ShimmerBar className="w-[88%]" delay={0} />
        <ShimmerBar className="w-full" delay={0.08} />
        <ShimmerBar className="w-[72%]" delay={0.16} />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <ShimmerBar className="h-7 w-24" delay={0.05} />
        <ShimmerBar className="h-7 w-28" delay={0.12} />
        <ShimmerBar className="h-7 w-20" delay={0.18} />
      </div>
    </motion.div>
  );
}

/** Inline typing indicator for narrow surfaces (e.g. FAB sheet). */
export function CompactAssistantLoading() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={motionTransition(reduce, "fast")}
    >
      <div
        className="flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 shadow-sm ring-1 ring-slate-100"
        role="status"
        aria-label="Assistant is responding"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={
              reduce
                ? { opacity: 0.55 }
                : { opacity: [0.35, 1, 0.35] }
            }
            transition={{
              duration: 1.05,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.14,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
