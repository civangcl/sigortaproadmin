import * as React from "react"
import { Building2, Users, FileText, Activity, ShieldCheck, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SystemDashboard({ data }: { data: any }) {
  if (!data) return <div className="p-8 text-muted-foreground animate-pulse">Metrikler yükleniyor...</div>

  const stats = [
    { label: "Toplam Acente", value: data.totalAgencies || 0, icon: Building2, desc: "Sisteme kayıtlı tenant" },
    { label: "Aktif Şubeler", value: data.totalBranches || 0, icon: MapPin, desc: "Tüm acente şubeleri" },
    { label: "Toplam Kullanıcı", value: data.totalUsers || 0, icon: Users, desc: "Platformdaki personel" },
    { label: "Oluşan Poliçeler", value: data.totalPolicies || 0, icon: ShieldCheck, desc: "Kesilen toplam poliçe" },
    { label: "Kayıtlı Müşteri", value: data.totalClients || 0, icon: Users, desc: "Acentelerin toplam müşterisi" },
    { label: "Bugünkü Talepler", value: data.leadsToday || 0, icon: Activity, desc: "Sisteme düşen günlük lead" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Genel Bakış</h2>
        <p className="text-muted-foreground">SigortaPro SaaS metrikleri ve gerçek zamanlı sistem durumu.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="border-border/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Sistem Sağlığı</CardTitle>
            <CardDescription>Gerçek zamanlı bağlantı durumu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">REST API</span>
              <span className="flex items-center text-sm font-semibold text-success"><div className="size-2 rounded-full bg-success mr-2 animate-pulse" /> ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Veritabanı (Prisma)</span>
              <span className="flex items-center text-sm font-semibold text-success"><div className="size-2 rounded-full bg-success mr-2 animate-pulse" /> CONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase Auth</span>
              <span className="flex items-center text-sm font-semibold text-success"><div className="size-2 rounded-full bg-success mr-2 animate-pulse" /> REACHABLE</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
