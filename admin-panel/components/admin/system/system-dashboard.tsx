import * as React from "react"
import { Building2, Users, FileText, Activity, ShieldCheck, MapPin, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function SystemDashboard({ data }: { data: any }) {
  if (!data) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-[#11161D] rounded w-64"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-[#11161D] rounded-xl border border-white/5"></div>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-80 bg-[#11161D] rounded-xl border border-white/5"></div>
        <div className="h-80 bg-[#11161D] rounded-xl border border-white/5"></div>
      </div>
    </div>
  )

  const stats = [
    { label: "Toplam Acente", value: data.companies?.total || 0, icon: Building2, desc: "Sisteme kayıtlı tenant" },
    { label: "Aktif Acenteler", value: data.companies?.active || 0, icon: Activity, desc: "Platformu kullananlar" },
    { label: "Toplam Kullanıcı", value: data.users?.total || 0, icon: Users, desc: "Platformdaki personel" },
    { label: "Sistem Müşterileri", value: data.clients?.total || 0, icon: Users, desc: "Acentelerin toplam müşterisi" },
    { label: "Oluşan Poliçeler", value: data.policies?.total || 0, icon: ShieldCheck, desc: "Kesilen toplam poliçe" },
    { label: "Yeni Talepler", value: data.leads?.new || 0, icon: FileText, desc: "İşlem bekleyen lead" },
  ]

  const chartData = data.leadTrend?.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
    Talepler: item.count
  })) || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Genel Bakış</h2>
        <p className="text-slate-400 mt-1">SigortaPro SaaS metrikleri ve gerçek zamanlı sistem durumu.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="bg-[#11161D] border-white/5 shadow-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{s.label}</CardTitle>
                <div className="p-2 bg-white/5 rounded-lg">
                  <Icon className="size-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-100">{s.value.toLocaleString('tr-TR')}</div>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#11161D] border-white/5 shadow-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-200">Son Eklenen Acenteler</CardTitle>
            <CardDescription className="text-slate-400">Platforma katılan en yeni tenantlar</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentCompanies && data.recentCompanies.length > 0 ? (
              <div className="space-y-4">
                {data.recentCompanies.map((company: any) => (
                  <div key={company.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{company.name}</p>
                        <p className="text-xs text-slate-500">{company.domain || "Domain Yok"} • {company.customerNo}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="size-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Henüz acente bulunmuyor.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#11161D] border-white/5 shadow-none rounded-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-slate-200">Teklif Talebi Trendi</CardTitle>
            <CardDescription className="text-slate-400">Son 7 günlük platform geneli lead aktivitesi</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[250px]">
            {chartData.every((d: any) => d.Talepler === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="size-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Henüz aktivite yok.</p>
              </div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161D26', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#60A5FA' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Talepler" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#11161D', stroke: '#3B82F6', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#3B82F6', stroke: '#11161D', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
