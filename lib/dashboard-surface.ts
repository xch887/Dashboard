/**
 * Dashboard card surfaces — borderless white tiles with soft cool shadow.
 * Prefer `dashboardCardClass` over ad-hoc border + shadow combos.
 */
export const dashboardCardRadius = "rounded-xl";

/** Neutral lift — matches original MediSync+ dashboard tiles */
export const dashboardCardShadow =
  "shadow-[0_1px_2px_rgb(15_23_42/0.06),0_8px_24px_-10px_rgb(15_23_42/0.1)]";

/**
 * Chart & status palette — aligned with globals.css health tokens and MediSync+ mock.
 * @see app/globals.css `--color-health-*` and `--primary`
 */
export const dashboardChartColors = {
  healthy: "#0d9488",
  warning: "#ea580c",
  critical: "#dc2626",
  offline: "#94a3b8",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  primaryMid: "#3b82f6",
  primaryLight: "#93c5fd",
  targetBand: "rgb(134 239 172 / 0.35)",
  areaFill: "rgb(37 99 235 / 0.08)",
  trendPositive: "#16a34a",
  trendNegative: "#ea580c",
  inProgress: "#2563eb",
  resolved: "#0d9488",
  scheduled: "#ea580c",
  overdue: "#dc2626",
} as const;

export const dashboardCardClass = [
  dashboardCardRadius,
  "border-0 bg-white ring-0",
  dashboardCardShadow,
].join(" ");

/** Spacing between dashboard cards — 10px horizontal, 12px vertical */
export const dashboardCardGridGap = "gap-x-2.5 gap-y-3";

/** Vertical spacing between stacked card sections */
export const dashboardCardStackGap = "space-y-3";

/** Masthead row — sidebar brand band + top header (keep heights in sync) */
export const dashboardMastheadHeight = "h-16";

/** 1px rule under sidebar logo row — canvas grey (`--background`), not `--border` */
export const dashboardSidebarMastheadDivider = "h-px shrink-0 bg-background";

/** Main canvas horizontal inset (left beside nav, right edge) — keep in sync */
export const dashboardMainInsetX = "px-3";

/** Main canvas vertical inset (below masthead) */
export const dashboardMainInsetY = "pt-3 pb-4";

/** Main canvas inset — beside sidebar and below masthead */
export const dashboardMainInset = `${dashboardMainInsetX} ${dashboardMainInsetY}`;

/** Fixed UI aligned to main canvas right edge (matches px-3) */
export const dashboardMainInsetRight = "right-3";

/** Nudge page headers off the canvas gutter (~half of SectionCard padding) */
export const dashboardPageHeaderInset = "pl-2.5 sm:pl-3";

/**
 * Quiet page / card CTAs — outline only, no filled blue or drop shadow.
 * Use with Button `variant="outline"`.
 */
export const dashboardQuietActionClass =
  "h-9 gap-1.5 rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-800 shadow-none hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900";

/** @deprecated Use dashboardCardClass — kept for gradual migration */
export const dashboardTileOutline = "border-0";

/** @deprecated Use dashboardCardClass */
export const dashboardTileShadow = dashboardCardShadow;
