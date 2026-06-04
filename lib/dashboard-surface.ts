/**
 * Dashboard card surfaces — borderless white tiles with soft cool shadow.
 * Prefer `dashboardCardClass` over ad-hoc border + shadow combos.
 */
export const dashboardCardRadius = "rounded-[8px]";

export const dashboardCardShadow =
  "shadow-[0_12px_40px_-16px_rgb(99_102_241/0.1)]";

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

/** @deprecated Use dashboardCardClass — kept for gradual migration */
export const dashboardTileOutline = "border-0";

/** @deprecated Use dashboardCardClass */
export const dashboardTileShadow = dashboardCardShadow;
