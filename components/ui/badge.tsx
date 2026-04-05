import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Healthcare / pre-cert style: soft fill, saturated text, subtle border, rounded-md (not pill). */
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border px-2.5 py-0 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "border-rose-200/90 bg-rose-50 text-rose-800 [a]:hover:bg-rose-100/90",
        outline:
          "border-slate-200 bg-white text-slate-700 shadow-none [a]:hover:bg-slate-50",
        ghost:
          "border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
        /** Pre-cert “Approved” */
        success:
          "border-emerald-200/90 bg-emerald-50 text-emerald-800 [a]:hover:bg-emerald-100/80",
        /** Pre-cert “Submitted” / in-flight */
        info: "border-sky-200/90 bg-sky-50 text-sky-800 [a]:hover:bg-sky-100/80",
        /** Pre-cert “Waiting” */
        warning:
          "border-amber-200/90 bg-amber-50 text-amber-900 [a]:hover:bg-amber-100/80",
        /** Pre-cert “Rejected” */
        danger:
          "border-rose-200/90 bg-rose-50 text-rose-800 [a]:hover:bg-rose-100/80",
        /** Pre-cert “Resubmitted” / system */
        process:
          "border-violet-200/90 bg-violet-50 text-violet-900 [a]:hover:bg-violet-100/80",
        /** Method / neutral meta */
        neutral:
          "border-slate-200/90 bg-slate-100 text-slate-700 [a]:hover:bg-slate-200/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
