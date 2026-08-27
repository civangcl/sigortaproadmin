"use client"

import * as React from "react"
import {
  Phone,
  Mail,
  MapPin,
  Car,
  Hash,
  CalendarDays,
  Wallet,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Client,
  type Policy,
  formatCurrency,
  formatDate,
  policyProgress,
  daysUntilExpiry,
} from "@/lib/mock-data"
import { PolicyTypeBadge, ExpiryBadge } from "@/components/admin/policy-badges"

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span
          className={cn(
            "truncate text-sm font-medium",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function PolicyCard({ policy }: { policy: Policy }) {
  const progress = policyProgress(policy)
  const days = daysUntilExpiry(policy)
  const urgent = days >= 0 && days <= 7

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <PolicyTypeBadge type={policy.type} />
            <span className="text-sm font-medium">{policy.company}</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {policy.policyNo}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums">
            {formatCurrency(policy.premium)}
          </div>
          <span className="text-[11px] text-muted-foreground">prim</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatDate(policy.startDate)} — {formatDate(policy.endDate)}
          </span>
          <ExpiryBadge days={days} />
        </div>
        <Progress
          value={progress}
          className={cn(
            "[&_[data-slot=progress-indicator]]:transition-all",
            urgent
              ? "[&_[data-slot=progress-indicator]]:bg-destructive"
              : days <= 30
                ? "[&_[data-slot=progress-indicator]]:bg-warning"
                : "[&_[data-slot=progress-indicator]]:bg-primary"
          )}
        />
        <span className="text-[11px] text-muted-foreground tabular-nums">
          Sürenin %{progress}&apos;i geçti
        </span>
      </div>
    </div>
  )
}

export function ClientDetailSheet({
  client,
  open,
  onOpenChange,
  onUpdateVehicle,
  onUpdateClient,
}: {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateVehicle?: (id: string, vehicle: Partial<Client['vehicle']>) => void
  onUpdateClient?: (id: string, clientData: Partial<Client>) => Promise<{success: boolean, error?: string}>
}) {
  const [editMode, setEditMode] = React.useState(false)
  const [clientEditMode, setClientEditMode] = React.useState(false)
  const [clientSaving, setClientSaving] = React.useState(false)
  const [clientEditForm, setClientEditForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    tc: "",
    city: "",
    address: "",
  })

  React.useEffect(() => {
    if (client && clientEditMode) {
      setClientEditForm({
        name: client.name || "",
        phone: client.phone || "",
        email: client.email !== "-" ? client.email : "",
        tc: client.tc !== "-" ? client.tc : "",
        city: client.city !== "-" ? client.city : "",
        address: client.city !== "-" ? client.city : "", // Mock data didn't have address separately in all views, mapped to city in UI
      })
    }
  }, [client, clientEditMode])

  const [editForm, setEditForm] = React.useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    engineNo: "",
    chassisNo: "",
  })

  // Update edit form when client changes or edit mode toggles
  React.useEffect(() => {
    if (client && editMode) {
      setEditForm({
        brand: client.vehicle.brand !== "-" ? client.vehicle.brand : "",
        model: client.vehicle.model !== "-" ? client.vehicle.model : "",
        year: client.vehicle.year,
        engineNo: client.vehicle.engineNo !== "-" ? client.vehicle.engineNo : "",
        chassisNo: client.vehicle.chassisNo !== "-" ? client.vehicle.chassisNo : "",
      })
    }
  }, [client, editMode])
  const totalPremium =
    client?.policies.reduce((s, p) => s + p.premium, 0) ?? 0
  const totalCollected =
    client?.financials
      .filter((f) => f.kind === "tahsilat")
      .reduce((s, f) => s + f.amount, 0) ?? 0
  const totalCommission =
    client?.financials
      .filter((f) => f.kind === "komisyon")
      .reduce((s, f) => s + f.amount, 0) ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full !max-w-full sm:!max-w-md gap-0 p-0 flex flex-col"
      >
        {client && (
          <>
            <SheetHeader className="border-b border-border p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <SheetTitle className="truncate text-base">
                    {client.name}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    {client.city} · Müşteri: {formatDate(client.since)}
                  </SheetDescription>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="text-sm font-semibold tabular-nums">
                    {client.policies.length}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Poliçe
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="truncate text-sm font-semibold tabular-nums">
                    {formatCurrency(totalPremium)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Toplam Prim
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="truncate text-sm font-semibold tabular-nums text-success">
                    {formatCurrency(totalCommission)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Komisyon
                  </div>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-5">
                <Tabs defaultValue="policies">
                  <TabsList className="w-full">
                    <TabsTrigger value="policies">
                      <ShieldCheck className="size-3.5" data-icon="inline-start" />
                      Poliçeler
                    </TabsTrigger>
                    <TabsTrigger value="info">Bilgiler</TabsTrigger>
                    <TabsTrigger value="finance">Finans</TabsTrigger>
                  </TabsList>

                  <TabsContent value="policies" className="mt-4 flex flex-col gap-3">
                    {client.policies.map((p) => (
                      <PolicyCard key={p.id} policy={p} />
                    ))}
                  </TabsContent>

                  <TabsContent value="info" className="mt-4 flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Müşteri Bilgileri
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => setClientEditMode(!clientEditMode)}
                        >
                          {clientEditMode ? "İptal" : "Düzenle"}
                        </Button>
                      </div>
                      {clientEditMode ? (
                        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/10 p-3">
                          <div className="grid gap-2">
                            <label className="text-[10px] text-muted-foreground">İsim Soyisim</label>
                            <Input className="h-8 text-xs" value={clientEditForm.name} onChange={e => setClientEditForm(prev => ({...prev, name: e.target.value}))} />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] text-muted-foreground">Telefon</label>
                            <Input className="h-8 text-xs" value={clientEditForm.phone} onChange={e => setClientEditForm(prev => ({...prev, phone: e.target.value}))} />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] text-muted-foreground">E-posta</label>
                            <Input className="h-8 text-xs" type="email" value={clientEditForm.email} onChange={e => setClientEditForm(prev => ({...prev, email: e.target.value}))} />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] text-muted-foreground">TC Kimlik No</label>
                            <Input className="h-8 text-xs font-mono" value={clientEditForm.tc} onChange={e => setClientEditForm(prev => ({...prev, tc: e.target.value}))} />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] text-muted-foreground">Şehir / Adres</label>
                            <Input className="h-8 text-xs" value={clientEditForm.city} onChange={e => setClientEditForm(prev => ({...prev, city: e.target.value}))} />
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-2 w-full"
                            disabled={clientSaving}
                            onClick={async () => {
                              if (onUpdateClient) {
                                setClientSaving(true)
                                await onUpdateClient(client.id, clientEditForm)
                                setClientSaving(false)
                                setClientEditMode(false)
                              }
                            }}
                          >
                            {clientSaving ? "Kaydediliyor..." : "Kaydet"}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <InfoRow icon={Phone} label="Telefon" value={client.phone} />
                          <InfoRow icon={Mail} label="E-posta" value={client.email} />
                          <InfoRow
                            icon={Hash}
                            label="TC Kimlik No"
                            value={client.tc}
                            mono
                          />
                        </>
                      )}

                    </div>
                  </TabsContent>

                  <TabsContent value="finance" className="mt-4 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                        <Wallet className="size-4 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(totalCollected)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Toplam Tahsilat
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                        <TrendingUp className="size-4 text-success" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold tabular-nums text-success">
                            {formatCurrency(totalCommission)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Komisyon Geliri
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Hareketler
                      </span>
                      {client.financials.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Finansal hareket bulunmuyor.
                        </p>
                      )}
                      {client.financials.map((f, i) => (
                        <React.Fragment key={f.id}>
                          {i > 0 && <Separator />}
                          <div className="flex items-center gap-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="size-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {formatDate(f.date)}
                              </span>
                            </div>
                            <span className="min-w-0 flex-1 truncate text-sm">
                              {f.description}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-medium tabular-nums",
                                f.kind === "komisyon"
                                  ? "text-success"
                                  : "text-foreground"
                              )}
                            >
                              {formatCurrency(f.amount)}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
