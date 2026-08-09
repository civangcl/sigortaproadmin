"use client"

import { Menu, Search, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Client, type Lead, daysUntilExpiry } from "@/lib/mock-data"
import type { ViewId } from "@/components/admin/admin-app"

const TITLES: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Genel Bakış",
    subtitle: "Acente özet ekranı",
  },
  financials: {
    title: "Finansal Analiz",
    subtitle: "Prim üretimi, komisyon ve potansiyel gelirler",
  },
  "leads-arac": {
    title: "Araç Sigortası Talepleri",
    subtitle: "Web formundan gelen araç sigortası teklif talepleri",
  },
  "leads-dask": {
    title: "DASK Talepleri",
    subtitle: "Zorunlu deprem sigortası teklif talepleri",
  },
  "leads-saglik": {
    title: "Sağlık Sigortası Talepleri",
    subtitle: "Sağlık sigortası teklif talepleri",
  },
  "leads-konut": {
    title: "Konut Sigortası Talepleri",
    subtitle: "Konut ve eşya sigortası teklif talepleri",
  },
  clients: {
    title: "Müşterilerim",
    subtitle: "Aktif müşteri ve poliçe kayıtları",
  },
  messages: {
    title: "Destek Mesajları",
    subtitle: "Sitenizden gelen müşteri mesajları",
  },
  invoice: {
    title: "Fatura Oluştur",
    subtitle: "Tahsilat makbuzu ve proforma fatura düzenleyin",
  },
  profile: {
    title: "Firma Ayarları",
    subtitle: "Acente bilgileri, banka hesapları ve fatura ayarları",
  },
}

export function Topbar({
  view,
  onOpenMobileNav,
  leads = [],
  clients = [],
  messages = [],
}: {
  view: ViewId
  onOpenMobileNav: () => void
  leads?: Lead[]
  clients?: Client[]
  messages?: any[]
}) {
  const { title, subtitle } = TITLES[view]
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const pendingQuotes = leads.filter(l => l.status === "yeni")
  const unreadMessages = messages.filter(m => m.status === "yeni")
  const allPolicies = clients.flatMap(c => c.policies.map(p => ({ client: c, policy: p })))
  const upcomingRenewals = allPolicies
    .map(entry => ({ ...entry, days: daysUntilExpiry(entry.policy) }))
    .filter(entry => entry.days >= 0 && entry.days <= 7)
    .sort((a, b) => a.days - b.days)

  const notificationCount = pendingQuotes.length + upcomingRenewals.length + unreadMessages.length

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Menüyü aç"
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-semibold tracking-tight">
          {title}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {subtitle}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Müşteri, plaka ara..."
            className="h-8 w-56 pl-8"
            aria-label="Ara"
          />
        </div>

        <DropdownMenu>
          <div className="relative">
            <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="Bildirimler" />}>
              <Bell />
            </DropdownMenuTrigger>
            {notificationCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 size-4 rounded-full p-0 text-[10px] tabular-nums pointer-events-none">
                {notificationCount}
              </Badge>
            )}
          </div>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 text-sm font-semibold">Bildirimler</div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-max max-h-[60vh]">
              {notificationCount === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Şu an için yeni bir bildiriminiz yok.
                </div>
              ) : (
                <>
                  {unreadMessages.length > 0 && (
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">Yeni Mesajlar</DropdownMenuLabel>
                      {unreadMessages.map(m => (
                        <DropdownMenuItem key={m.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                          <span className="font-medium text-sm">{m.fullName}</span>
                          <span className="text-xs text-muted-foreground truncate w-full">{m.message}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )}
                  {unreadMessages.length > 0 && pendingQuotes.length > 0 && <DropdownMenuSeparator />}
                  {pendingQuotes.length > 0 && (
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">Yeni Talepler</DropdownMenuLabel>
                      {pendingQuotes.map(q => (
                        <DropdownMenuItem key={q.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                          <span className="font-medium text-sm">{q.name}</span>
                          <span className="text-xs text-muted-foreground">{q.insuranceType.toUpperCase()} Teklifi (Plaka: {q.plate || "—"})</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )}
                  {(unreadMessages.length > 0 || pendingQuotes.length > 0) && upcomingRenewals.length > 0 && <DropdownMenuSeparator />}
                  {upcomingRenewals.length > 0 && (
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">Yaklaşan Poliçeler (7 Gün)</DropdownMenuLabel>
                      {upcomingRenewals.map(r => (
                        <DropdownMenuItem key={r.policy.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                          <span className="font-medium text-sm">{r.client.name}</span>
                          <span className="text-xs text-destructive/80 font-medium">{r.policy.type} - {r.days === 0 ? "Bugün bitiyor!" : `${r.days} gün kaldı`}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )}
                </>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="hidden text-xs text-muted-foreground xl:block">
          {today}
        </span>
      </div>
    </header>
  )
}
