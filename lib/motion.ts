/**
 * Shared motion tokens for Framer Motion. CSS surfaces use matching variables in globals.css.
 */

/** Seconds — Framer Motion `transition.duration` */
export const MOTION_DURATION = {
  instant: 0,
  fast: 0.14,
  base: 0.22,
  slow: 0.3,
} as const;

/** Premium ease-out — calm, decisive */
export const MOTION_EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
};

export type MotionDurationPreset = keyof typeof MOTION_DURATION;

export function motionTransition(
  reducedMotion: boolean | null,
  preset: MotionDurationPreset = "base"
) {
  if (reducedMotion || preset === "instant") {
    return { duration: 0 };
  }
  return {
    duration: MOTION_DURATION[preset],
    ease: MOTION_EASE.out,
  };
}

/** Main content cross-fade when switching routes (e.g. dashboard ↔ assistant). */
export function shellContentTransition(reducedMotion: boolean | null) {
  return motionTransition(reducedMotion, "base");
}
