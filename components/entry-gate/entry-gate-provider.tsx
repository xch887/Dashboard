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
import {
  ENTRY_GATE_SESSION_KEY,
  markExperienceEntered,
  shouldShowEntryGate,
} from "@/lib/entry-gate";
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
    const path = window.location.pathname;
    const search = window.location.search;
    // Root launch URL always opens the green MediSync launcher.
    if (path === "/" || path === "") {
      try {
        sessionStorage.removeItem(ENTRY_GATE_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setOverlay("gate");
      setGateVisible(true);
      return;
    }
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
    const path = window.location.pathname;
    if (path === "/" || path === "") {
      router.replace("/assistant");
    }
  }, [router]);

  return (
    <AssistantEntryGenContext.Provider value={assistantEntryGeneration}>
      {children}
      {overlay === "unknown" ? (
        <div
          className="fixed inset-0 z-[200] bg-[radial-gradient(900px_440px_at_0%_-6%,rgb(16_185_129/0.14),transparent_55%),linear-gradient(180deg,#ecfdf5_0%,#d1fae5_100%)]"
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
