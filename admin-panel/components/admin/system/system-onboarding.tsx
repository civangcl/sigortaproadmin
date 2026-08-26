import * as React from "react"
import { toast } from "sonner"
import { Loader2, Building2, UserCircle, MapPin, Globe, CheckCircle2, ChevronRight, ChevronLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"

export function SystemOnboarding() {
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [successData, setSuccessData] = React.useState<any>(null)
  const [copied, setCopied] = React.useState(false)

  const [formData, setFormData] = React.useState({
    companyName: "",
    domain: "",
    companyPhone: "",
    companyEmail: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    branchName: "Merkez",
    websiteActive: false
  })

  const updateForm = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const handleCopy = () => {
    if (successData?.tempPassword) {
      navigator.clipboard.writeText(successData.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        company: {
          name: formData.companyName,
          domain: formData.domain || undefined,
          phone: formData.companyPhone || undefined,
          email: formData.companyEmail || undefined,
          address: formData.address || undefined
        },
        owner: {
          fullName: formData.ownerName,
          email: formData.ownerEmail,
          phone: formData.ownerPhone || undefined
        },
        branch: {
          name: formData.branchName
        },
        website: {
          active: formData.websiteActive,
          domain: formData.domain || undefined
        }
      }

      const res = await fetchApi('/system/onboard', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessData(data)
        setStep(5) // Success step
      } else {
        toast.error("Acente oluşturulamadı", { description: data.error || "Bilinmeyen hata" })
      }
    } catch (err) {
      toast.error("Sunucuya bağlanılamadı.")
    } finally {
      setLoading(false)
    }
  }

  if (step === 5 && successData) {
    return (
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-10 text-success" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Acente Başarıyla Kuruldu!</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          {successData.company?.name} (Müşteri No: {successData.company?.customerNo}) sisteme eklendi.
        </p>

        <Card className="w-full bg-slate-50 border-primary/20 text-left">
          <CardContent className="p-8">
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
              <UserCircle className="size-5" /> Geçici Yönetici Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">E-posta</Label>
                <div className="font-medium text-lg">{successData.user?.email}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Geçici Şifre</Label>
                <div className="flex items-center gap-3">
                  <code className="text-xl font-mono bg-slate-200 px-3 py-1 rounded tracking-widest">{successData.tempPassword}</code>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="size-4 text-success" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-sm text-destructive font-medium mt-2">
                  DİKKAT: Bu şifre bir daha GÖSTERİLMEYECEKTİR. Lütfen acente sahibine iletin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button className="mt-8" onClick={() => window.location.reload()}>
          Yeni Acente Ekle
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Yeni Acente Onboarding (Kurulum)</h2>
        <p className="text-muted-foreground">SigortaPro platformuna yeni bir tenant ekleyin.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        
        {[1,2,3,4].map(num => (
          <div key={num} className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-sm
            ${step === num ? 'bg-primary text-primary-foreground border-4 border-background' : 
              step > num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-4 border-background'}`}
          >
            {num}
          </div>
        ))}
      </div>

      <Card className="shadow-md">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Building2 className="text-primary size-5"/> Şirket Bilgileri</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Firma Adı <span className="text-destructive">*</span></Label>
                  <Input value={formData.companyName} onChange={e => updateForm({companyName: e.target.value})} placeholder="Örn: Ece Sigorta Brokerlik" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <Input type="email" value={formData.companyEmail} onChange={e => updateForm({companyEmail: e.target.value})} placeholder="info@ecesigorta.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={formData.companyPhone} onChange={e => updateForm({companyPhone: e.target.value})} placeholder="05XX XXX XX XX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Genel Merkez Adresi</Label>
                  <Input value={formData.address} onChange={e => updateForm({address: e.target.value})} placeholder="Adres giriniz..." />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><UserCircle className="text-primary size-5"/> Yönetici (Owner) Bilgileri</h3>
              <p className="text-sm text-muted-foreground mb-4">Bu kullanıcı acentenin tam yetkili sahibi (OWNER) olarak atanacaktır.</p>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad <span className="text-destructive">*</span></Label>
                  <Input value={formData.ownerName} onChange={e => updateForm({ownerName: e.target.value})} placeholder="Örn: Fırat Ece" />
                </div>
                <div className="space-y-2">
                  <Label>Yönetici E-posta <span className="text-destructive">*</span></Label>
                  <Input type="email" value={formData.ownerEmail} onChange={e => updateForm({ownerEmail: e.target.value})} placeholder="firat@ecesigorta.com" />
                </div>
                <div className="space-y-2">
                  <Label>Yönetici Telefon</Label>
                  <Input value={formData.ownerPhone} onChange={e => updateForm({ownerPhone: e.target.value})} placeholder="05XX XXX XX XX" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin className="text-primary size-5"/> Şube & Yapılandırma</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Varsayılan Şube Adı <span className="text-destructive">*</span></Label>
                  <Input value={formData.branchName} onChange={e => updateForm({branchName: e.target.value})} placeholder="Merkez" />
                  <p className="text-xs text-muted-foreground">İlk şube bu isimle oluşturulacaktır.</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Globe className="text-primary size-5"/> Website Entegrasyonu</h3>
              <p className="text-sm text-muted-foreground mb-4">Müşterinin SigortaPro üzerinden yayınlanan bir websitelesi var mı?</p>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => updateForm({websiteActive: !formData.websiteActive})}>
                  <div className={`size-5 rounded-full flex items-center justify-center border ${formData.websiteActive ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                    {formData.websiteActive && <CheckCircle2 className="size-3" />}
                  </div>
                  <div>
                    <div className="font-medium">Websitesi Aktif</div>
                    <div className="text-sm text-muted-foreground">Bu acente API'den public formlar alabilecek.</div>
                  </div>
                </div>

                {formData.websiteActive && (
                  <div className="space-y-2 animate-in fade-in mt-2">
                    <Label>Domain (Opsiyonel)</Label>
                    <Input value={formData.domain} onChange={e => updateForm({domain: e.target.value})} placeholder="ecesigorta.com" />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <div className="flex justify-between p-6 border-t bg-slate-50/50 rounded-b-xl">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || loading}>
            <ChevronLeft className="size-4 mr-1" /> Geri
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={
              (step === 1 && !formData.companyName) || 
              (step === 2 && (!formData.ownerName || !formData.ownerEmail)) ||
              (step === 3 && !formData.branchName)
            }>
              İleri <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-primary">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Kurulumu Tamamla
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
