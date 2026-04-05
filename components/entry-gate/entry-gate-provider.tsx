"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { markExperienceEntered, shouldShowEntryGate } from "@/lib/entry-gate";
import { ExperienceEntryGate } from "./experience-entry-gate";

type OverlayPhase = "unknown" | "gate" | "none";

const AssistantEntryGenContext = createContext(0);

/** Bumped each time the full-screen entry gate completes; used for a one-time assistant reveal animation. */
export function useAssistantEntryGeneration() {
  return useContext(AssistantEntryGenContext);
}

/**
 * Full-screen entry gate for the whole app: first load of any URL shows the intro
 * until the user continues (sessionStorage). `/?intro=1` forces the gate.
 * After continue, navigates to `/assistant` with a generation bump for staggered UI reveal.
 */
export function EntryGateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [overlay, setOverlay] = useState<OverlayPhase>("unknown");
  const [gateVisible, setGateVisible] = useState(false);
  const [assistantEntryGeneration, setAssistantEntryGeneration] = useState(0);

  useLayoutEffect(() => {
    const search = window.location.search;
    if (shouldShowEntryGate(search)) {
      setOverlay("gate");
      setGateVisible(true);
    } else {
      setOverlay("none");
    }
  }, []);

  const handleRequestEnter = useCallback(() => {
    setGateVisible(false);
  }, []);

  const handleExitComplete = useCallback(() => {
    setAssistantEntryGeneration((g) => g + 1);
    markExperienceEntered();
    setOverlay("none");
    router.replace("/assistant");
  }, [router]);

  return (
    <AssistantEntryGenContext.Provider value={assistantEntryGeneration}>
      {children}
      {overlay === "unknown" ? (
        <div
          className="fixed inset-0 z-[200] bg-[radial-gradient(900px_440px_at_0%_-6%,rgb(37_99_235/0.08),transparent_55%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]"
          aria-hidden
        />
      ) : null}
      {overlay === "gate" ? (
        <AnimatePresence onExitComplete={handleExitComplete}>
          {gateVisible ? (
            <ExperienceEntryGate
              key="experience-entry"
              onRequestEnter={handleRequestEnter}
            />
          ) : null}
        </AnimatePresence>
      ) : null}
    </AssistantEntryGenContext.Provider>
  );
}
