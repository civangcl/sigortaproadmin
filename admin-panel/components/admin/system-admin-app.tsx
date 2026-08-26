"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { fetchApi } from "@/lib/api"
import { LoginView } from "./login-view"

import { SystemSidebar } from "./system/system-sidebar"
import { SystemDashboard } from "./system/system-dashboard"
import { SystemCompanies } from "./system/system-companies"
import { SystemOnboarding } from "./system/system-onboarding"

export function SystemAdminApp() {
  const [authed, setAuthed] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  
  const [activeView, setActiveView] = React.useState("dashboard") // dashboard, companies, onboard, users, settings
  const [dashboardData, setDashboardData] = React.useState<any>(null)
  const [companies, setCompanies] = React.useState<any[]>([])

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  React.useEffect(() => {
    if (authed) {
      loadData()
    }
  }, [authed, activeView])

  async function loadData() {
    try {
      if (activeView === "dashboard") {
        const res = await fetchApi('/system/dashboard')
        if (res.ok) {
          const data = await res.json()
          setDashboardData(data.dashboard)
        }
      } else if (activeView === "companies") {
        const res = await fetchApi('/system/companies')
        if (res.ok) {
          const data = await res.json()
          setCompanies(Array.isArray(data) ? data : (data.items ?? []))
        }
      }
    } catch (err) {
      toast.error("Veriler yüklenemedi.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthed(false)
  }

  if (loading && !authed) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
  }

  if (!authed) {
    return <LoginView onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <SystemSidebar activeView={activeView} onNavigate={setActiveView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b sticky top-0 z-10">
          <h1 className="font-semibold text-lg text-slate-800">
            {activeView === "dashboard" && "Genel Bakış"}
            {activeView === "companies" && "Acenteler"}
            {activeView === "onboard" && "Yeni Acente Onboarding"}
            {activeView === "users" && "Platform Kullanıcıları"}
            {activeView === "websites" && "Websiteleri"}
            {activeView === "billing" && "Abonelik Yönetimi"}
            {activeView === "activity" && "Sistem Aktivitesi"}
            {activeView === "settings" && "Platform Ayarları"}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="size-4 mr-2" /> Çıkış Yap
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {activeView === "dashboard" && <SystemDashboard data={dashboardData} />}
            {activeView === "companies" && (
              <SystemCompanies 
                companies={companies} 
                onOnboard={() => setActiveView("onboard")}
                onSelectCompany={(id) => toast.info(`Detail view for ${id} (God Mode) - Eklenecek`)} 
              />
            )}
            {activeView === "onboard" && <SystemOnboarding />}
            
            {["users", "websites", "billing", "activity", "settings"].includes(activeView) && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl">🚧</span>
                </div>
                <h3 className="text-lg font-semibold">Yapım Aşamasında</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Bu modül henüz backend API'lerine bağlanmadı veya geliştirme aşamasında.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
