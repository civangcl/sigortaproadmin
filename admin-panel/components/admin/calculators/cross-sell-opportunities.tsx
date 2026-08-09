import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle } from "lucide-react"
import type { Client } from "@/lib/mock-data"

export function CrossSellOpportunities({ clients }: { clients: Client[] }) {
  // Logic: Find clients who have a vehicle policy (Trafik or Kasko) but NOT both.
  // Find clients who have Konut but not DASK, or DASK but not Konut.

  const opportunities = React.useMemo(() => {
    const opps = []
    
    for (const client of clients) {
      const policyTypes = client.policies.map(p => p.type.toLowerCase())
      
      const hasTrafik = policyTypes.includes("trafik")
      const hasKasko = policyTypes.includes("kasko")
      const hasDask = policyTypes.includes("dask")
      const hasKonut = policyTypes.includes("konut")
      
      const suggestions = []
      
      if (hasTrafik && !hasKasko) {
        suggestions.push({ type: "Kasko", reason: "Trafik var, Kasko yok" })
      }
      if (hasKasko && !hasTrafik) {
        suggestions.push({ type: "Trafik", reason: "Kasko var, Trafik yok (Riskli)" })
      }
      if (hasDask && !hasKonut) {
        suggestions.push({ type: "Konut", reason: "DASK var, Konut yok" })
      }
      if (hasKonut && !hasDask) {
        suggestions.push({ type: "DASK", reason: "Konut var, DASK zorunlu" })
      }
      
      if (suggestions.length > 0) {
        opps.push({ client, suggestions })
      }
    }
    
    return opps
  }, [clients])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <CardTitle>Çapraz Satış (Cross-Sell) Fırsatları</CardTitle>
        </div>
        <CardDescription>
          Müşterilerinizin mevcut poliçelerine göre satılabilecek potansiyel ürünler.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="size-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Şu anda sistemde çapraz satış fırsatı bulunmuyor.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Önerilen Ürün</TableHead>
                  <TableHead>Neden?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp, idx) => (
                  <TableRow key={opp.client.id + idx}>
                    <TableCell className="font-medium">{opp.client.name}</TableCell>
                    <TableCell>{opp.client.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {opp.suggestions.map((s, i) => (
                          <Badge key={i} variant="secondary">{s.type}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {opp.suggestions.map(s => s.reason).join(" | ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
