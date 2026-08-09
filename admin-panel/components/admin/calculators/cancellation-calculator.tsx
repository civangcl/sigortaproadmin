import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { formatCurrency } from "@/lib/mock-data"

export function CancellationCalculator() {
  const [startDate, setStartDate] = React.useState("")
  const [cancelDate, setCancelDate] = React.useState("")
  const [premium, setPremium] = React.useState("")
  const [commission, setCommission] = React.useState("")
  const [result, setResult] = React.useState<{ usedDays: number; refundPremium: number; refundCommission: number } | null>(null)

  const handleCalculate = () => {
    if (!startDate || !cancelDate || !premium) return

    const start = new Date(startDate)
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1) // Policy duration is typically 1 year
    
    const cancel = new Date(cancelDate)
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const usedDays = Math.ceil((cancel.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (usedDays < 0 || usedDays > totalDays) {
      alert("Geçersiz tarih aralığı!")
      return
    }
    
    const remainingDays = totalDays - usedDays
    const dailyPremium = parseFloat(premium) / totalDays
    const refundPremium = dailyPremium * remainingDays
    
    const dailyCommission = commission ? parseFloat(commission) / totalDays : 0
    const refundCommission = dailyCommission * remainingDays

    setResult({
      usedDays,
      refundPremium,
      refundCommission
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary" />
          <CardTitle>Zeylname Hesaplayıcı</CardTitle>
        </div>
        <CardDescription>Poliçe iptali durumunda gün esaslı iade tutarı hesaplama.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Başlangıç Tarihi</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>İptal Tarihi</Label>
            <Input type="date" value={cancelDate} onChange={e => setCancelDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Toplam Prim (TL)</Label>
            <Input type="number" placeholder="0.00" value={premium} onChange={e => setPremium(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Komisyon Tutarı (TL, Opsiyonel)</Label>
            <Input type="number" placeholder="0.00" value={commission} onChange={e => setCommission(e.target.value)} />
          </div>
        </div>
        
        <Button onClick={handleCalculate} className="w-full">Hesapla</Button>
        
        {result && (
          <div className="mt-2 rounded-lg bg-muted p-4 grid gap-2 text-sm border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kullanılan Gün:</span>
              <span className="font-medium">{result.usedDays} gün</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Müşteriye İade Prim:</span>
              <span className="font-medium text-destructive">{formatCurrency(result.refundPremium)}</span>
            </div>
            {commission && (
              <div className="flex justify-between border-t pt-2 mt-1">
                <span className="text-muted-foreground">İptal Edilen Komisyon:</span>
                <span className="font-medium text-destructive">{formatCurrency(result.refundCommission)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
