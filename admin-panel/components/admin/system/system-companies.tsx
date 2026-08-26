import * as React from "react"
import { Building2, Plus, ExternalLink, Globe, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function SystemCompanies({ companies, onOnboard, onSelectCompany }: { companies: any[], onOnboard: () => void, onSelectCompany: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.customerNo && c.customerNo.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Acenteler (Tenants)</h2>
          <p className="text-muted-foreground">Sisteme kayıtlı tüm acenteleri ve cirolarını buradan yönetin.</p>
        </div>
        <Button onClick={onOnboard} className="bg-primary gap-2">
          <Plus className="size-4" /> Yeni Acente
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Firma Adı veya Müşteri No..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Filter className="size-4" /> Filtrele
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-medium">Müşteri No</th>
                  <th className="px-6 py-4 font-medium">Acente / Firma Adı</th>
                  <th className="px-6 py-4 font-medium">Sahibi</th>
                  <th className="px-6 py-4 font-medium text-center">İstatistikler</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Building2 className="size-8 mx-auto mb-3 opacity-20" />
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                        {c.customerNo || "SP-XXXXXX"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          {c.domain ? (
                            <><Globe className="size-3" /> {c.domain}</>
                          ) : (
                            <span className="italic">Domain yok</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{c.ownerName || "Atanmadı"}</div>
                        <div className="text-xs text-muted-foreground">{c.email || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
                          <div className="flex flex-col items-center" title="Müşteri">
                            <span>M</span>
                            <span className="text-foreground">{c._count?.clients || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Talep (Lead)">
                            <span>T</span>
                            <span className="text-foreground">{c._count?.leads || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Poliçe">
                            <span>P</span>
                            <span className="text-foreground">{c._count?.policies || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          AKTİF
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => onSelectCompany(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Detay <ExternalLink className="size-3 ml-1.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
