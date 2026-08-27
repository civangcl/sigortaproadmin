"use client"

import { Menu, Search, Bell, Settings, Info, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type Client, type Lead, daysUntilExpiry } from "@/lib/mock-data"
import type { ViewId } from "@/components/admin/admin-app"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import * as React from "react"
import { toast } from "sonner"

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
  "leads-kasko": {
    title: "Kasko Talepleri",
    subtitle: "Kasko poliçesi teklif talepleri",
  },
  "leads-trafik": {
    title: "Trafik Sigortası Talepleri",
    subtitle: "Zorunlu trafik sigortası teklif talepleri",
  },
  "leads-saglik": {
    title: "Sağlık Sigortası Talepleri",
    subtitle: "Sağlık sigortası teklif talepleri",
  },
  "leads-konut": {
    title: "Konut Sigortası Talepleri",
    subtitle: "Konut ve eşya sigortası teklif talepleri",
  },
  "leads-is_yeri": {
    title: "İş Yeri Sigortası Talepleri",
    subtitle: "İş yeri sigortası teklif talepleri",
  },
  clients: {
    title: "Müşterilerim",
    subtitle: "Aktif müşteri ve poliçe kayıtları",
  },
  messages: {
    title: "Destek Mesajları",
    subtitle: "Sitenizden gelen müşteri mesajları",
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
  dbNotifications = [],
  onNotificationClick,
}: {
  view: ViewId
  onOpenMobileNav: () => void
  leads?: Lead[]
  clients?: Client[]
  messages?: any[]
  dbNotifications?: any[]
  onNotificationClick?: (n: any) => void
}) {
  // Use fallback if view is somehow not in TITLES (e.g. invoice which was removed)
  const { title, subtitle } = TITLES[view] || { title: "Sayfa", subtitle: "" }
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const { isSupported, isSubscribed, subscribe, permission } = usePushNotifications()
  const [isIOS, setIsIOS] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(true)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      setIsIOS(ios)
      // Check if running as PWA
      const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)
      setIsStandalone(!!standalone)
    }
  }, [])

  const handleSubscribe = async () => {
    if (isIOS && !isStandalone) {
      toast.info(
        "iPhone'da yeni teklif bildirimleri almak için SigortaPro'yu Ana Ekranınıza ekleyin.",
        {
          description: "Safari'de Paylaş ikonuna basın, ardından 'Ana Ekrana Ekle' seçeneğini seçin. Ana ekrandaki uygulamadan giriş yapıp bildirimleri açabilirsiniz.",
          duration: 10000,
        }
      )
      return
    }
    await subscribe()
  }

  const handleNotificationSelect = (n: any) => {
    setSheetOpen(false)
    if (onNotificationClick) {
      onNotificationClick(n)
    }
  }

  const notificationCount = dbNotifications.length

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
        {isIOS && !isStandalone && (
          <Tooltip>
            <TooltipTrigger asChild>
               <Button variant="outline" size="icon-sm" onClick={handleSubscribe} className="text-primary hover:text-primary hidden sm:flex"><Info className="size-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>iPhone'da bildirimleri açmak için tıklayın</TooltipContent>
          </Tooltip>
        )}

        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Müşteri, plaka ara..."
            className="h-8 w-56 pl-8"
            aria-label="Ara"
          />
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <div className="relative">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Bildirimler">
                <Bell />
              </Button>
            </SheetTrigger>
            {notificationCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 size-4 rounded-full p-0 text-[10px] tabular-nums pointer-events-none">
                {notificationCount}
              </Badge>
            )}
          </div>
          <SheetContent side="right" className="w-full !max-w-full sm:!max-w-sm p-0 flex flex-col">
            <SheetHeader className="px-4 py-4 border-b shrink-0 flex flex-row items-center justify-between">
              <SheetTitle className="text-base m-0 text-left">Bildirimler</SheetTitle>
              {isSupported && !isSubscribed && (
                <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={handleSubscribe}>
                  Aç
                </Button>
              )}
            </SheetHeader>
            <ScrollArea className="flex-1">
              {notificationCount === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Şu an için yeni bir bildiriminiz yok.
                </div>
              ) : (
                <div className="flex flex-col">
                  {dbNotifications.map(n => (
                    <div 
                      key={n.id} 
                      className="flex flex-col items-start gap-1 p-4 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted"
                      onClick={() => handleNotificationSelect(n)}
                    >
                      <span className="font-medium text-sm text-foreground">{n.title}</span>
                      <span className="text-xs text-muted-foreground break-words w-full">{n.body}</span>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <span className="hidden text-xs text-muted-foreground xl:block">
          {today}
        </span>
      </div>
    </header>
  )
}
