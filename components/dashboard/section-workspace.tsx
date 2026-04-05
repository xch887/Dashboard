import { Button } from "@/components/ui/button";
import type { SectionPageConfig } from "@/lib/section-config";
import { PageHeader } from "@/components/dashboard/views/page-header";
import { StatCard } from "@/components/dashboard/section-card";
import { ViewPage, sectionHeadingClass } from "@/components/dashboard/view-page";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionWorkspace({ config }: { config: SectionPageConfig }) {
  return (
    <ViewPage>
      <PageHeader
        icon={config.icon}
        title={config.title}
        description={config.description}
        actions={
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700"
          >
            Primary action
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <section aria-label="Key metrics">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {config.stats.map((stat) => (
            <li key={stat.label}>
              <StatCard
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Quick actions">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className={sectionHeadingClass}>Quick actions</h2>
          <span className="text-xs text-slate-500">
            Demo — wire to real flows later
          </span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {config.tiles.map((tile) => {
            const TileIcon = tile.icon;
            return (
              <li key={tile.title}>
                <button
                  type="button"
                  className={cn(
                    "group flex w-full gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm",
                    "transition-shadow duration-200 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2"
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                    <TileIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                      {tile.title}
                      <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                      {tile.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </ViewPage>
  );
}
