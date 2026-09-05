import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2",
        {
          "border-zinc-900 bg-zinc-900 text-white": variant === "default",
          "border-zinc-200 bg-zinc-100 text-zinc-900": variant === "secondary",
          "border-zinc-200 text-zinc-900": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
