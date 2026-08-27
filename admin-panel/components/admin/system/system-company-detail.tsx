import * as React from "react"
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, User, Activity, Edit2, Save, Loader2, ShieldCheck, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

export function SystemCompanyDetail({ companyId, onBack }: { companyId: string, onBack: () => void }) {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState(false)
  const [formData, setFormData] = React.useState<any>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    loadDetail()
  }, [companyId])

  async function loadDetail() {
    setLoading(true)
    try {
      const res = await fetchApi(`/system/companies/${companyId}/details`)
      if (!res.ok) throw new Error("Not found")
      const result = await res.json()
      if (result.success && result.company) {
        setData(result)
        setFormData({
          name: result.company.name,
          email: result.company.email || "",
          phone: result.company.phone || "",
          address: result.company.address || "",
          ownerName: result.company.ownerName || ""
        })
      } else {
        throw new Error("Invalid response")
      }
    } catch (err) {
      toast.error("Firma detayları yüklenemedi veya erişim engellendi.")
      onBack()
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetchApi(`/system/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error("Update failed")
      toast.success("Firma bilgileri güncellendi.")
      setEditing(false)
      loadDetail()
    } catch (err) {
      toast.error("Güncelleme başarısız oldu.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="size-8 animate-spin mb-4 opacity-50" />
        Detaylar yükleniyor...
      </div>
    )
  }

  const { company, recentLeads, recentPolicies } = data
  const counts = company._count || {}
  const ownerMem = company.memberships?.find((m: any) => m.role === 'OWNER' && m.status === 'ACTIVE')

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-slate-100 hover:bg-white/10">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            {company.name}
            {company.customerNo && (
              <span className="text-xs px-2 py-1 bg-white/10 text-slate-300 rounded font-mono font-medium">
                {company.customerNo}
              </span>
            )}
          </h2>
          <div className="text-sm text-slate-400 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1"><Globe className="size-3" /> {company.domain || "Domain Yok"}</span>
            <span>Kayıt: {new Date(company.createdAt).toLocaleDateString("tr-TR")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Şube", value: counts.branches },
          { label: "Kullanıcı", value: counts.users },
          { label: "Müşteri", value: counts.clients },
          { label: "Talep", value: counts.leads },
          { label: "Poliçe", value: counts.policies },
        ].map((s, i) => (
          <Card key={i} className="bg-[#11161D] border-white/5 shadow-none">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">{s.value || 0}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol Kolon: Genel Bilgiler */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#11161D] border-white/5 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                <Building2 className="size-4 text-blue-400" /> Genel Bilgiler
              </CardTitle>
              {editing ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="text-slate-400">İptal</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 border-none">
                    {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} Kaydet
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-slate-400 hover:text-slate-200 hover:bg-white/5 gap-2 border-white/10">
                  <Edit2 className="size-3" /> Düzenle
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Firma Adı</label>
                  {editing ? (
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-[#090C10] border-white/10 text-slate-200" />
                  ) : (
                    <div className="text-sm text-slate-200">{company.name}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Firma Sahibi (İletişim)</label>
                  {editing ? (
                    <Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="bg-[#090C10] border-white/10 text-slate-200" />
                  ) : (
                    <div className="text-sm text-slate-200">{company.ownerName || "—"}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">E-Posta</label>
                  {editing ? (
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-[#090C10] border-white/10 text-slate-200" />
                  ) : (
                    <div className="text-sm text-slate-200 flex items-center gap-2">
                      <Mail className="size-3 text-slate-500" /> {company.email || "—"}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Telefon</label>
                  {editing ? (
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-[#090C10] border-white/10 text-slate-200" />
                  ) : (
                    <div className="text-sm text-slate-200 flex items-center gap-2">
                      <Phone className="size-3 text-slate-500" /> {company.phone || "—"}
                    </div>
                  )}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Adres</label>
                  {editing ? (
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-[#090C10] border-white/10 text-slate-200" />
                  ) : (
                    <div className="text-sm text-slate-200 flex items-center gap-2">
                      <MapPin className="size-3 text-slate-500" /> {company.address || "—"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Şubeler */}
          <Card className="bg-[#11161D] border-white/5 shadow-none">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base text-slate-200">Şubeler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {company.branches && company.branches.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {company.branches.map((b: any) => (
                    <div key={b.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                      <div>
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                          {b.name}
                          {b.isDefault && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">MERKEZ</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(b.createdAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                      <div>
                        {b.isActive ? (
                          <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">Aktif</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 bg-slate-500/10 px-2 py-1 rounded">Pasif</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">Şube bulunamadı.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon: Owner & Aktiviteler */}
        <div className="space-y-6">
          <Card className="bg-[#11161D] border-white/5 shadow-none">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                <User className="size-4 text-purple-400" /> Sistem Sahibi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {ownerMem ? (
                <div>
                  <div className="font-medium text-slate-200">{ownerMem.user.fullName || "İsimsiz"}</div>
                  <div className="text-sm text-slate-400 mt-1">{ownerMem.user.email}</div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full font-medium">OWNER</span>
                    {ownerMem.allBranches && (
                      <span className="text-[10px] px-2 py-1 bg-white/5 text-slate-300 rounded-full font-medium">FULL ACCESS</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">Sahip hesabı (OWNER) atanmamış.</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#11161D] border-white/5 shadow-none">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                <Activity className="size-4 text-orange-400" /> Son Aktiviteler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {recentLeads?.length > 0 ? recentLeads.map((l: any) => (
                  <div key={l.id} className="p-4 flex gap-3 items-start hover:bg-white/[0.02]">
                    <div className="p-2 rounded bg-orange-500/10 text-orange-400"><FileText className="size-3" /></div>
                    <div>
                      <div className="text-sm text-slate-200">{l.insuranceType.toUpperCase()} Talebi</div>
                      <div className="text-xs text-slate-400">{l.fullName} • {new Date(l.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                )) : null}
                
                {recentPolicies?.length > 0 ? recentPolicies.map((p: any) => (
                  <div key={p.id} className="p-4 flex gap-3 items-start hover:bg-white/[0.02]">
                    <div className="p-2 rounded bg-green-500/10 text-green-400"><ShieldCheck className="size-3" /></div>
                    <div>
                      <div className="text-sm text-slate-200">{p.type} Poliçesi</div>
                      <div className="text-xs text-slate-400">{p.companyName} • {new Date(p.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                )) : null}

                {(!recentLeads?.length && !recentPolicies?.length) && (
                  <div className="p-6 text-center text-slate-500 text-sm">Yakın zamanda aktivite yok.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
