"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus, Building2, UserCircle, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client"
import { fetchApi } from "@/lib/api"
import { LoginView } from "./login-view"

export function SystemAdminApp() {
  const [authed, setAuthed] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [companies, setCompanies] = React.useState<any[]>([])

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
      if (session) loadCompanies()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadCompanies() {
    setLoading(true)
    try {
      const res = await fetchApi('/system/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      } else {
        toast.error("Şirketler yüklenemedi. Yetkiniz olmayabilir.")
      }
    } catch (err) {
      toast.error("Sunucuya bağlanılamadı.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      // 1. Create the user in Supabase Auth first
      const supabase = createClient()
      
      // We must use signUp, but usually SuperAdmin creates accounts directly without confirming emails if possible.
      // Assuming auto-confirm is enabled in Supabase or we just do signUp.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError || !authData.user) {
        toast.error("Kullanıcı oluşturulamadı", { description: authError?.message })
        setCreating(false)
        return
      }

      // 2. Send to backend to create Company and User record
      const res = await fetchApi('/system/companies', {
        method: 'POST',
        body: JSON.stringify({
          name,
          domain,
          ownerName,
          email,
          adminUserId: authData.user.id
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

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Süper Admin Paneli</h1>
            <p className="text-muted-foreground mt-1">
              SaaS sistemine yeni sigorta şirketleri (acenteler) ekle ve yönet.
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

        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          {/* Companies List */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sisteme Kayıtlı Şirketler</h2>
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
                <div className="divide-y">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">Domain: {company.domain || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{company.ownerName}</p>
                        <p className="text-xs text-muted-foreground">{company.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Company Form */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-fit">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Yeni Şirket (Acente) Ekle</h2>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <Field>
                  <FieldLabel>Şirket Adı</FieldLabel>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Ahmet Sigorta" />
                </Field>
                <Field>
                  <FieldLabel>Şirket Domain'i</FieldLabel>
                  <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="ahmetsigorta.com" />
                </Field>
                <Field>
                  <FieldLabel>Sahibi / Yetkili Adı</FieldLabel>
                  <Input required value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Ahmet Yılmaz" />
                </Field>

                <div className="pt-4 border-t mt-4">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <UserCircle className="size-4" />
                    İlk Admin Kullanıcısı
                  </h3>
                  <div className="space-y-4">
                    <Field>
                      <FieldLabel>E-posta (Giriş için)</FieldLabel>
                      <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmet@sigorta.com" />
                    </Field>
                    <Field>
                      <FieldLabel>Şifre</FieldLabel>
                      <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="En az 6 karakter" />
                    </Field>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={creating}>
                  {creating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                  Şirketi ve Hesabı Oluştur
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
