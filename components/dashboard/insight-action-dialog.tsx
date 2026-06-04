"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export type InsightActionId =
  | "reallocate_staff"
  | "schedule_diagnostic"
  | "open_calibration_queue";

export type InsightActionContext = {
  id: InsightActionId;
  title: string;
  action: string;
  body: string;
  confidence: number;
};

const fieldSelectClass = cn(
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
);

const fieldTextareaClass = cn(
  "min-h-[72px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
);

const brandPrimaryButtonClass = cn(
  "h-9 rounded-lg px-4 text-sm font-semibold",
  "border-transparent bg-gradient-to-b from-blue-500 to-blue-600 text-white",
  "shadow-md shadow-blue-600/25",
  "transition-[box-shadow,filter,transform] duration-200",
  "hover:from-blue-500 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-600/30 hover:brightness-105",
  "active:scale-[0.98] active:brightness-95",
  "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
  "disabled:opacity-50"
);

const brandSecondaryButtonClass = cn(
  "h-9 rounded-lg px-4 text-sm font-semibold",
  "border-slate-200/90 bg-white text-slate-700 shadow-sm",
  "transition-[background-color,border-color,transform,box-shadow] duration-200",
  "hover:border-blue-200/90 hover:bg-blue-50/70 hover:text-slate-900",
  "active:scale-[0.98]",
  "focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2"
);

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
      {children}
    </label>
  );
}

function InsightActionForm({
  insight,
  onSubmit,
}: {
  insight: InsightActionContext;
  onSubmit: () => void;
}) {
  switch (insight.id) {
    case "reallocate_staff":
      return (
        <form
          id="insight-action-form"
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="rounded-lg border border-teal-200/70 bg-teal-50/50 px-3 py-2 text-xs text-teal-950">
            Main OR Block B is projected to run 38 min over — Recovery is 2 RNs
            short for handoff coverage.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="staff-from">Reassign from</FieldLabel>
              <select
                id="staff-from"
                defaultValue="er-float"
                className={fieldSelectClass}
              >
                <option value="er-float">ER float pool · 1 RN available</option>
                <option value="pacu">PACU · 1 RN (ends 15:30)</option>
                <option value="med-surg">Med-Surg · Charge backup</option>
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="staff-to">Cover in Recovery</FieldLabel>
              <select
                id="staff-to"
                defaultValue="recovery-or"
                className={fieldSelectClass}
              >
                <option value="recovery-or">Recovery OR handoff · 2 roles</option>
                <option value="recovery-extended">
                  Extended block support · 1 role
                </option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="staff-effective">Effective</FieldLabel>
              <select
                id="staff-effective"
                defaultValue="now"
                className={fieldSelectClass}
              >
                <option value="now">Immediately</option>
                <option value="30m">In 30 minutes</option>
                <option value="next-case">Next case turnover</option>
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="staff-duration">Duration</FieldLabel>
              <select
                id="staff-duration"
                defaultValue="block-end"
                className={fieldSelectClass}
              >
                <option value="block-end">Until block ends (~2.5 hr)</option>
                <option value="shift-end">Until shift end</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="staff-note">Handoff note</FieldLabel>
            <textarea
              id="staff-note"
              className={fieldTextareaClass}
              defaultValue="Cover Recovery during projected OR block overrun. Prioritize turnover for queued cases."
              placeholder="Optional context for charge nurse…"
            />
          </div>
        </form>
      );

    case "schedule_diagnostic":
      return (
        <form
          id="insight-action-form"
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="rounded-lg border border-blue-200/70 bg-blue-50/50 px-3 py-2 text-xs text-blue-950">
            8 ICU West pumps on firmware v2.14 · retry rate 12.4% (3.2× baseline).
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="diag-type">Diagnostic type</FieldLabel>
            <select id="diag-type" defaultValue="firmware" className={fieldSelectClass}>
              <option value="firmware">Firmware regression check</option>
              <option value="comm">Communication retry analysis</option>
              <option value="full">Full pump diagnostic bundle</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="diag-priority">Priority</FieldLabel>
              <select
                id="diag-priority"
                defaultValue="high"
                className={fieldSelectClass}
              >
                <option value="critical">Critical — active monitoring</option>
                <option value="high">High — schedule today</option>
                <option value="medium">Medium — next business day</option>
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="diag-window">Service window</FieldLabel>
              <Input
                id="diag-window"
                type="datetime-local"
                defaultValue="2026-06-04T02:00"
                className="h-9"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="diag-assignee">Assign to</FieldLabel>
            <Input
              id="diag-assignee"
              defaultValue="Clinical Engineering — ICU West"
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="diag-note">Work order notes</FieldLabel>
            <textarea
              id="diag-note"
              className={fieldTextareaClass}
              defaultValue="Correlate retry spike with v2.14 rollout. Compare against east ICU control group before rollback decision."
            />
          </div>
        </form>
      );

    case "open_calibration_queue":
      return (
        <form
          id="insight-action-form"
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="rounded-lg border border-blue-200/70 bg-blue-50/50 px-3 py-2 text-xs text-blue-950">
            4 telemetry sensors on 4 West exceed ±2% vendor tolerance · last cal
            92 days ago.
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold text-slate-700">
              Include in queue
            </legend>
            <div className="space-y-2 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3">
              {[
                { id: "dev-2841", label: "DEV-2841 · Telemetry hub 4W-A" },
                { id: "dev-2847", label: "DEV-2847 · Telemetry hub 4W-B" },
                { id: "dev-2852", label: "DEV-2852 · Bedside relay 412" },
                { id: "dev-2858", label: "DEV-2858 · Bedside relay 418" },
              ].map(({ id, label }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-700"
                >
                  <input
                    type="checkbox"
                    name="calibration-devices"
                    value={id}
                    defaultChecked
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="cal-team">Calibration team</FieldLabel>
              <select id="cal-team" defaultValue="biomed" className={fieldSelectClass}>
                <option value="biomed">Biomed — West campus</option>
                <option value="vendor">Vendor field service</option>
                <option value="shared">Shared clinical engineering</option>
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="cal-due">Target completion</FieldLabel>
              <Input id="cal-due" type="date" defaultValue="2026-06-10" className="h-9" />
            </div>
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="cal-note">Queue instructions</FieldLabel>
            <textarea
              id="cal-note"
              className={fieldTextareaClass}
              defaultValue="Re-baseline against vendor spec. Flag any sensor still drifting post-cal for replacement review."
            />
          </div>
        </form>
      );
  }
}

export function InsightActionDialog({
  insight,
  open,
  onOpenChange,
}: {
  insight: InsightActionContext | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  if (!insight) return null;

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,640px)] max-w-lg overflow-y-auto sm:max-w-xl">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                Action queued
              </DialogTitle>
              <DialogDescription>
                {insight.action} was submitted for{" "}
                <span className="font-medium text-slate-700">{insight.title}</span>
                . This demo records the workflow locally — no live systems are
                updated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleClose}
                className={brandPrimaryButtonClass}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{insight.action}</DialogTitle>
              <DialogDescription>
                {insight.body} Intelligence confidence: {insight.confidence}%.
              </DialogDescription>
            </DialogHeader>
            <InsightActionForm insight={insight} onSubmit={handleSubmit} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className={brandSecondaryButtonClass}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="insight-action-form"
                className={brandPrimaryButtonClass}
              >
                Confirm {insight.action.toLowerCase()}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
