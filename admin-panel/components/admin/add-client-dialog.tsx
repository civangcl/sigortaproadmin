"use client"

import * as React from "react"
import { UserPlus, Car, FileText, User } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type Client,
  type PolicyType,
  daysFromNow,
} from "@/lib/mock-data"

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon className="size-4 text-primary" />
      <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
        {children}
      </span>
    </div>
  )
}

const EMPTY = {
  name: "",
  tc: "",
  phone: "",
  email: "",
  city: "",
  plate: "",
  brand: "",
  model: "",
  year: String(new Date().getFullYear()),
  policyType: "Kasko" as PolicyType,
  company: "",
  premium: "",
  termDays: "365",
}

export function AddClientDialog({
  open,
  onOpenChange,
  onAddClient,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClient: (client: Client) => void
}) {
  const [form, setForm] = React.useState(EMPTY)

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = `c${Date.now()}`
    const premium = Number(form.premium) || 0
    const term = Number(form.termDays) || 365
    const client: Client = {
      id,
      name: form.name.trim() || "İsimsiz Müşteri",
      tc: form.tc.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim() || "—",
      since: daysFromNow(0),
      vehicle: {
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year) || new Date().getFullYear(),
        engineNo: "—",
        chassisNo: "—",
      },
      policies: [
        {
          id: `${id}-p1`,
          type: form.policyType,
          company: form.company.trim() || "—",
          policyNo: `${form.policyType.slice(0, 3).toUpperCase()}-${id.slice(-6)}`,
          premium,
          startDate: daysFromNow(0),
          endDate: daysFromNow(term),
        },
      ],
      financials: premium
        ? [
            {
              id: `${id}-f1`,
              date: daysFromNow(0),
              description: `${form.policyType} poliçe tahsilatı`,
              amount: premium,
              kind: "tahsilat",
            },
          ]
        : [],
    }
    onAddClient(client)
    setForm(EMPTY)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <UserPlus className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
              <DialogDescription>
                Müşteri, araç ve poliçe bilgilerini girin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <FieldGroup className="gap-4 p-4">
              <SectionLabel icon={User}>Müşteri Bilgileri</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Ad Soyad</FieldLabel>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tc">TC Kimlik No</FieldLabel>
                  <Input
                    id="tc"
                    inputMode="numeric"
                    value={form.tc}
                    onChange={(e) => set("tc", e.target.value)}
                    placeholder="12345678901"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="0532 000 00 00"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="city">Şehir</FieldLabel>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="İstanbul"
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="email">E-posta</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="ornek@eposta.com"
                  />
                </Field>
              </div>

              <SectionLabel icon={Car}>Araç Bilgileri</SectionLabel>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field className="col-span-2">
                  <FieldLabel htmlFor="plate">Plaka</FieldLabel>
                  <Input
                    id="plate"
                    value={form.plate}
                    onChange={(e) => set("plate", e.target.value)}
                    placeholder="34 ABC 123"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="brand">Marka</FieldLabel>
                  <Input
                    id="brand"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="Toyota"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="year">Yıl</FieldLabel>
                  <Input
                    id="year"
                    inputMode="numeric"
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                  />
                </Field>
                <Field className="col-span-2 sm:col-span-4">
                  <FieldLabel htmlFor="model">Model</FieldLabel>
                  <Input
                    id="model"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    placeholder="Corolla 1.8 Hybrid"
                  />
                </Field>
              </div>

              <SectionLabel icon={FileText}>Poliçe Bilgileri</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Poliçe Türü</FieldLabel>
                  <Select
                    value={form.policyType}
                    onValueChange={(v) => set("policyType", v as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kasko">Kasko</SelectItem>
                      <SelectItem value="Trafik">Trafik</SelectItem>
                      <SelectItem value="DASK">DASK</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="company">Sigorta Şirketi</FieldLabel>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="Allianz"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="premium">Prim Tutarı (TRY)</FieldLabel>
                  <Input
                    id="premium"
                    inputMode="numeric"
                    value={form.premium}
                    onChange={(e) => set("premium", e.target.value)}
                    placeholder="25000"
                  />
                </Field>
                <Field>
                  <FieldLabel>Poliçe Süresi</FieldLabel>
                  <Select
                    value={form.termDays}
                    onValueChange={(v) => set("termDays", v as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="365">1 Yıl</SelectItem>
                      <SelectItem value="180">6 Ay</SelectItem>
                      <SelectItem value="30">1 Ay</SelectItem>
                      <SelectItem value="7">7 Gün (test)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="m-0 border-t bg-background p-4 flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit">
              <UserPlus className="mr-2 size-4" />
              Müşteriyi Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
