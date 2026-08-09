"use client"

import * as React from "react"
import { Check, Trash2, Inbox, Phone, Banknote, RotateCcw, Pencil } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type Lead,
  type InsuranceType,
  INSURANCE_TYPES,
  formatDate,
  formatCurrency,
} from "@/lib/mock-data"
import { CopyField } from "@/components/admin/copy-field"

type Filter = "all" | "yeni" | "iletildi" | "onaylandi" | "silindi"

const DESCRIPTIONS: Record<InsuranceType, string> = {
  arac: "Web sitesi formundan düşen araç sigortası talepleri — Tramer sorgusu için plaka, TC, doğum tarihi ve tescil no'yu tek tıkla kopyalayın.",
  dask: "Zorunlu deprem sigortası (DASK) teklif talepleri — kimlik ve adres bilgilerini kopyalayarak sorgulayın.",
  saglik:
    "Sağlık sigortası teklif talepleri — TC ve doğum tarihi ile risk sorgusu yapın.",
  konut:
    "Konut ve eşya sigortası teklif talepleri — kimlik ve adres bilgilerini kopyalayarak teklif hazırlayın.",
}

export function LeadsView({
  insuranceType,
  leads,
  onUpdateLead,
  onDelete,
  onRestore,
}: {
  insuranceType: InsuranceType
  leads: Lead[]
  onUpdateLead: (id: string, status: "iletildi" | "onaylandi", premium?: number | null, commission?: number | null) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}) {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [modal, setModal] = React.useState<{
    open: boolean
    leadId: string | null
    type: "iletildi" | "onaylandi"
  }>({ open: false, leadId: null, type: "onaylandi" })

  const [premium, setPremium] = React.useState("")
  const [commission, setCommission] = React.useState("")

  const scoped = leads.filter((l) => l.insuranceType === insuranceType)
  const filtered = scoped.filter((l) =>
    filter === "all" ? true : l.status === filter
  )

  const label =
    INSURANCE_TYPES.find((t) => t.id === insuranceType)?.label ?? "Talepler"
  const newCount = scoped.filter((l) => l.status === "yeni").length
  const sentCount = scoped.filter((l) => l.status === "iletildi").length
  const approvedCount = scoped.filter((l) => l.status === "onaylandi").length

  const deletedCount = scoped.filter((l) => l.status === "silindi").length

  const showPlate = insuranceType === "arac"
  const showRegistration = insuranceType === "arac"
  const showAddress = insuranceType === "dask" || insuranceType === "konut"

  const openModal = (lead: Lead, type: "iletildi" | "onaylandi") => {
    setModal({ open: true, leadId: lead.id, type })
    setPremium(lead.premium ? String(lead.premium) : "")
    setCommission(lead.commission ? String(lead.commission) : "")
  }

  const handleSave = () => {
    if (!modal.leadId) return
    onUpdateLead(
      modal.leadId,
      modal.type,
      premium ? parseFloat(premium) : null,
      commission ? parseFloat(commission) : null
    )
    setModal({ open: false, leadId: null, type: "onaylandi" })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{label} Talepleri</CardTitle>
        <CardDescription>{DESCRIPTIONS[insuranceType]}</CardDescription>
        <CardAction>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">Tümü ({scoped.length})</TabsTrigger>
              <TabsTrigger value="yeni">Yeni ({newCount})</TabsTrigger>
              <TabsTrigger value="iletildi">İletildi ({sentCount})</TabsTrigger>
              <TabsTrigger value="onaylandi">Onaylanan ({approvedCount})</TabsTrigger>
              <TabsTrigger value="silindi">Silinenler ({deletedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {filtered.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>Kayıt yok</EmptyTitle>
              <EmptyDescription>
                Bu filtreye uygun talep bulunmuyor.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Tarih</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  {showPlate && <TableHead>Plaka</TableHead>}
                  <TableHead>TC Kimlik No</TableHead>
                  <TableHead>Doğum Tarihi</TableHead>
                  {showRegistration && (
                    <TableHead>Belge / Tescil</TableHead>
                  )}
                  {showAddress && <TableHead>Adres</TableHead>}
                  <TableHead>Telefon</TableHead>
                  <TableHead>Finans (P/K)</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="pr-4 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">
                      {formatDate(lead.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.name}</span>
                        <span className="max-w-52 truncate text-xs text-muted-foreground">
                          {lead.note}
                        </span>
                      </div>
                    </TableCell>
                    {showPlate && (
                      <TableCell>
                        {lead.plate ? (
                          <CopyField value={lead.plate} label="Plaka" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <CopyField value={lead.tc} label="TC Kimlik No" />
                    </TableCell>
                    <TableCell>
                      <CopyField value={lead.birthDate} label="Doğum Tarihi" />
                    </TableCell>
                    {showRegistration && (
                      <TableCell>
                        {lead.registrationNo ? (
                          <CopyField
                            value={lead.registrationNo}
                            label="Belge / Tescil Numarası"
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    {showAddress && (
                      <TableCell className="max-w-56">
                        <span className="block truncate text-sm text-muted-foreground">
                          {lead.address ?? "—"}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
                        <Phone className="size-3 text-muted-foreground" />
                        {lead.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.premium || lead.commission ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{formatCurrency(lead.premium || 0)}</span>
                          <span className="text-success">{formatCurrency(lead.commission || 0)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.status === "yeni" && <Badge variant="default">Yeni</Badge>}
                      {lead.status === "iletildi" && <Badge variant="secondary">İletildi</Badge>}
                      {lead.status === "onaylandi" && <Badge variant="outline" className="border-success text-success bg-success/10">Onaylandı</Badge>}
                      {lead.status === "silindi" && <Badge variant="outline" className="border-muted-foreground text-muted-foreground bg-muted">Silindi</Badge>}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {lead.status === "silindi" ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => onRestore(lead.id)}
                                  aria-label="Geri Al"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                />
                              }
                            >
                              <RotateCcw className="size-4" />
                            </TooltipTrigger>
                            <TooltipContent>Talebi geri al</TooltipContent>
                          </Tooltip>
                        ) : (
                          <>
                            {lead.status !== "onaylandi" ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => openModal(lead, "onaylandi")}
                                      aria-label="Satışa Çevir"
                                      className="text-success hover:text-success hover:bg-success/10"
                                    />
                                  }
                                >
                                  <Banknote className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent>Satışa çevir / Onayla</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => openModal(lead, "onaylandi")}
                                      aria-label="Düzenle"
                                      className="text-muted-foreground hover:text-foreground"
                                    />
                                  }
                                >
                                  <Pencil className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent>Satış bilgilerini düzenle</TooltipContent>
                              </Tooltip>
                            )}

                            {lead.status === "yeni" && (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => openModal(lead, "iletildi")}
                                      aria-label="Teklif İletildi"
                                      className="text-primary hover:text-primary hover:bg-primary/10"
                                    />
                                  }
                                >
                                  <Check className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent>Müşteriye teklif iletildi</TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onDelete(lead.id)}
                                    aria-label="Sil"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  />
                                }
                              >
                                <Trash2 className="size-4" />
                              </TooltipTrigger>
                              <TooltipContent>Talebi sil</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={modal.open} onOpenChange={(open) => !open && setModal({ open: false, leadId: null, type: "onaylandi" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal.type === "onaylandi" ? "Satışı Onayla" : "Teklif İletildi"}
            </DialogTitle>
            <DialogDescription>
              {modal.type === "onaylandi" 
                ? "Poliçe satışı gerçekleşti. Kazanılan net komisyonu ve prim tutarını girin." 
                : "Müşteriye teklif iletildi. Finansal analizler için beklenen (tahmini) poliçe tutarını ve komisyonu girebilirsiniz (opsiyonel)."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="premium">Poliçe Tutarı (Prim) - TL</Label>
              <Input
                id="premium"
                type="number"
                placeholder="Örn: 15000"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission">Acente Komisyonu - TL</Label>
              <Input
                id="commission"
                type="number"
                placeholder="Örn: 2250"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal({ open: false, leadId: null, type: "onaylandi" })}>
              İptal
            </Button>
            <Button onClick={handleSave}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
