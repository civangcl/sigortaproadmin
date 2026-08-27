"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Inbox,
  Users,
  ShieldCheck,
  LogOut,
  LifeBuoy,
  ChevronDown,
  Car,
  Home,
  HeartPulse,
  Building2,
  PieChart,
  MessageSquare,
  Settings,
  Shield,
  AlertTriangle,
  Briefcase,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { ViewId } from "@/components/admin/admin-app"
import { INSURANCE_TYPES, type InsuranceType, type Lead } from "@/lib/mock-data"

const LEAD_ICONS: Record<InsuranceType, React.ComponentType<{ className?: string }>> = {
  arac: Car,
  dask: Building2,
  saglik: HeartPulse,
  konut: Home,
  kasko: Shield,
  trafik: AlertTriangle,
  is_yeri: Briefcase,
}

/** Safe icon getter — returns Shield fallback for unknown types to prevent React #130 */
function getLeadIcon(type: InsuranceType): React.ComponentType<{ className?: string }> {
  return LEAD_ICONS[type] ?? Shield
}

interface SidebarProps {
  activeView: ViewId
  onNavigate: (v: ViewId) => void
  leads: Lead[]
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  onLogout: () => void
}

function SidebarContent({
  activeView,
  onNavigate,
  leads,
  onLogout,
}: Pick<SidebarProps, "activeView" | "onNavigate" | "leads" | "onLogout">) {
  const leadsActive = activeView.startsWith("leads-")
  const [leadsOpen, setLeadsOpen] = React.useState(leadsActive)

  React.useEffect(() => {
    if (leadsActive) setLeadsOpen(true)
  }, [leadsActive])

  const totalNew = leads.filter((l) => l.status === "yeni").length

  function newCountFor(type: InsuranceType) {
    return leads.filter((l) => l.insuranceType === type && l.status === "yeni")
      .length
  }

  const topItem = (
    id: ViewId,
    label: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => {
    const active = activeView === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => onNavigate(id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            active
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span className="flex-1 text-left">{label}</span>
      </button>
    )
  }

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            SigortaPanel Pro
          </span>
          <span className="text-[11px] text-muted-foreground">
            Acente Yönetim Paneli
          </span>
        </div>
      </div>

      <Separator className="my-1" />

      <p className="px-2 py-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        Menü
      </p>

      <nav className="flex flex-col gap-1">
        {topItem("dashboard", "Genel Bakış", LayoutDashboard)}
        {topItem("financials", "Finansal Analiz", PieChart)}

        {/* Gelen Talepler — expandable group */}
        <button
          type="button"
          onClick={() => setLeadsOpen((o) => !o)}
          aria-expanded={leadsOpen}
          className={cn(
            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
            leadsActive
              ? "text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Inbox
            className={cn(
              "size-4 shrink-0",
              leadsActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          <span className="flex-1 text-left">Gelen Talepler</span>
          {totalNew > 0 && (
            <Badge variant="secondary" className="tabular-nums">
              {totalNew}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              leadsOpen && "rotate-180"
            )}
          />
        </button>

        {leadsOpen && (
          <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
            {INSURANCE_TYPES.map((t) => {
              const id = `leads-${t.id}` as ViewId
              const active = activeView === id
              const Icon = getLeadIcon(t.id)
              const count = newCountFor(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 text-left">{t.label}</span>
                  {count > 0 && (
                    <Badge
                      variant={active ? "default" : "secondary"}
                      className="h-4 min-w-4 px-1 text-[10px] tabular-nums"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {topItem("clients", "Müşterilerim", Users)}

        {topItem("messages", "Destek Mesajları", MessageSquare)}
        {topItem("profile", "Firma Ayarları", Settings)}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LifeBuoy className="size-4 shrink-0" />
          Destek
        </button>

        <Separator className="my-1" />

        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              FE
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium">Fırat Ece</span>
            <span className="truncate text-[11px] text-muted-foreground">
              Sigorta Acentesi
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onLogout}
            aria-label="Çıkış yap"
          >
            <LogOut className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="print:hidden sticky top-0 hidden h-svh w-64 shrink-0 border-r border-border bg-sidebar md:block">
        <SidebarContent
          activeView={props.activeView}
          onNavigate={props.onNavigate}
          leads={props.leads}
          onLogout={props.onLogout}
        />
      </aside>

      {/* Mobile */}
      <Sheet open={props.mobileOpen} onOpenChange={props.onMobileOpenChange}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <SidebarContent
            activeView={props.activeView}
            onNavigate={props.onNavigate}
            leads={props.leads}
            onLogout={props.onLogout}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
