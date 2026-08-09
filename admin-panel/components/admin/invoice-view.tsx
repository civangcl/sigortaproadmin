"use client"

import * as React from "react"
import {
  Printer,
  Plus,
  Trash2,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Client } from "@/lib/mock-data"

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  price: number
}

export function InvoiceView({
  clients,
  companyProfile,
}: {
  clients: Client[]
  companyProfile: any
}) {
  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [items, setItems] = React.useState<InvoiceItem[]>([
    { id: "1", description: "Trafik Sigortası Poliçe Primi", quantity: 1, price: 5500 },
  ])
  const [taxRate, setTaxRate] = React.useState<number>(0)
  const [invoiceDate, setInvoiceDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [invoiceNo, setInvoiceNo] = React.useState("INV-2026-001")
  
  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), description: "", quantity: 1, price: 0 },
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handlePrintAndSave = async () => {
    if (!selectedClientId) {
      toast.error("Fatura oluşturmak için önce müşteri seçmelisiniz.")
      return
    }

    // Save to backend
    const { createInvoice } = await import("@/app/actions/invoices")
    const res = await createInvoice({
      invoiceNo,
      date: invoiceDate,
      taxRate,
      subtotal,
      taxAmount,
      total,
      clientId: selectedClientId,
      items: items.map(i => ({ description: i.description, quantity: i.quantity, price: i.price }))
    })

    if (res.success) {
      toast.success("Fatura başarıyla kaydedildi!")
      window.print()
    } else {
      toast.error(res.error || "Fatura kaydedilirken hata oluştu.")
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Editor Panel (Hidden in Print) */}
      <div className="flex w-full flex-col gap-6 lg:w-1/3 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Fatura Detayları</CardTitle>
            <CardDescription>Müşteri ve fatura bilgilerini girin.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Müşteri Seçin</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.tc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Fatura No</Label>
                <Input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label>Vergi Oranı (%)</Label>
              <Select value={taxRate.toString()} onValueChange={(val) => setTaxRate(Number(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Vergi seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">%0 (Muaf)</SelectItem>
                  <SelectItem value="10">%10 (BSMV)</SelectItem>
                  <SelectItem value="20">%20 (KDV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Hizmet Kalemleri</CardTitle>
              <CardDescription>Poliçe veya hizmet ekleyin.</CardDescription>
            </div>
            <Button size="icon-sm" variant="outline" onClick={addItem}>
              <Plus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.map((item, i) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Kalem {i + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Hizmet / Poliçe açıklaması"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Adet"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Birim Fiyat"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handlePrintAndSave} className="w-full gap-2 py-6 text-base shadow-lg">
          <Save className="size-5" />
          Kaydet ve Yazdır
        </Button>
      </div>

      {/* Preview Panel (A4 Format) - Shown normally AND in Print mode */}
      <div className="flex-1 w-full flex justify-center bg-muted/30 p-2 sm:p-8 rounded-xl print:bg-white print:p-0 print:m-0 print:block print:overflow-visible">
        
        {/* A4 Container */}
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black shadow-xl print:shadow-none print:w-full print:max-w-none print:h-auto print:min-h-0 rounded-sm relative flex flex-col mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start p-10 pb-6 border-b-2 border-neutral-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-neutral-900">FIRAT ECE SİGORTA</h1>
                  <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Profesyonel Brokerlik</p>
                </div>
              </div>
            </div>
            
            <div className="text-right flex flex-col gap-1">
              <h2 className="text-4xl font-light tracking-tight text-neutral-300 uppercase mb-2">Fatura</h2>
              <p className="text-sm font-semibold text-neutral-700">No: {invoiceNo}</p>
              <p className="text-sm text-neutral-500">
                Tarih: {invoiceDate ? new Intl.DateTimeFormat("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(invoiceDate)) : "-"}
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex justify-between p-10 py-8 gap-8">
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Gönderen</p>
              <p className="text-base font-bold text-neutral-900">{companyProfile?.name || "Fırat Ece Sigorta Aracılık Hizm."}</p>
              <div className="flex flex-col gap-1 mt-1 text-sm text-neutral-600">
                <span className="flex items-center gap-2"><MapPin className="size-3.5" /> {companyProfile?.address || "Adres girilmedi"}</span>
                <span className="flex items-center gap-2"><Phone className="size-3.5" /> {companyProfile?.phone || "Telefon girilmedi"}</span>
                <span className="flex items-center gap-2"><Mail className="size-3.5" /> {companyProfile?.email || "E-posta girilmedi"}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 bg-neutral-50 p-6 rounded-xl border border-neutral-100">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Müşteri</p>
              {selectedClient ? (
                <>
                  <p className="text-lg font-bold text-neutral-900">{selectedClient.name}</p>
                  <div className="flex flex-col gap-1 mt-1 text-sm text-neutral-600">
                    <span className="flex items-center gap-2"><Building2 className="size-3.5" /> TC/VKN: {selectedClient.tc}</span>
                    <span className="flex items-center gap-2"><Phone className="size-3.5" /> {selectedClient.phone}</span>
                    <span className="flex items-center gap-2"><MapPin className="size-3.5" /> {selectedClient.city}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-neutral-400 italic py-4">Sol panelden müşteri seçiniz...</p>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="px-10 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th className="py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-[50%]">Açıklama</th>
                  <th className="py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center w-[15%]">Adet</th>
                  <th className="py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right w-[15%]">Birim Fiyat</th>
                  <th className="py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right w-[20%]">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-neutral-400 italic border-b border-neutral-100">
                      Kalem bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-100 group">
                      <td className="py-4 text-sm font-medium text-neutral-800">{item.description || "-"}</td>
                      <td className="py-4 text-sm text-neutral-600 text-center">{item.quantity}</td>
                      <td className="py-4 text-sm text-neutral-600 text-right">
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.price)}
                      </td>
                      <td className="py-4 text-sm font-semibold text-neutral-900 text-right">
                        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-8">
              <div className="w-1/2 rounded-xl bg-neutral-50 p-6">
                <div className="flex justify-between py-2 text-sm text-neutral-600">
                  <span>Ara Toplam</span>
                  <span>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm text-neutral-600 border-b border-neutral-200">
                  <span>Vergi ({taxRate}%)</span>
                  <span>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(taxAmount)}</span>
                </div>
                <div className="flex justify-between py-4 text-xl font-bold text-neutral-900">
                  <span>Genel Toplam</span>
                  <span>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto p-10 pt-4 text-xs text-neutral-400 border-t border-neutral-100 flex justify-between items-end">
            <div>
              <p className="font-semibold text-neutral-600 mb-1">Banka Bilgileri</p>
              <p>Banka: {companyProfile?.bankName || "Banka bilgisi girilmedi"}</p>
              <p>IBAN: {companyProfile?.iban || "IBAN girilmedi"}</p>
              <p>Alıcı: {companyProfile?.ownerName || companyProfile?.name || "Alıcı adı girilmedi"}</p>
            </div>
            <div className="text-right">
              <p>İşbu fatura/makbuz elektronik ortamda üretilmiştir.</p>
              <p className="font-semibold text-neutral-500 mt-1">Teşekkür ederiz.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
