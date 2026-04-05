"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { AssistantFab } from "@/components/dashboard/assistant-fab";
import { cn } from "@/lib/utils";
import { shellContentTransition } from "@/lib/motion";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAssistant = pathname === "/assistant";
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-screen min-h-0 bg-transparent">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-hidden",
            isAssistant
              ? "overflow-x-hidden overflow-y-auto bg-slate-50/90 p-0"
              : "gap-6 overflow-y-auto px-5 py-6 md:px-6 lg:px-8"
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
