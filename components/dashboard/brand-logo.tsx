import Image from "next/image";
import { cn } from "@/lib/utils";

const SYNC_LIGHT = "#7dd3fc";
const SYNC_DARK = "#1d4ed8";

/** Plus + circular sync arrows (matches MediSync brand mark). */
function MediSyncSyncGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <marker
          id="medisync-sync-arrow"
          markerWidth="5"
          markerHeight="5"
          refX="4.2"
          refY="2.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 0 L4.5 2.5 L0 5 Z" fill={SYNC_LIGHT} />
        </marker>
      </defs>
      {/* Clockwise sync ring — two arcs */}
      <path
        d="M 17.65 8.05 A 7.15 7.15 0 0 0 6.35 15.95"
        stroke={SYNC_LIGHT}
        strokeWidth="2.15"
        strokeLinecap="round"
        markerEnd="url(#medisync-sync-arrow)"
      />
      <path
        d="M 6.35 16.45 A 7.15 7.15 0 0 0 17.65 8.55"
        stroke={SYNC_LIGHT}
        strokeWidth="2.15"
        strokeLinecap="round"
        markerEnd="url(#medisync-sync-arrow)"
      />
      <rect
        x="10.35"
        y="5.85"
        width="3.3"
        height="12.3"
        rx="1.65"
        fill={SYNC_DARK}
      />
      <rect
        x="5.85"
        y="10.35"
        width="12.3"
        height="3.3"
        rx="1.65"
        fill={SYNC_DARK}
      />
    </svg>
  );
}

/**
 * Brand mark: full sync symbol in a soft squircle when collapsed;
 * compact symbol on transparent when expanded (pairs with wordmark).
 */
export function MediSyncLogoMark({
  className,
  collapsed = false,
}: {
  className?: string;
  /** Narrow rail: prominent app icon in a modern tile. */
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          "bg-white shadow-sm shadow-slate-900/[0.06] ring-1 ring-slate-200/90",
          className
        )}
        aria-hidden
      >
        <MediSyncSyncGlyph className="h-[26px] w-[26px]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        className
      )}
      aria-hidden
    >
      <MediSyncSyncGlyph className="h-[24px] w-[24px]" />
    </div>
  );
}

/** Vector wordmark from Figma export (`/public/brand/MediSync.svg`). */
export function MediSyncWordmark({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  if (collapsed) return null;
  return (
    <Image
      src="/brand/MediSync.svg"
      alt="MediSync"
      width={51}
      height={12}
      unoptimized
      className={cn(
        "h-[15px] w-auto shrink-0 object-contain object-left sm:h-4",
        className
      )}
      priority
    />
  );
}
