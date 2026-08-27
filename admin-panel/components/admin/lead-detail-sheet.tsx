import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyField } from "@/components/admin/copy-field"
import { formatCurrency, formatDate, INSURANCE_TYPES } from "@/lib/mock-data"
import { MessageCircle, Check, Phone, Plus, X, ArrowRight, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  companyName = "SigortaPro",
  onUpdateLead,
  onDeleteLead,
  onAddClient,
}: {
  lead: any
  open: boolean
  onOpenChange: (open: boolean) => void
  companyName?: string
  onUpdateLead?: (id: string, status: "iletildi" | "onaylandi" | "silindi", premium?: number | null, commission?: number | null) => Promise<void>
  onDeleteLead?: (id: string) => Promise<void>
  onAddClient?: (clientData: any) => Promise<void>
}) {
  const [isEditingPrice, setIsEditingPrice] = React.useState(false)
  const [premiumInput, setPremiumInput] = React.useState("")
  const [commissionInput, setCommissionInput] = React.useState("")
  const [confirmApproveOpen, setConfirmApproveOpen] = React.useState(false)
  
  React.useEffect(() => {
    if (lead && open) {
      setPremiumInput(lead.premium ? String(lead.premium) : "")
      setCommissionInput(lead.commission ? String(lead.commission) : "")
      setIsEditingPrice(false)
    }
  }, [lead, open])

  if (!lead) return null

  const handleSavePrice = async () => {
    if (!premiumInput) {
      toast.error("Teklif tutarı (prim) girmelisiniz.")
      return
    }
    if (onUpdateLead) {
      // Just saving the price, status remains the same unless it's new, then maybe keep it new until sent
      await onUpdateLead(
        lead.id, 
        lead.status, 
        parseFloat(premiumInput), 
        commissionInput ? parseFloat(commissionInput) : null
      )
      setIsEditingPrice(false)
      toast.success("Teklif tutarı kaydedildi.")
    }
  }

  const handleWhatsApp = () => {
    if (!lead.phone) {
      toast.error("Müşteri telefon numarası bulunamadı.")
      return
    }
    if (!lead.premium && !premiumInput) {
      toast.error("Lütfen önce bir teklif tutarı (prim) giriniz.")
      return
    }

    let normalizedPhone = lead.phone.replace(/[\s\-\(\)\+]/g, '')
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '90' + normalizedPhone.slice(1)
    } else if (!normalizedPhone.startsWith('90')) {
      normalizedPhone = '90' + normalizedPhone
    }

    const premiumToUse = lead.premium || parseFloat(premiumInput)
    const formattedAmount = formatCurrency(premiumToUse)
    
    const insuranceTypeObj = INSURANCE_TYPES.find(t => t.id === lead.insuranceType)
    const friendlyType = insuranceTypeObj ? insuranceTypeObj.label : lead.insuranceType.toUpperCase()
    let typeDisplay = friendlyType
    if (friendlyType === 'İş Yeri' || friendlyType === 'Konut' || friendlyType === 'Sağlık') {
       typeDisplay += ' Sigortası'
    }

    const message = `Merhaba ${lead.name},\n\n${companyName} tarafından hazırlanan ${typeDisplay} teklifiniz ${formattedAmount}'dir.\n\nBu tutarı onaylıyor musunuz?\n\nEVET / HAYIR`
    const encodedMessage = encodeURIComponent(message)
    
    window.open(`https://wa.me/${normalizedPhone}?text=${encodedMessage}`, '_blank')
    toast.success("Mesaj WhatsApp'ta hazırlandı.")
  }

  const handleMarkSent = async () => {
    if (onUpdateLead) {
      await onUpdateLead(lead.id, "iletildi", lead.premium, lead.commission)
    }
  }

  const handleApprove = async () => {
    if (onUpdateLead) {
      await onUpdateLead(lead.id, "onaylandi", lead.premium, lead.commission)
      
      // Attempt conversion to client
      if (onAddClient) {
        await onAddClient({
          name: lead.name,
          tc: lead.tc !== "—" ? lead.tc : "",
          phone: lead.phone !== "—" ? lead.phone : "",
          city: lead.city || "",
          vehicle: {
            plate: lead.plate || "",
            brand: lead.brand || lead.formData?.brand || "",
            model: lead.model || lead.formData?.model || "",
            year: lead.year || lead.formData?.year || new Date().getFullYear(),
            chassisNo: lead.formData?.chassisNo || ""
          }
        })
      }
      setConfirmApproveOpen(false)
      onOpenChange(false)
    }
  }

  const handleReject = async () => {
    if (onDeleteLead) {
      await onDeleteLead(lead.id)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full !max-w-full sm:!max-w-md overflow-hidden flex flex-col p-0">
          <SheetHeader className="px-4 py-4 sm:px-6 border-b shrink-0">
            <div className="flex items-start justify-between pr-8">
              <div>
                <SheetTitle className="text-lg text-left">{lead.name}</SheetTitle>
                <SheetDescription className="text-sm text-left">
                  {lead.insuranceType.toUpperCase()} Talebi
                </SheetDescription>
              </div>
              <Badge variant={lead.status === 'iletildi' ? 'secondary' : (lead.status === 'onaylandi' ? 'outline' : 'default')} className={lead.status === 'onaylandi' ? 'border-success text-success bg-success/10' : ''}>
                  {lead.status === 'iletildi' ? 'İletildi' : lead.status === 'onaylandi' ? 'Onaylandı' : lead.status === 'yeni' ? 'Yeni' : lead.status}
              </Badge>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-6">
            {/* Müşteri Bilgileri */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Müşteri Bilgileri</h3>
              <div className="grid gap-2 text-sm bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground shrink-0">Telefon</span>
                  <span className="font-medium inline-flex items-center gap-1.5 min-w-0"><Phone className="size-3 shrink-0" /> <span className="truncate">{lead.phone}</span></span>
                </div>
                {lead.tc && lead.tc !== "—" && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground shrink-0">TC Kimlik</span>
                    <div className="min-w-0"><CopyField value={lead.tc} /></div>
                  </div>
                )}
                {lead.birthDate && lead.birthDate !== "—" && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground shrink-0">Doğum Tarihi</span>
                    <span className="truncate min-w-0">{lead.birthDate}</span>
                  </div>
                )}
                {lead.city && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground shrink-0">İl / İlçe</span>
                    <span className="truncate min-w-0">{lead.city}</span>
                  </div>
                )}
                {lead.address && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground shrink-0">Adres</span>
                    <span className="font-medium text-right break-words ml-4 max-w-[200px]">{lead.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ek Bilgiler */}
            {(lead.plate || lead.registrationNo || (lead.formData && Object.keys(lead.formData).length > 0)) && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-foreground">Sigorta & Ek Bilgiler</h3>
                <div className="grid gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  {lead.plate && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground shrink-0">Plaka</span>
                      <div className="min-w-0"><CopyField value={lead.plate} /></div>
                    </div>
                  )}
                  {lead.registrationNo && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground shrink-0">Belge / Tescil</span>
                      <div className="min-w-0"><CopyField value={lead.registrationNo} /></div>
                    </div>
                  )}
                  {lead.formData && Object.entries(lead.formData).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    
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
                      <div key={key} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground shrink-0">{labels[key] || key}</span>
                        <span className="font-medium text-right break-words ml-4 max-w-[200px]">{String(value)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Teklif ve Finansal */}
            <div>
               <h3 className="text-sm font-semibold mb-3 text-foreground">Teklif Durumu</h3>
               {isEditingPrice ? (
                 <div className="bg-muted p-4 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="premium-input">Teklif Tutarı (TL)</Label>
                      <Input 
                        id="premium-input" 
                        type="number" 
                        placeholder="Örn: 12500" 
                        value={premiumInput} 
                        onChange={(e) => setPremiumInput(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission-input">Komisyon (TL) - Opsiyonel</Label>
                      <Input 
                        id="commission-input" 
                        type="number" 
                        placeholder="Örn: 1500" 
                        value={commissionInput} 
                        onChange={(e) => setCommissionInput(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditingPrice(false)}>İptal</Button>
                      <Button className="flex-1" onClick={handleSavePrice}>Kaydet</Button>
                    </div>
                 </div>
               ) : (
                 <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Poliçe Primi</div>
                      <div className="text-lg font-semibold">{lead.premium ? formatCurrency(lead.premium) : "Fiyat Belirlenmedi"}</div>
                      {lead.commission && (
                        <div className="text-xs text-success mt-0.5">Komisyon: {formatCurrency(lead.commission)}</div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingPrice(true)}>
                      {lead.premium ? "Düzenle" : "Fiyat Gir"}
                    </Button>
                 </div>
               )}
            </div>

            {/* İşlem Geçmişi Dummy */}
            <div>
               <h3 className="text-sm font-semibold mb-3 text-foreground">İşlem Geçmişi</h3>
               <div className="text-xs text-muted-foreground pl-2 border-l-2 border-border/50 py-1">
                 {formatDate(lead.date)} — Talep sisteme düştü.
               </div>
            </div>
            
            <div className="h-4" />
          </div>

          {/* STICKY ACTION BAR */}
          <div className="border-t bg-background p-4 sm:px-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] shrink-0 z-10 pb-safe">
            {!lead.premium ? (
               <Button className="w-full py-6 text-base" onClick={() => setIsEditingPrice(true)}>
                 <Plus className="mr-2 size-5" /> Teklif Hazırla
               </Button>
            ) : lead.status === 'yeni' ? (
               <div className="flex flex-col gap-2">
                 <Button 
                   className="w-full py-6 text-base bg-[#25D366] hover:bg-[#1DA851] text-white" 
                   onClick={handleWhatsApp}
                 >
                   <MessageCircle className="mr-2 size-5" /> WhatsApp ile Gönder
                 </Button>
                 <Button variant="secondary" className="w-full" onClick={handleMarkSent}>
                   Müşteriye İletildi İşaretle
                 </Button>
               </div>
            ) : lead.status === 'iletildi' ? (
               <div className="flex gap-2">
                 <Button variant="outline" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleReject}>
                   <X className="mr-2 size-4" /> Reddedildi
                 </Button>
                 <Button className="flex-1 bg-success hover:bg-success/90 text-white" onClick={() => setConfirmApproveOpen(true)}>
                   <Check className="mr-2 size-4" /> Onaylandı
                 </Button>
               </div>
            ) : lead.status === 'onaylandi' ? (
               <div className="flex flex-col items-center justify-center p-2 text-success">
                 <Check className="size-6 mb-1" />
                 <span className="font-medium text-sm text-center">Bu teklif onaylandı ve poliçeleşti.</span>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center p-2 text-muted-foreground">
                 <span className="font-medium text-sm">Bu talep kapalı.</span>
               </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Satışı Onayla</DialogTitle>
            <DialogDescription>
              {lead.name} teklifinin müşteri tarafından onaylandığını ve poliçeleştiğini doğruluyor musunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm bg-success/10 text-success rounded-md p-3 my-2 border border-success/20">
            <UserPlus className="size-4 mb-2 inline-block mr-2" /> 
            Bu işlem sonucunda talep sahibi otomatik olarak aktif <strong>Müşterilerim</strong> listesine eklenecektir.
          </div>
          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmApproveOpen(false)} className="flex-1 sm:flex-none">
              İptal
            </Button>
            <Button onClick={handleApprove} className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-white">
              Evet, Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
