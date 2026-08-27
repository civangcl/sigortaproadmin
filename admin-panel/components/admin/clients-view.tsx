"use client"

import * as React from "react"
import { UserPlus, Search, ChevronRight, Car, Phone } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  type Client,
  formatCurrency,
  daysUntilExpiry,
} from "@/lib/mock-data"
import { PolicyTypeBadge } from "@/components/admin/policy-badges"
import { AddClientDialog } from "@/components/admin/add-client-dialog"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ClientsView({
  clients,
  onAddClient,
  onSelectClient,
}: {
  clients: Client[]
  onAddClient: (client: Client) => void
  onSelectClient: (id: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.vehicle.plate.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.tc.includes(q)
    )
  })

  return (
    <>
      <Card className="overflow-hidden border-none sm:border-solid shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Müşteri Kayıtları</CardTitle>
              <CardDescription>
                Toplam {clients.length} aktif müşteri — detay için satıra tıklayın.
              </CardDescription>
            </div>
            <CardAction>
              <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                <UserPlus className="mr-2 size-4" />
                Yeni Müşteri Ekle
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, plaka, şehir veya TC ile ara..."
              className="pl-9"
              aria-label="Müşteri ara"
            />
          </div>

          {filtered.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>Sonuç bulunamadı</EmptyTitle>
                <EmptyDescription>
                  Arama kriterlerinize uygun müşteri yok.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {/* MOBILE CARD VIEW */}
              <div className="md:hidden flex flex-col gap-3 pb-safe mt-2">
                {filtered.map((client) => {
                  const totalPremium = client.policies.reduce((s, p) => s + p.premium, 0)
                  const soonest = client.policies.length > 0 ? Math.min(...client.policies.map((p) => daysUntilExpiry(p))) : Infinity
                  
                  return (
                    <div 
                      key={client.id}
                      className="flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
                      onClick={() => onSelectClient(client.id)}
                    >
                      <div className="flex justify-between items-center p-4 pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {initials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold">{client.name}</span>
                            <span className="text-xs text-muted-foreground">{client.city}</span>
                          </div>
                        </div>
                        {soonest <= 7 && client.policies.length > 0 ? (
                          <div className="size-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                        ) : client.policies.length > 0 ? (
                          <div className="size-2 rounded-full bg-success" />
                        ) : null}
                      </div>

                      <div className="px-4 py-2 bg-muted/40 flex justify-between items-center text-sm border-y border-border/50">
                        <div className="flex items-center gap-1.5 font-medium">
                           <Phone className="size-3.5 text-muted-foreground" /> {client.phone}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                           <Car className="size-3.5 text-muted-foreground" /> {client.vehicle.plate !== "-" ? client.vehicle.plate : "Araç Yok"}
                        </div>
                      </div>

                      <div className="p-4 pt-3 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-1">
                          {client.policies.length > 0 ? client.policies.map((p) => (
                            <PolicyTypeBadge key={p.id} type={p.type} />
                          )) : (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Poliçe Yok</span>
                          )}
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase text-muted-foreground font-semibold">Toplam Prim</span>
                             <span className="font-medium text-sm">{formatCurrency(totalPremium)}</span>
                           </div>
                           <Button size="sm" variant="secondary" className="h-8 px-4 rounded-full text-xs font-medium">Detay</Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4">Müşteri</TableHead>
                      <TableHead>Araç</TableHead>
                      <TableHead>Poliçeler</TableHead>
                      <TableHead className="text-right">Toplam Prim</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="pr-4" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((client) => {
                      const totalPremium = client.policies.reduce(
                        (s, p) => s + p.premium,
                        0
                      )
                      const soonest = client.policies.length > 0 ? Math.min(
                        ...client.policies.map((p) => daysUntilExpiry(p))
                      ) : Infinity
                      
                      return (
                        <TableRow
                          key={client.id}
                          onClick={() => onSelectClient(client.id)}
                          className="cursor-pointer group"
                        >
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9">
                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                  {initials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{client.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {client.city} · {client.phone}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Car className="size-3.5 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-medium">
                                  {client.vehicle.plate}
                                </span>
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {client.vehicle.brand} {client.vehicle.model}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {client.policies.length > 0 ? client.policies.map((p) => (
                                <PolicyTypeBadge key={p.id} type={p.type} />
                              )) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(totalPremium)}
                          </TableCell>
                          <TableCell>
                            {client.policies.length === 0 ? (
                               <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                 Kayıtlı poliçe yok
                               </span>
                            ) : soonest <= 7 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                                <span className="size-1.5 rounded-full bg-destructive" />
                                Yenileme yakın
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-success" />
                                Aktif
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <ChevronRight className="ml-auto size-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddClient={onAddClient}
      />
    </>
  )
}
