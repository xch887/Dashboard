"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { AssistantFab } from "@/components/dashboard/assistant-fab";
import { cn } from "@/lib/utils";
import { dashboardMainInset } from "@/lib/dashboard-surface";
import { shellContentTransition } from "@/lib/motion";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssistant = pathname === "/assistant";
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-screen min-h-0 bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <Header />
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-hidden bg-background",
            isAssistant
              ? "overflow-hidden p-0"
              : cn(
                  dashboardMainInset,
                  "gap-3 overflow-y-auto [scrollbar-gutter:stable]"
                )
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isAssistant ? "assistant" : "app"}
              className="flex min-h-0 min-w-0 flex-1 flex-col"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -3 }}
              transition={shellContentTransition(reduceMotion)}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <AssistantFab />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
