"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus, Building2, UserCircle, LogOut, ArrowLeft, Users, FileText, Wallet, BarChart3, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { fetchApi } from "@/lib/api"
import { LoginView } from "./login-view"
import { DashboardView } from "./dashboard-view"
import { ClientsView } from "./clients-view"
import { LeadsView } from "./leads-view"
import { FinancialView } from "./financial-view"

export function SystemAdminApp() {
  const [authed, setAuthed] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [companies, setCompanies] = React.useState<any[]>([])

  // Detailed View State
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null)
  const [companyDetails, setCompanyDetails] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "clients" | "leads" | "financials">("dashboard")
  const [detailsLoading, setDetailsLoading] = React.useState(false)

  // Form State
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [ownerName, setOwnerName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true)
        loadCompanies()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
      if (session && !selectedCompanyId) loadCompanies()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadCompanies() {
    setLoading(true)
    try {
      const res = await fetchApi('/system/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(Array.isArray(data) ? data : (data.items ?? []))
      } else {
        toast.error("Şirketler yüklenemedi. Yetkiniz olmayabilir.")
      }
    } catch (err) {
      toast.error("Sunucuya bağlanılamadı.")
    } finally {
      setLoading(false)
    }
  }

  async function loadCompanyDetails(id: string) {
    setSelectedCompanyId(id)
    setDetailsLoading(true)
    setActiveTab("dashboard")
    
    try {
      const res = await fetchApi(`/system/companies/${id}/details`)
      if (res.ok) {
        const data = await res.json()
        
        // Map data exactly like AdminApp does!
        const mappedClients = data.clients.map((c: any) => ({
          id: c.id,
          name: c.name,
          tc: c.tc || "-",
          phone: c.phone,
          email: c.email || "-",
          city: c.city || c.address || "-",
          since: new Date(c.createdAt).toISOString(),
          vehicle: {
            plate: c.plate || "-",
            brand: c.brand || "-",
            model: c.model || "-",
            year: c.year || new Date().getFullYear(),
            engineNo: c.engineNo || "-",
            chassisNo: c.chassisNo || "-",
          },
          policies: c.policies.map((p: any) => ({
            id: p.id,
            type: p.type,
            company: p.companyName || "-",
            policyNo: p.policyNo || "-",
            premium: p.premium,
            startDate: new Date(p.startDate).toISOString(),
            endDate: new Date(p.endDate).toISOString(),
          })),
          financials: c.financials.map((f: any) => ({
            id: f.id,
            date: new Date(f.date).toISOString(),
            description: f.description,
            amount: f.amount,
            kind: f.kind,
          }))
        }))
        
        const mappedLeads = data.leads.map((lead: any) => ({
          id: lead.id,
          date: new Date(lead.createdAt).toISOString(),
          insuranceType: lead.insuranceType,
          name: lead.fullName,
          tc: lead.tcKimlikNo || '',
          birthDate: lead.dateOfBirth || '',
          phone: lead.phoneNumber,
          email: lead.email || undefined,
          city: lead.city || undefined,
          address: lead.address || undefined,
          status: lead.status,
          note: lead.company ? `${lead.company.name} şirketine gelen talep` : '',
          plate: lead.licensePlate || undefined,
          registrationNo: lead.belgeNo || undefined,
          brand: lead.brand || undefined,
          model: lead.model || undefined,
          year: lead.year || undefined,
          engineNo: lead.engineNo || undefined,
          chassisNo: lead.chassisNo || undefined,
          premium: lead.premium || undefined,
          commission: lead.commission || undefined,
        }))

        setCompanyDetails({
          profile: data.company,
          clients: mappedClients,
          leads: mappedLeads,
          rawFinancials: data.financials
        })
        
      } else {
        toast.error("Şirket detayları yüklenemedi.")
        setSelectedCompanyId(null)
      }
    } catch (err) {
      toast.error("Sunucuya bağlanılamadı.")
      setSelectedCompanyId(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError && authError.message !== 'User already registered') {
        toast.error("Kullanıcı oluşturulamadı", { description: authError?.message })
        setCreating(false)
        return
      }

      const userId = authData?.user?.id || (await supabase.auth.signInWithPassword({ email, password })).data?.user?.id

      const res = await fetchApi('/system/companies', {
        method: 'POST',
        body: JSON.stringify({
          name,
          domain,
          ownerName,
          email,
          adminUserId: userId
        })
      })

      if (res.ok) {
        toast.success("Şirket ve hesap başarıyla oluşturuldu!")
        setName("")
        setDomain("")
        setOwnerName("")
        setEmail("")
        setPassword("")
        loadCompanies()
      } else {
        const errData = await res.json()
        toast.error("Şirket oluşturulamadı", { description: errData.error })
      }
    } catch (err) {
      toast.error("Beklenmeyen bir hata oluştu.")
    } finally {
      setCreating(false)
    }
  }

  if (!authed) {
    return <LoginView onLogin={() => setAuthed(true)} />
  }

  if (selectedCompanyId) {
    // Detailed God Mode View
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedCompanyId(null); loadCompanies() }}>
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{companyDetails?.profile?.name || 'Yükleniyor...'}</h1>
                <p className="text-sm text-muted-foreground">{companyDetails?.profile?.ownerName} • İzleme Modu (God Mode)</p>
              </div>
            </div>
            <div className="flex bg-muted p-1 rounded-lg">
              <Button variant={activeTab === 'dashboard' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('dashboard')}>
                <BarChart3 className="size-4 mr-2" /> Özet
              </Button>
              <Button variant={activeTab === 'clients' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('clients')}>
                <Users className="size-4 mr-2" /> Müşteriler
              </Button>
              <Button variant={activeTab === 'leads' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('leads')}>
                <Activity className="size-4 mr-2" /> Talepler
              </Button>
              <Button variant={activeTab === 'financials' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('financials')}>
                <Wallet className="size-4 mr-2" /> Finans
              </Button>
            </div>
          </div>
          
          {detailsLoading ? (
             <div className="flex h-64 items-center justify-center">
               <Loader2 className="size-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'dashboard' && <DashboardView clients={companyDetails.clients} leads={companyDetails.leads} />}
              {activeTab === 'clients' && <ClientsView clients={companyDetails.clients} onAddClient={async () => { toast.error("God Mode: Ekleme yapılamaz") }} onSelectClient={() => {}} />}
              {activeTab === 'leads' && <LeadsView insuranceType="arac" leads={companyDetails.leads} onUpdateLead={async () => { toast.error("God Mode: Düzenleme yapılamaz") }} onDelete={async () => {}} onRestore={async () => {}} />}
              {activeTab === 'financials' && <FinancialView leads={companyDetails.leads} clients={companyDetails.clients} financials={companyDetails.rawFinancials} companyProfile={companyDetails.profile} onAddExpense={async () => { toast.error("God Mode: Gider eklenemez") }} />}
            </div>
          )}
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Süper Admin Yönetim Merkezi</h1>
            <p className="text-muted-foreground mt-1">
              Tüm sigorta acentelerini, cirolarını ve performanslarını tek ekranda izle.
            </p>
          </div>
          <Button variant="outline" onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
          }}>
            <LogOut className="size-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_350px]">
          {/* Companies List */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6">Sisteme Kayıtlı Acenteler</h2>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="size-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">Henüz kayıtlı şirket yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-semibold text-lg">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.ownerName} • {company.email}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">{company.domain || 'Domain yok'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ciro</p>
                          <p className="text-base font-semibold text-success">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(company.totalRevenue || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Müşteri</p>
                          <p className="text-base font-semibold">{company._count?.clients || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Poliçe</p>
                          <p className="text-base font-semibold">{company._count?.policies || 0}</p>
                        </div>
                      </div>
                      <Button onClick={() => loadCompanyDetails(company.id)}>
                        İçine Gir (God Mode)
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Company Form */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-fit sticky top-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Yeni Acente Hesabı Aç</h2>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <Field>
                  <FieldLabel>Şirket Adı</FieldLabel>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Ece Sigorta" />
                </Field>
                <Field>
                  <FieldLabel>Şirket Domain'i (Opsiyonel)</FieldLabel>
                  <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="ecesigorta.com" />
                </Field>
                <Field>
                  <FieldLabel>Sahibi / Yetkili Adı</FieldLabel>
                  <Input required value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Ahmet Yılmaz" />
                </Field>

                <div className="pt-4 border-t mt-4">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <UserCircle className="size-4 text-primary" />
                    Admin Giriş Bilgileri
                  </h3>
                  <div className="space-y-4">
                    <Field>
                      <FieldLabel>E-posta</FieldLabel>
                      <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@ecesigorta.com" />
                    </Field>
                    <Field>
                      <FieldLabel>Şifre</FieldLabel>
                      <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="En az 6 karakter" />
                    </Field>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={creating}>
                  {creating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                  Şirketi Oluştur
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
