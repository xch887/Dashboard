import Image from "next/image";
import { cn } from "@/lib/utils";

const SYNC_LIGHT = "#8FBFFA";
const SYNC_DARK = "#2859C5";

/** Icon-only glyph, cropped from the Medisync lockup artwork. */
function MediSyncSyncGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="56.3 1.3 15.4 15.4"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M62.5373 3.46396C63.3464 3.2462 64.1939 3.21144 65.0182 3.36221C65.8425 3.51298 66.6228 3.8455 67.3025 4.33559L66.6755 4.96258C66.6037 5.03452 66.555 5.12608 66.5353 5.22572C66.5156 5.32536 66.5258 5.4286 66.5647 5.52241C66.6037 5.61622 66.6695 5.6964 66.754 5.7528C66.8385 5.80921 66.9378 5.83933 67.0393 5.83935H69.3962C69.5325 5.83935 69.6632 5.7852 69.7596 5.68882C69.856 5.59244 69.9101 5.46172 69.9101 5.32542V2.96853C69.9101 2.86684 69.8799 2.76744 69.8234 2.68291C69.7669 2.59839 69.6865 2.53253 69.5925 2.49368C69.4985 2.45484 69.3952 2.44475 69.2954 2.46468C69.1957 2.48462 69.1042 2.5337 69.0323 2.6057L68.4033 3.23475C67.2499 2.34196 65.8525 1.82082 64.3962 1.74043C62.9399 1.66004 61.4935 2.02421 60.2489 2.78463C59.0043 3.54506 58.0203 4.66583 57.4272 5.99833C56.8342 7.33084 56.6602 8.81213 56.9282 10.2458C56.9469 10.3453 56.985 10.4402 57.0404 10.5251C57.0958 10.6099 57.1673 10.683 57.2509 10.7401C57.3345 10.7973 57.4286 10.8374 57.5277 10.8583C57.6268 10.8791 57.7291 10.8802 57.8286 10.8615C57.9282 10.8428 58.0231 10.8047 58.1079 10.7493C58.1927 10.6939 58.2658 10.6224 58.323 10.5388C58.3801 10.4552 58.4203 10.3611 58.4411 10.262C58.4619 10.1629 58.463 10.0606 58.4443 9.96108C58.183 8.56171 58.4593 7.11526 59.2181 5.91078C59.9769 4.70629 61.1622 3.83249 62.5373 3.46396ZM71.0716 7.60008C71.0339 7.39903 70.9178 7.22122 70.7489 7.10575C70.5801 6.99029 70.3723 6.94663 70.1712 6.98439C69.9702 7.02215 69.7924 7.13822 69.6769 7.30708C69.5614 7.47594 69.5178 7.68375 69.5555 7.8848C69.7629 8.99467 69.6331 10.1412 69.1829 11.1767C68.7327 12.2121 67.9827 13.089 67.0296 13.6943C66.0765 14.2996 64.9639 14.6055 63.8353 14.5727C62.7067 14.54 61.6138 14.1699 60.6974 13.5103L61.3244 12.8833C61.3962 12.8113 61.445 12.7196 61.4646 12.6199C61.4843 12.5202 61.474 12.4168 61.4349 12.323C61.3959 12.2291 61.3298 12.149 61.2452 12.0926C61.1606 12.0363 61.0612 12.0063 60.9595 12.0065H58.6037C58.4673 12.0065 58.3366 12.0607 58.2402 12.1571C58.1439 12.2534 58.0897 12.3842 58.0897 12.5205V14.8773C58.0897 14.979 58.1199 15.0784 58.1765 15.163C58.233 15.2475 58.3133 15.3133 58.4073 15.3522C58.5013 15.391 58.6047 15.4011 58.7044 15.3812C58.8041 15.3613 58.8957 15.3122 58.9675 15.2402L59.5966 14.6111C60.7498 15.5038 62.1472 16.0249 63.6034 16.1053C65.0595 16.1857 66.5058 15.8216 67.7503 15.0613C68.9948 14.301 69.9789 13.1805 70.5721 11.8481C71.1652 10.5158 71.3394 9.0347 71.0716 7.60111V7.60008Z"
        fill={SYNC_LIGHT}
      />
      <rect
        x="63.4004"
        y="5.9248"
        width="1.19917"
        height="5.99587"
        rx="0.599586"
        fill={SYNC_DARK}
      />
      <rect
        x="61.002"
        y="9.52246"
        width="1.19917"
        height="5.99587"
        rx="0.599586"
        transform="rotate(-90 61.002 9.52246)"
        fill={SYNC_DARK}
      />
    </svg>
  );
}

/**
 * Brand mark: icon glyph in a soft squircle when collapsed.
 * When expanded, the wordmark renders the full lockup (text + icon), so the
 * standalone mark is hidden to avoid duplicating the icon.
 */
export function MediSyncLogoMark({
  className,
  collapsed = false,
}: {
  className?: string;
  /** Narrow rail: prominent app icon in a modern tile. */
  collapsed?: boolean;
}) {
  if (!collapsed) return null;

  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
        "bg-white shadow-sm shadow-slate-900/[0.06] ring-1 ring-slate-200/90",
        className
      )}
      aria-hidden
    >
      <MediSyncSyncGlyph className="h-7 w-7" />
    </div>
  );
}

/** Full Medisync lockup (wordmark + icon) from `/public/brand/medisync-lockup.svg`. */
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
      src="/brand/medisync-lockup.svg"
      alt="Medisync"
      width={88}
      height={22}
      unoptimized
      className={cn(
        "h-[22px] w-auto shrink-0 object-contain object-center sm:h-6",
        className
      )}
      priority
    />
  );
}
