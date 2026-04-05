/**
 * Session gate for the full-screen entry experience (any first load in the app).
 * Wired in root layout via `EntryGateProvider`. After continue, the app navigates to `/assistant`.
 *
 * Testing:
 * - Append `?intro=1` to `/` to force the intro even if already entered this session.
 * - Clear session: DevTools → Application → Session storage → remove `med-dash-experience-entered`
 *   or `sessionStorage.removeItem(ENTRY_GATE_SESSION_KEY)` in the console.
 */
export const ENTRY_GATE_SESSION_KEY = "med-dash-experience-entered";

/** Query param that forces the entry screen (e.g. `/?intro=1`). */
export const ENTRY_GATE_FORCE_QUERY = "intro";

export function readForceIntroFromSearch(search: string): boolean {
  try {
    return new URLSearchParams(search).get(ENTRY_GATE_FORCE_QUERY) === "1";
  } catch {
    return false;
  }
}

export function hasEnteredExperienceThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ENTRY_GATE_SESSION_KEY) === "1";
}

export function markExperienceEntered(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ENTRY_GATE_SESSION_KEY, "1");
}

export function shouldShowEntryGate(search: string): boolean {
  if (typeof window === "undefined") return false;
  if (readForceIntroFromSearch(search)) return true;
  return !hasEnteredExperienceThisSession();
}
