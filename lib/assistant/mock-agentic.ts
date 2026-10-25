export type DecisionAccent = "rose" | "amber" | "teal";

export type DecisionOption = {
  id: string;
  label: string;
  summary: string;
  effect: string;
  recommended?: boolean;
  /** Short why this path fits the evidence (shown when selected / recommended). */
  because?: string;
};

export type DecisionEvidence = {
  metric: string;
  value: string;
  source: string;
  note?: string;
};

export type DecisionReasoningStep = {
  claim: string;
  from: string;
};

export type DecisionCase = {
  id: string;
  title: string;
  accent: DecisionAccent;
  clock: string;
  scope: string;
  sources: string;
  situation: {
    headline: string;
    body: string;
    facts: { label: string; value: string }[];
    alreadyChecked: string[];
  };
  why: {
    headline: string;
    body: string;
    ifWait: string;
    confidence: string;
  };
  /** Live signals the agent is weighing — always visible beside the walkthrough. */
  evidence: DecisionEvidence[];
  /** Ordered chain from data → conclusion. */
  reasoning: DecisionReasoningStep[];
  options: DecisionOption[];
};

export type WorkflowNode = {
  id: string;
  kind: "watch" | "collect" | "draft" | "approve" | "deliver";
  label: string;
  detail: string;
};

export type WorkflowJob = {
  id: string;
  verb: string;
  title: string;
  purpose: string;
  trigger: string;
  schedule: string;
  nextRun: string;
  approval: string;
  nodes: WorkflowNode[];
};

export const DECISION_CASES: DecisionCase[] = [
  {
    id: "or-block",
    title: "Hold a case, or float PACU?",
    accent: "rose",
    clock: "First case in 38 min",
    scope: "OR block",
    sources: "OR schedule · Roster · PACU census",
    situation: {
      headline: "Recovery is two RNs short and the board is already 38 minutes late.",
      body: "Three cases are still queued. PACU census is manageable, but floating one nurse would drop post-op coverage for the next two hours. Holding Case 3 (elective ortho) is the only delay that does not collide with a hard start.",
      facts: [
        { label: "Queued", value: "3 cases" },
        { label: "Roster", value: "−2 RNs" },
        { label: "Hold candidate", value: "Case 3" },
        { label: "PACU float", value: "1 RN available" },
      ],
      alreadyChecked: [
        "Pulled today’s OR board against the published first-case time",
        "Compared PACU census to the last four Tuesdays",
        "Confirmed Case 3 has no implant hold or anesthesia constraint",
      ],
    },
    why: {
      headline: "If nobody picks a path, first case slips further and recovery stays uncovered.",
      body: "The delay is already +22 min versus the Tuesday pattern. Waiting another 15 minutes does not add roster; it only shortens the window to float before wheels-in.",
      ifWait: "Case 4 starts ~22 min later and recovery remains −2 through the first two cases.",
      confidence: "High · 87%",
    },
    evidence: [
      {
        metric: "First-case delay",
        value: "+38 min",
        source: "OR schedule",
        note: "+22 min vs Tuesday pattern",
      },
      {
        metric: "Recovery roster",
        value: "−2 RNs",
        source: "Staff roster",
        note: "Through first two cases",
      },
      {
        metric: "Queued cases",
        value: "3",
        source: "OR board",
        note: "Case 3 = elective ortho, no hard start",
      },
      {
        metric: "PACU float",
        value: "1 RN",
        source: "PACU census",
        note: "Drops coverage ~2 hours if floated",
      },
    ],
    reasoning: [
      {
        claim: "Board is already late and recovery is short two RNs.",
        from: "OR schedule · Staff roster",
      },
      {
        claim: "Floating PACU covers recovery but thins post-op for the next block.",
        from: "PACU census",
      },
      {
        claim: "Case 3 is the only queued delay that does not hit a hard start.",
        from: "OR board · Anesthesia notes",
      },
      {
        claim: "Holding Case 3 protects wheels-in without pulling PACU.",
        from: "Combined signals",
      },
    ],
    options: [
      {
        id: "hold",
        label: "Hold Case 3",
        summary: "Delay the elective. Protect first-case wheels-in and keep PACU intact.",
        effect: "OR board updates · surgeon office notified",
        recommended: true,
        because:
          "Evidence shows Case 3 is the only safe delay and PACU float costs two hours of coverage.",
      },
      {
        id: "float",
        label: "Float 1 RN from PACU",
        summary: "Cover recovery now. PACU census drops for the next two hours.",
        effect: "Charge nurse paged · assignment log",
        because: "Use if Case 3 cannot slip — census allows one float, not two.",
      },
      {
        id: "watch",
        label: "Watch 15 minutes",
        summary: "No move yet. Only use this if a float is already walking.",
        effect: "Timer set · no board change",
        because: "Does not change roster or board; delay will keep growing.",
      },
    ],
  },
  {
    id: "icu-firmware",
    title: "Pause v2.14, or ride it out?",
    accent: "amber",
    clock: "Rollout day 6",
    scope: "ICU West firmware",
    sources: "Telemetry · Firmware log · East ICU control",
    situation: {
      headline: "ICU West pumps are retrying 3.2× baseline after v2.14. East ICU did not move.",
      body: "The spike is localized to the West rollout, not battery or connectivity. Remaining pumps on the floor are still on the new image. East ICU is the quiet control group.",
      facts: [
        { label: "Retry", value: "12.4%" },
        { label: "vs baseline", value: "3.2×" },
        { label: "On v2.14", value: "6 days" },
        { label: "East ICU", value: "Quiet" },
      ],
      alreadyChecked: [
        "Compared West retries to East ICU over the same six days",
        "Ruled out a matching battery or wireless event",
        "Confirmed biomed has a rollback image staged",
      ],
    },
    why: {
      headline: "Riding it out overnight is a bet that retries stay clinical-noise, not therapy delay.",
      body: "If retries keep climbing, night shift inherits a cluster with no owner. Pausing now costs a rollback window; waiting costs a 05:00 scramble.",
      ifWait: "Night charge inherits the cluster with no rollback owner on site.",
      confidence: "High · 82%",
    },
    evidence: [
      {
        metric: "West retry rate",
        value: "12.4%",
        source: "Telemetry",
        note: "3.2× pre-update baseline",
      },
      {
        metric: "East ICU control",
        value: "Quiet",
        source: "Telemetry",
        note: "Same window, no spike",
      },
      {
        metric: "Days on v2.14",
        value: "6",
        source: "Firmware log",
        note: "Rollout still incomplete on West",
      },
      {
        metric: "Rollback image",
        value: "Staged",
        source: "Biomed queue",
        note: "Ready for tonight",
      },
    ],
    reasoning: [
      {
        claim: "Retries jumped only on ICU West after v2.14.",
        from: "Telemetry · Firmware log",
      },
      {
        claim: "East ICU stayed flat — not a fleet-wide battery or wireless event.",
        from: "East ICU control",
      },
      {
        claim: "A staged rollback image is already available tonight.",
        from: "Biomed queue",
      },
      {
        claim: "Pausing now avoids handing an unmanaged cluster to night shift.",
        from: "Combined signals",
      },
    ],
    options: [
      {
        id: "pause",
        label: "Pause remaining v2.14",
        summary: "Freeze West. Roll remaining units back to the staged image tonight.",
        effect: "Biomed queue · firmware freeze",
        recommended: true,
        because:
          "Localized spike + staged rollback makes pause the lowest-risk move before night shift.",
      },
      {
        id: "ride",
        label: "Ride it out until morning",
        summary: "Watch retries. Page only if the rate crosses 15%.",
        effect: "Alert threshold · morning huddle",
        because: "Only if night biomed coverage is confirmed and retries stay under 15%.",
      },
    ],
  },
  {
    id: "west-cal",
    title: "Calibrate in place, or swap loaners?",
    accent: "teal",
    clock: "Before first case",
    scope: "4 West sensors",
    sources: "Cal records · Inventory",
    situation: {
      headline: "Four 4 West sensors sit outside the vendor band. Last cal was 92 days ago.",
      body: "Batch-calibrating in place takes the floor tonight. Loaners would cover first case, but inventory has not confirmed four matching units.",
      facts: [
        { label: "Sensors", value: "4" },
        { label: "Drift", value: "±2.8%" },
        { label: "Last cal", value: "92 days" },
        { label: "Loaners", value: "Unconfirmed" },
      ],
      alreadyChecked: [
        "Pulled last calibration dates against the ±2% vendor band",
        "Asked inventory for four matching loaners — not confirmed",
        "Estimated in-place cal window after last case",
      ],
    },
    why: {
      headline: "First case cannot start on drifted sensors, and loaners are still a maybe.",
      body: "If loaners fail to appear, you have neither a cal window nor coverage. Deciding now lets biomed lock a bay or keep hunting stock.",
      ifWait: "4 West starts first case on out-of-band sensors, or scrambles mid-morning.",
      confidence: "Med · 74%",
    },
    evidence: [
      {
        metric: "Sensors out of band",
        value: "4",
        source: "Cal records",
        note: "4 West floor",
      },
      {
        metric: "Drift vs vendor",
        value: "±2.8%",
        source: "Vendor baseline",
        note: "Limit ±2.0%",
      },
      {
        metric: "Last calibration",
        value: "92 days",
        source: "Cal ledger",
        note: "Past interval",
      },
      {
        metric: "Matching loaners",
        value: "Unconfirmed",
        source: "Inventory",
        note: "Asked 20 min ago",
      },
    ],
    reasoning: [
      {
        claim: "Four sensors exceed the ±2% vendor band.",
        from: "Cal records · Vendor baseline",
      },
      {
        claim: "Last cal was 92 days ago — overdue for this modality.",
        from: "Cal ledger",
      },
      {
        claim: "Loaner stock is not confirmed for four matching units.",
        from: "Inventory",
      },
      {
        claim: "In-place cal after last case does not depend on loaners.",
        from: "Combined signals",
      },
    ],
    options: [
      {
        id: "cal",
        label: "Batch-calibrate tonight",
        summary: "Take the four sensors after last case. No dependency on loaner stock.",
        effect: "Cal bay reserved · 4 West notified",
        recommended: true,
        because:
          "Drift is confirmed and loaners are not — cal removes the inventory dependency.",
      },
      {
        id: "loan",
        label: "Swap loaners before first case",
        summary: "Cover the morning. Confirm stock in the next 20 minutes or fall back to cal.",
        effect: "Inventory chase · fallback timer",
        because: "Only if inventory confirms four units in the next 20 minutes.",
      },
    ],
  },
];

export const WORKFLOW_JOBS: WorkflowJob[] = [
  {
    id: "report",
    verb: "Report",
    title: "Compliance pack",
    purpose:
      "A standing agent job that gathers overdue PMs and high-risk devices, drafts the leadership pack, and waits for you before it sends.",
    trigger: "PM completion below 80%, or at-risk devices above 400",
    schedule: "Weekdays · 05:30 local",
    nextRun: "Mon 05:30",
    approval: "You approve before send",
    nodes: [
      {
        id: "watch",
        kind: "watch",
        label: "Watch",
        detail: "PM ledger + at-risk count. Fires when either threshold trips.",
      },
      {
        id: "collect",
        kind: "collect",
        label: "Collect",
        detail: "Overdue PMs by department, 441 at-risk devices, open Joint Commission window.",
      },
      {
        id: "draft",
        kind: "draft",
        label: "Draft",
        detail: "PDF pack + five talking points. Dry run last night: 12 overdue PMs.",
      },
      {
        id: "approve",
        kind: "approve",
        label: "You approve",
        detail: "Pack sits in Briefings until you release it. Nothing leaves without a click.",
      },
      {
        id: "deliver",
        kind: "deliver",
        label: "Deliver",
        detail: "Email director of clinical engineering and file under Reports.",
      },
    ],
  },
  {
    id: "notify",
    verb: "Notify",
    title: "On-call page",
    purpose:
      "Drafts the Biomed on-call note from tonight’s open risk and holds it until you send — or auto-sends if first case is inside 45 minutes.",
    trigger: "New high-risk cluster on 4 West, or first case delay over 20 min",
    schedule: "When triggered · quiet hours 22:00–05:30",
    nextRun: "Armed · waiting on trigger",
    approval: "Auto-send only inside 45 min of first case",
    nodes: [
      {
        id: "watch",
        kind: "watch",
        label: "Watch",
        detail: "4 West risk + first-case clock. Ignores noise already in the last page.",
      },
      {
        id: "collect",
        kind: "collect",
        label: "Collect",
        detail: "Open work, owners, and the last three on-call notes so the draft is not a duplicate.",
      },
      {
        id: "draft",
        kind: "draft",
        label: "Draft",
        detail: "Short page: what’s wrong, where, who should take it.",
      },
      {
        id: "approve",
        kind: "approve",
        label: "You approve",
        detail: "Held for review unless first case is inside 45 minutes.",
      },
      {
        id: "deliver",
        kind: "deliver",
        label: "Page",
        detail: "Clinical Engineering on-call. Logged to the assignment trail.",
      },
    ],
  },
  {
    id: "assign",
    verb: "Assign",
    title: "Hand off owners",
    purpose:
      "Every afternoon, propose owners for the highest-risk open work and wait for you to confirm the handoff before names hit the board.",
    trigger: "Unowned critical work older than 4 hours, before 16:00",
    schedule: "Daily · 15:30 local",
    nextRun: "Today 15:30",
    approval: "You confirm each owner",
    nodes: [
      {
        id: "watch",
        kind: "watch",
        label: "Watch",
        detail: "Critical queue with no owner, weighted by first-case impact.",
      },
      {
        id: "collect",
        kind: "collect",
        label: "Collect",
        detail: "Vent #6, MRI A, on-shift techs, and who took the last similar job.",
      },
      {
        id: "draft",
        kind: "draft",
        label: "Propose",
        detail: "One owner per item, with a one-line why. Conflicts flagged.",
      },
      {
        id: "approve",
        kind: "approve",
        label: "You confirm",
        detail: "Edit names or skip. Nothing assigns until you confirm.",
      },
      {
        id: "deliver",
        kind: "deliver",
        label: "Hand off",
        detail: "Writes owners to the board and pings the people named.",
      },
    ],
  },
  {
    id: "analytics",
    verb: "Analytics",
    title: "Attention view",
    purpose:
      "Keeps a saved cut of critical and offline fleet fresh, and drops a briefing when the cut moves more than the daily band.",
    trigger: "Critical + offline count moves >8% vs yesterday",
    schedule: "Weekdays · 06:00 local",
    nextRun: "Mon 06:00",
    approval: "No send — view only, pinned to Intelligence",
    nodes: [
      {
        id: "watch",
        kind: "watch",
        label: "Watch",
        detail: "339 critical · 253 offline. Compares to yesterday’s saved cut.",
      },
      {
        id: "collect",
        kind: "collect",
        label: "Collect",
        detail: "Department mix, new criticals since 06:00 yesterday, offline duration.",
      },
      {
        id: "draft",
        kind: "draft",
        label: "Refresh view",
        detail: "Updates the Attention saved cut. Writes a 4-line brief if the band breaks.",
      },
      {
        id: "approve",
        kind: "approve",
        label: "No approval",
        detail: "This job does not page anyone. It only refreshes the view.",
      },
      {
        id: "deliver",
        kind: "deliver",
        label: "Pin",
        detail: "Attention view on Intelligence. Briefing lands in Briefings if the band breaks.",
      },
    ],
  },
];

export function decisionCaseById(id: string) {
  return DECISION_CASES.find((item) => item.id === id) ?? DECISION_CASES[0];
}

export function workflowJobById(id: string) {
  return WORKFLOW_JOBS.find((item) => item.id === id) ?? WORKFLOW_JOBS[0];
}
