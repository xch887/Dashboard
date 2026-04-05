import { Suspense } from "react";
import { FleetView } from "@/components/dashboard/views/fleet-view";

export default function FleetPage() {
  return (
    <Suspense
      fallback={
        <div
          className="w-full min-w-0 space-y-8 animate-pulse p-1"
          aria-hidden
        >
          <div className="h-24 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
          <div className="min-h-[28rem] rounded-2xl bg-slate-100" />
        </div>
      }
    >
      <FleetView />
    </Suspense>
  );
}
