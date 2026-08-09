import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { PolicyType } from "@/lib/mock-data"

const TYPE_STYLES: Record<PolicyType, string> = {
  Kasko: "bg-primary/12 text-primary ring-1 ring-primary/20",
  Trafik: "bg-chart-2/15 text-chart-2 ring-1 ring-chart-2/25",
  DASK: "bg-warning/12 text-warning ring-1 ring-warning/25",
}

export function PolicyTypeBadge({
  type,
  className,
}: {
  type: PolicyType
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
        TYPE_STYLES[type],
        className
      )}
    >
      {type}
    </span>
  )
}

export function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) {
    return <Badge variant="secondary">Süresi doldu</Badge>
  }
  if (days <= 7) {
    return (
      <Badge variant="destructive" className="tabular-nums">
        {days} gün kaldı
      </Badge>
    )
  }
  if (days <= 30) {
    return (
      <span className="inline-flex h-5 items-center rounded-4xl bg-warning/12 px-2 text-xs font-medium text-warning tabular-nums">
        {days} gün
      </span>
    )
  }
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      {days} gün
    </span>
  )
}
