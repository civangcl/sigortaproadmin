"use client"

import * as React from "react"
import { toast } from "sonner"
import { Save, UserCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateCompanyProfile } from "@/app/actions/admin"

export function ProfileView({
  company,
  onUpdate,
}: {
  company: any
  onUpdate: (data: any) => void
}) {
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    id: company?.id || "",
    name: company?.name || "",
    ownerName: company?.ownerName || "",
    iban: company?.iban || "",
    bankName: company?.bankName || "",
    address: company?.address || "",
    phone: company?.phone || "",
    email: company?.email || "",
  })

  // Ensure form updates when company prop changes
  React.useEffect(() => {
    if (company) {
      setFormData({
        id: company.id || "",
        name: company.name || "",
        ownerName: company.ownerName || "",
        iban: company.iban || "",
        bankName: company.bankName || "",
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
      })
    }
  }, [company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await updateCompanyProfile(formData)
    setLoading(false)

    if (res.success) {
      toast.success("Profil güncellendi.")
      onUpdate(formData)
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Firma Profili</h2>
        <p className="text-muted-foreground">
          Faturada ve diğer resmi belgelerde görünecek firma bilgilerinizi düzenleyin.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCircle className="size-6" />
            </div>
            <div>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Acente bilgileri, banka detayları ve iletişim.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Firma Unvanı</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Örn: Fırat Ece Sigorta Aracılık Hizm."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Yetkili Adı</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Ad Soyad"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banka Adı</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Örn: Ziraat Bankası Kadıköy Şb."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN Numarası</Label>
                <Input
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Firma Telefonu</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 216 555 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Firma E-postası</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@firma.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Tam Adres</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Fatura adresi"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="size-4" />
                {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
