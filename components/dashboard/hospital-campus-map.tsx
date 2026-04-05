"use client";

/** Stylized top-down campus map for location tracking demos. */
export function HospitalCampusMap() {
  return (
    <svg
      viewBox="0 0 800 520"
      className="h-full w-full text-slate-800"
      aria-label="Regency Medical main campus map"
    >
      <defs>
        <pattern
          id="grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            className="stroke-slate-200/80"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="800" height="520" rx="16" className="fill-slate-100/90" />
      <rect
        x="24"
        y="24"
        width="752"
        height="472"
        rx="12"
        fill="url(#grid)"
        className="stroke-slate-300/60"
        strokeWidth="1"
      />

      {/* Main clinical block */}
      <rect
        x="280"
        y="100"
        width="320"
        height="220"
        rx="8"
        className="fill-white stroke-slate-400/80"
        strokeWidth="1.5"
      />
      <text
        x="440"
        y="195"
        textAnchor="middle"
        className="fill-slate-600 text-[15px] font-bold"
      >
        Central clinical
      </text>
      <text
        x="440"
        y="218"
        textAnchor="middle"
        className="fill-slate-400 text-[11px] font-medium"
      >
        OR · ICU bridge · Labs
      </text>

      {/* North tower */}
      <rect
        x="120"
        y="80"
        width="120"
        height="280"
        rx="8"
        className="fill-blue-50 stroke-blue-600/40"
        strokeWidth="1.5"
      />
      <text
        x="180"
        y="230"
        textAnchor="middle"
        className="fill-blue-900 text-[13px] font-bold"
        transform="rotate(-90 180 230)"
      >
        North tower
      </text>

      {/* South tower */}
      <rect
        x="640"
        y="120"
        width="100"
        height="240"
        rx="8"
        className="fill-sky-50 stroke-sky-600/35"
        strokeWidth="1.5"
      />
      <text
        x="690"
        y="250"
        textAnchor="middle"
        className="fill-sky-900 text-[12px] font-bold"
        transform="rotate(-90 690 250)"
      >
        South tower
      </text>

      {/* ER / trauma */}
      <path
        d="M 320 360 L 480 360 L 520 420 L 280 420 Z"
        className="fill-rose-50 stroke-rose-400/50"
        strokeWidth="1.5"
      />
      <text x="400" y="395" textAnchor="middle" className="fill-rose-900 text-[12px] font-bold">
        ER &amp; trauma
      </text>

      {/* Imaging pavilion */}
      <rect
        x="80"
        y="380"
        width="200"
        height="100"
        rx="8"
        className="fill-violet-50 stroke-violet-400/45"
        strokeWidth="1.5"
      />
      <text x="180" y="432" textAnchor="middle" className="fill-violet-900 text-[12px] font-bold">
        Imaging pavilion
      </text>

      {/* Connectors */}
      <path
        d="M 240 220 L 280 210"
        className="stroke-slate-400"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 600 210 L 640 220"
        className="stroke-slate-400"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 400 320 L 400 360"
        className="stroke-slate-400"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Device markers */}
      {[
        [200, 140],
        [200, 200],
        [360, 150],
        [500, 160],
        [420, 260],
        [160, 410],
        [450, 400],
        [670, 200],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r="6"
            className="fill-blue-500 stroke-white"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r="14"
            className="fill-blue-500/15"
          />
        </g>
      ))}

      <text x="400" y="48" textAnchor="middle" className="fill-slate-500 text-[11px] font-semibold">
        Main campus · device positions approximate (demo)
      </text>
    </svg>
  );
}
