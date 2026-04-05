"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bot, Send, Sparkles } from "lucide-react";

const mockMessages = [
  {
    role: "assistant" as const,
    content:
      "Good morning. 3 devices need attention: DEV-1003 has low battery (34%), DEV-1004 is critical (12% battery, 45 min since last sync), and DEV-1006 is inactive.",
  },
  {
    role: "user" as const,
    content: "What should I prioritize?",
  },
  {
    role: "assistant" as const,
    content:
      "Priority 1: DEV-1004 (TempGuard Mini) in ER Bay 3. The battery is at 12% and it hasn't synced in 45 minutes for patient James Rodriguez. This needs immediate physical attention.\n\nPriority 2: DEV-1003 (OxygenSense Elite) in ICU Room 208. Battery at 34%, schedule a swap within the next 2 hours.\n\nDEV-1006 can wait as it's in storage.",
  },
];

export function AiAssistant() {
  const [input, setInput] = useState("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 gap-2 rounded-full px-4 py-5"
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] bg-slate-950 border-slate-800 p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-slate-800">
          <SheetTitle className="text-white flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-md bg-teal-500/10 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-teal-400" />
            </div>
            Device Intelligence Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {mockMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about devices, patients, alerts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-sm text-slate-300 placeholder:text-slate-500 focus-visible:ring-teal-500/30"
            />
            <Button
              size="icon"
              className="bg-teal-600 hover:bg-teal-500 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            AI responses are simulated for demo purposes
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}