/** Session key — remove in DevTools to replay the post-gate stagger on `/assistant`. */
const KEY = "med-dash-assistant-intro-last-gen";

/** Whether to run the post–entry-gate stagger animation for this generation bump. */
export function shouldPlayAssistantIntro(generation: number): boolean {
  if (typeof window === "undefined" || generation <= 0) return false;
  const last = Number(sessionStorage.getItem(KEY) || "0");
  return generation > last;
}

export function markAssistantIntroPlayed(generation: number): void {
  if (typeof window === "undefined" || generation <= 0) return;
  sessionStorage.setItem(KEY, String(generation));
}
