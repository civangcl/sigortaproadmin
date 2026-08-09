"use client"

import * as React from "react"
import { UserPlus, Search, ChevronRight, Car } from "lucide-react"

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
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Müşteri Kayıtları</CardTitle>
          <CardDescription>
            Toplam {clients.length} aktif müşteri — detay için satıra tıklayın.
          </CardDescription>
          <CardAction>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlus className="mr-2 size-4" />
              Yeni Müşteri Ekle
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          <div className="relative px-4">
            <Search className="pointer-events-none absolute top-1/2 left-6.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim, plaka, şehir veya TC ile ara..."
              className="pl-8"
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
                  const soonest = Math.min(
                    ...client.policies.map((p) => daysUntilExpiry(p))
                  )
                  return (
                    <TableRow
                      key={client.id}
                      onClick={() => onSelectClient(client.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
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
                            <span className="text-xs text-muted-foreground">
                              {client.vehicle.brand} {client.vehicle.model}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.policies.map((p) => (
                            <PolicyTypeBadge key={p.id} type={p.type} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(totalPremium)}
                      </TableCell>
                      <TableCell>
                        {soonest <= 7 ? (
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
                        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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
