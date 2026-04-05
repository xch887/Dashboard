import type { Metadata } from "next";
import { EntryGateProvider } from "@/components/entry-gate/entry-gate-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSync+ Dashboard",
  description: "Medical device monitoring dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans antialiased">
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <TooltipProvider>
          <EntryGateProvider>{children}</EntryGateProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}