"use client"

import * as React from "react"
import { toast } from "sonner"
import { Check, Trash2, Inbox, Phone, Banknote, RotateCcw, Pencil, MessageCircle, MoreVertical, Filter } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import {
  type Lead,
  type InsuranceType,
  INSURANCE_TYPES,
  formatDate,
  formatCurrency,
} from "@/lib/mock-data"
import { CopyField } from "@/components/admin/copy-field"
import { LeadDetailSheet } from "@/components/admin/lead-detail-sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Filter = "all" | "yeni" | "iletildi" | "onaylandi" | "silindi"

const DESCRIPTIONS: Record<InsuranceType, string> = {
  arac: "Araç sigortası talepleri — Tramer sorgusu için plaka, TC, doğum tarihi ve tescil no.",
  kasko: "Kasko poliçesi teklif talepleri — araç ve kimlik bilgileri.",
  trafik: "Trafik poliçesi teklif talepleri — plaka, TC ve belge no.",
  dask: "Zorunlu deprem sigortası (DASK) teklif talepleri — kimlik ve adres bilgileri.",
  saglik: "Sağlık sigortası teklif talepleri — TC ve doğum tarihi ile risk sorgusu.",
  konut: "Konut ve eşya sigortası teklif talepleri — kimlik ve adres bilgileri.",
  is_yeri: "İş yeri sigortası teklif talepleri — vergi numarası ve faaliyet alanı."
}

export function LeadsView({
  companyName = "SigortaPro",
  insuranceType,
  leads,
  onUpdateLead,
  onDelete,
  onRestore,
  onSelectLead,
}: {
  companyName?: string
  insuranceType: InsuranceType
  leads: Lead[]
  onUpdateLead: (id: string, status: "iletildi" | "onaylandi" | "silindi", premium?: number | null, commission?: number | null) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRestore: (id: string) => Promise<void>
  onSelectLead: (id: string) => void
}) {
  const [filter, setFilter] = React.useState<Filter>("all")

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

  return (
    <>
      <Card className="overflow-hidden border-none sm:border-solid shadow-none sm:shadow-sm">
        <CardHeader className="px-0 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>{label} Talepleri</CardTitle>
              <CardDescription className="hidden sm:block">{DESCRIPTIONS[insuranceType]}</CardDescription>
            </div>
            
            {/* Desktop Tabs */}
            <div className="hidden lg:block">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList>
                  <TabsTrigger value="all">Tümü ({scoped.length})</TabsTrigger>
                  <TabsTrigger value="yeni">Yeni ({newCount})</TabsTrigger>
                  <TabsTrigger value="iletildi">İletildi ({sentCount})</TabsTrigger>
                  <TabsTrigger value="onaylandi">Onaylanan ({approvedCount})</TabsTrigger>
                  <TabsTrigger value="silindi">Silinenler ({deletedCount})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Mobile / Tablet Filter Dropdown */}
            <div className="lg:hidden flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>
                      Filtre: {filter === "all" ? "Tümü" : 
                             filter === "yeni" ? "Yeni" : 
                             filter === "iletildi" ? "İletildi" : 
                             filter === "onaylandi" ? "Onaylandı" : "Silinenler"}
                    </span>
                    <Filter className="size-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]" align="start">
                  <DropdownMenuItem onClick={() => setFilter("all")}>Tümü ({scoped.length})</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("yeni")}>Yeni ({newCount})</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("iletildi")}>İletildi ({sentCount})</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("onaylandi")}>Onaylanan ({approvedCount})</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("silindi")}>Silinenler ({deletedCount})</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
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
            <>
              {/* MOBILE CARD VIEW */}
              <div className="md:hidden flex flex-col gap-3 pb-safe">
                {filtered.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
                    onClick={() => onSelectLead(lead.id)}
                  >
                    <div className="flex justify-between p-4 pb-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-semibold text-base">{lead.name}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{lead.insuranceType}</div>
                      </div>
                      <div>
                        {lead.status === "yeni" && <Badge variant="default">YENİ</Badge>}
                        {lead.status === "iletildi" && <Badge variant="secondary">İLETİLDİ</Badge>}
                        {lead.status === "onaylandi" && <Badge variant="outline" className="border-success text-success bg-success/10">ONAYLANDI</Badge>}
                        {lead.status === "silindi" && <Badge variant="outline" className="border-muted-foreground text-muted-foreground bg-muted">SİLİNDİ</Badge>}
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 bg-muted/40 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Phone className="size-3.5 text-muted-foreground" /> {lead.phone}
                      </div>
                      <div className="text-muted-foreground truncate max-w-[120px]">
                        {lead.city || lead.address || "Şehir bilinmiyor"}
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 flex justify-between items-center bg-card">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">Teklif Tutarı</span>
                        <span className="font-medium text-sm">
                          {lead.premium ? formatCurrency(lead.premium) : "Henüz verilmedi"}
                        </span>
                      </div>
                      <Button size="sm" variant="secondary" className="px-5 font-medium rounded-full h-8">
                        Talebi İncele
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[110px]">Tarih</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Şehir</TableHead>
                      <TableHead>Teklif (Pr/Km)</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((lead) => (
                      <TableRow key={lead.id} className="cursor-pointer group" onClick={() => onSelectLead(lead.id)}>
                        <TableCell className="text-muted-foreground tabular-nums text-xs">
                          {formatDate(lead.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{lead.name}</span>
                            {lead.tc && lead.tc !== "—" && (
                               <span className="text-[11px] text-muted-foreground font-mono">TC: {lead.tc}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
                            <Phone className="size-3 text-muted-foreground" />
                            {lead.phone}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{lead.city || "—"}</span>
                        </TableCell>
                        <TableCell>
                          {lead.premium || lead.commission ? (
                            <div className="flex flex-col text-xs">
                              <span className="font-medium">{formatCurrency(lead.premium || 0)}</span>
                              {lead.commission ? <span className="text-success">{formatCurrency(lead.commission)}</span> : null}
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
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">İncele</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
