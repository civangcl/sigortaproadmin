"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Monospace value with a one-click copy button — used for Tramer-query
 * fields (Plaka, TC Kimlik No, Doğum Tarihi, Belge / Tescil No).
 */
export function CopyField({
  value,
  label,
  className,
}: {
  value: string
  label: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Kopyalandı", { description: `${label}: ${value}` })
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.error("Kopyalanamadı")
    }
  }

  return (
    <div className={cn("group flex items-center gap-1", className)}>
      <span className="font-mono text-xs tabular-nums tracking-wide">
        {value}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={copy}
              aria-label={`${label} kopyala`}
              className="size-6 shrink-0 opacity-60 transition-opacity hover:opacity-100"
            />
          }
        >
          {copied ? (
            <Check className="text-success" />
          ) : (
            <Copy />
          )}
        </TooltipTrigger>
        <TooltipContent>{label} kopyala</TooltipContent>
      </Tooltip>
    </div>
  )
}
