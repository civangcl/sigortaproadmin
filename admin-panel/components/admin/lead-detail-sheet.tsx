import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyField } from "@/components/admin/copy-field"
import { formatCurrency, formatDate, INSURANCE_TYPES } from "@/lib/mock-data"
import { MessageCircle, Check, Phone } from "lucide-react"
import { toast } from "sonner"

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  companyName = "SigortaPro",
}: {
  lead: any
  open: boolean
  onOpenChange: (open: boolean) => void
  companyName?: string
}) {
  if (!lead) return null

  const handleWhatsApp = () => {
    if (!lead.phone) {
      toast.error("Müşteri telefon numarası bulunamadı.");
      return;
    }
    if (!lead.premium) {
      toast.error("Lütfen önce bir teklif tutarı (prim) giriniz.");
      return;
    }

    let normalizedPhone = lead.phone.replace(/[\s\-\(\)\+]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '90' + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith('90')) {
      normalizedPhone = '90' + normalizedPhone;
    }

    const formattedAmount = formatCurrency(lead.premium);
    
    // Find friendly label for insurance type
    const insuranceTypeObj = INSURANCE_TYPES.find(t => t.id === lead.insuranceType);
    const friendlyType = insuranceTypeObj ? insuranceTypeObj.label : lead.insuranceType.toUpperCase();
    // Add "sigortası" suffix if it doesn't have it (except DASK/Kasko which are often used alone, but user example: "Kasko teklifiniz hazırlanmıştır. İş Yeri Sigortası teklifiniz...")
    let typeDisplay = friendlyType;
    if (friendlyType === 'İş Yeri' || friendlyType === 'Konut' || friendlyType === 'Sağlık') {
       typeDisplay += ' Sigortası';
    }

    const message = `Merhaba ${lead.name},\n\n${companyName} tarafından hazırlanan ${typeDisplay} teklifiniz ${formattedAmount}'dir.\n\nBu tutarı onaylıyor musunuz?\n\nEVET / HAYIR`;
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/${normalizedPhone}?text=${encodedMessage}`, '_blank');
    toast.success("Mesaj WhatsApp'ta hazırlandı.");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Talep Detayı</SheetTitle>
          <SheetDescription>
            {lead.name} tarafından oluşturulan {lead.insuranceType.toUpperCase()} talebi
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Müşteri Bilgileri</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Ad Soyad</span>
                <span className="font-medium">{lead.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Telefon</span>
                <span className="font-medium inline-flex items-center gap-1.5"><Phone className="size-3" /> {lead.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">TC Kimlik</span>
                <CopyField value={lead.tc} />
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Doğum Tarihi</span>
                <span>{lead.birthDate}</span>
              </div>
              {lead.city && (
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">İl</span>
                  <span>{lead.city}</span>
                </div>
              )}
              {lead.address && (
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Adres</span>
                  <span className="font-medium text-right break-all ml-4 max-w-[200px]">{lead.address}</span>
                </div>
              )}
            </div>
          </div>

          {(lead.plate || lead.registrationNo || (lead.formData && Object.keys(lead.formData).length > 0)) && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Ek Bilgiler</h3>
              <div className="grid gap-2 text-sm">
                {lead.plate && (
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-muted-foreground">Plaka</span>
                    <CopyField value={lead.plate} />
                  </div>
                )}
                {lead.registrationNo && (
                  <div className="flex justify-between items-center py-1 border-b">
                    <span className="text-muted-foreground">Belge / Tescil</span>
                    <CopyField value={lead.registrationNo} />
                  </div>
                )}
                {lead.formData && Object.entries(lead.formData).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  
                  // Simple human readable mapper
                  const labels: Record<string, string> = {
                    buildingYear: 'Bina Yapım Yılı',
                    buildingFloorCount: 'Bina Kat Sayısı',
                    apartmentFloor: 'Daire Katı',
                    grossSquareMeters: 'Brüt m²',
                    buildingType: 'Yapı Tarzı',
                    brand: 'Marka',
                    model: 'Model',
                    year: 'Model Yılı',
                    chassisNo: 'Şasi No',
                    propertyType: 'Konut Tipi',
                    buildingAge: 'Bina Yaşı',
                    floor: 'Bulunduğu Kat',
                    businessName: 'Firma Adı',
                    businessType: 'Faaliyet Alanı',
                    taxNumber: 'Vergi Numarası',
                    coverageType: 'Sigorta Tipi'
                  };

                  return (
                    <div key={key} className="flex justify-between items-center py-1 border-b">
                      <span className="text-muted-foreground">{labels[key] || key}</span>
                      <span className="font-medium text-right break-all ml-4">{String(value)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Teklif</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <div className="text-muted-foreground mb-1">Teklif Tutarı:</div>
                <div className="font-semibold text-lg">{lead.premium ? formatCurrency(lead.premium) : "Henüz girilmedi"}</div>
              </div>
              <div className="text-sm text-right">
                <div className="text-muted-foreground mb-1">Durum:</div>
                <Badge variant={lead.status === 'iletildi' ? 'secondary' : (lead.status === 'onaylandi' ? 'outline' : 'default')} className={lead.status === 'onaylandi' ? 'border-success text-success bg-success/10' : ''}>
                  {lead.status === 'iletildi' ? 'İletildi' : lead.status === 'onaylandi' ? 'Onaylandı' : lead.status === 'yeni' ? 'Yeni' : lead.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1" disabled>
                <Check className="mr-2 size-4" /> İletildi Olarak İşaretle
              </Button>
              <Button 
                className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white disabled:opacity-50"
                onClick={handleWhatsApp}
                disabled={!lead.phone}
              >
                <MessageCircle className="mr-2 size-4" /> WhatsApp
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Teklif tutarı girmek için ana tablodaki "Satışa Çevir" veya "İletildi" ikonlarını kullanabilirsiniz.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
