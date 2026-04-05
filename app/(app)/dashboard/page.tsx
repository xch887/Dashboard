import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { SHOW_DASHBOARD_IN_NAV } from "@/lib/nav-config";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { ViewPage } from "@/components/dashboard/view-page";

export default function DashboardPage() {
  if (!SHOW_DASHBOARD_IN_NAV) {
    redirect("/assistant");
  }

  return (
    <ViewPage>
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Live operations"
        title="Fleet readiness"
        description="Predictive signals, open actions, and compliance context in one view — prioritize what needs a human before the next shift."
      />

      <Suspense
        fallback={
          <p className="mt-8 text-sm text-slate-500">Loading dashboard…</p>
        }
      >
        <DashboardPageContent />
      </Suspense>
    </ViewPage>
  );
}
