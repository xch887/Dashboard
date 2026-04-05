"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChatPanel } from "@/components/assistant/chat-panel";
import { useAssistantEntryGeneration } from "@/components/entry-gate/entry-gate-provider";
import { AssistantInsightsRail } from "@/components/dashboard/assistant-insights-rail";
import {
  markAssistantIntroPlayed,
  shouldPlayAssistantIntro,
} from "@/lib/assistant-intro-playback";
import { MOTION_EASE } from "@/lib/motion";

export function AssistantWorkspace() {
  const generation = useAssistantEntryGeneration();
  const reduceMotion = useReducedMotion();
  const shouldPlay = shouldPlayAssistantIntro(generation);
  const introMarkedRef = useRef(false);

  useLayoutEffect(() => {
    introMarkedRef.current = false;
  }, [generation]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.1,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0.12 : 0.44,
        ease: MOTION_EASE.out,
      },
    },
  };

  return (
    <motion.div
      className="flex min-h-0 w-full flex-1 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8"
      variants={container}
      initial={shouldPlay ? "hidden" : false}
      animate="show"
      onAnimationComplete={() => {
        if (
          !introMarkedRef.current &&
          shouldPlayAssistantIntro(generation)
        ) {
          introMarkedRef.current = true;
          markAssistantIntroPlayed(generation);
        }
      }}
    >
      <motion.div
        variants={item}
        className="flex min-h-0 min-w-0 flex-1 flex-col px-3 pt-3 pb-4 sm:px-4 sm:pt-4 lg:min-w-0 lg:px-5 lg:pb-6"
      >
        <ChatPanel />
      </motion.div>
      <motion.div variants={item} className="min-h-0 w-full shrink-0 lg:w-auto lg:self-stretch">
        <AssistantInsightsRail />
      </motion.div>
    </motion.div>
  );
}
