import * as React from "react"
import { Building2, Plus, ExternalLink, Globe, Search, Filter, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"
import { toast } from "sonner"

export function SystemCompanies({ onOnboard, onSelectCompany }: { onOnboard: () => void, onSelectCompany: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [companies, setCompanies] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({ page: 1, limit: 50, total: 0, totalPages: 1 })

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination(p => ({ ...p, page: 1 }))
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  React.useEffect(() => {
    loadCompanies()
  }, [debouncedSearch, pagination.page])

  async function loadCompanies() {
    setLoading(true)
    try {
      const res = await fetchApi(`/system/companies?page=${pagination.page}&limit=${pagination.limit}&search=${encodeURIComponent(debouncedSearch)}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setCompanies(data.items || [])
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      toast.error("Acenteler yüklenemedi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Acenteler</h2>
          <p className="text-slate-400 mt-1">SigortaPro platformuna kayıtlı sigorta acentelerini yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={loadCompanies} disabled={loading} className="border-white/10 text-slate-300 hover:bg-white/5">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onOnboard} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 border-none">
            <Plus className="size-4" /> Yeni Acente
          </Button>
        </div>
      </div>

      <Card className="bg-[#11161D] border-white/5 shadow-none rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input 
              placeholder="Firma Adı veya Müşteri No..." 
              className="pl-9 bg-[#090C10] border-white/10 text-slate-200 placeholder:text-slate-500 h-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            Toplam: <strong className="text-slate-200">{pagination.total}</strong> Acente
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-[#0D1117] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Müşteri No</th>
                  <th className="px-6 py-4 font-medium">Acente / Firma Adı</th>
                  <th className="px-6 py-4 font-medium">Firma Sahibi</th>
                  <th className="px-6 py-4 font-medium text-center">İstatistikler (Ş/K/M/T/P)</th>
                  <th className="px-6 py-4 font-medium text-right">Kayıt Tarihi</th>
                  <th className="px-6 py-4 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="size-8 mx-auto mb-3 animate-spin opacity-50" />
                      Yükleniyor...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Building2 className="size-8 mx-auto mb-3 opacity-20" />
                      {searchTerm ? "Aramanızla eşleşen acente bulunamadı." : "Henüz acente bulunmuyor."}
                    </td>
                  </tr>
                ) : (
                  companies.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 text-xs">
                        {c.customerNo || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? (
                            <img src={c.logoUrl} alt={c.name} className="size-8 rounded bg-[#090C10] object-cover" />
                          ) : (
                            <div className="size-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                              {c.name.substring(0,2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-200">{c.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <Globe className="size-3" /> {c.domain || "Domain Yok"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.owner ? (
                          <>
                            <div className="font-medium text-slate-300">{c.owner.name || "İsimsiz"}</div>
                            <div className="text-xs text-slate-500">{c.owner.email}</div>
                          </>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Sahip atanmadı</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-slate-500">
                          <div className="flex flex-col items-center" title="Şube">
                            <span>Ş</span>
                            <span className="text-slate-300">{c.counts?.branches || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Kullanıcı">
                            <span>K</span>
                            <span className="text-slate-300">{c.counts?.users || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Müşteri">
                            <span>M</span>
                            <span className="text-slate-300">{c.counts?.clients || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Talep (Lead)">
                            <span>T</span>
                            <span className="text-blue-400">{c.counts?.leads || 0}</span>
                          </div>
                          <div className="flex flex-col items-center" title="Poliçe">
                            <span>P</span>
                            <span className="text-green-400">{c.counts?.policies || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => onSelectCompany(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-100 hover:bg-white/10">
                          Detay <ExternalLink className="size-3 ml-1.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="text-xs text-slate-500">
                Sayfa {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="border-white/10 bg-transparent hover:bg-white/5 text-slate-300"
                >
                  Önceki
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="border-white/10 bg-transparent hover:bg-white/5 text-slate-300"
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
