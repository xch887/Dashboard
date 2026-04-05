"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Defaults for enterprise UI: calm open delay, faster re-show when moving between targets. */
export const TOOLTIP_PROVIDER_DEFAULTS = {
  delayDuration: 480,
  skipDelayDuration: 220,
} as const

function TooltipProvider({
  delayDuration = TOOLTIP_PROVIDER_DEFAULTS.delayDuration,
  skipDelayDuration = TOOLTIP_PROVIDER_DEFAULTS.skipDelayDuration,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
  )
}

function TooltipContent({
  className,
  sideOffset = 6,
  arrowClassName,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  arrowClassName?: string
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[600] max-w-sm min-w-0 rounded-lg border border-slate-800/20 bg-slate-900 px-3 py-2 text-left text-xs leading-relaxed text-slate-50 shadow-lg shadow-slate-900/25",
          "duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)]",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-[0.99]",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.99]",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.99]",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-slate-900 fill-slate-900",
            arrowClassName
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
