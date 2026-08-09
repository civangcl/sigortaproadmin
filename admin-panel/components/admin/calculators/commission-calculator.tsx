import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Percent } from "lucide-react"
import { formatCurrency } from "@/lib/mock-data"
import { Switch } from "@/components/ui/switch"

export function CommissionCalculator() {
  const [premium, setPremium] = React.useState("")
  const [commissionRate, setCommissionRate] = React.useState("")
  const [deductTax, setDeductTax] = React.useState(true)
  const [result, setResult] = React.useState<{ gross: number; net: number; tax: number } | null>(null)

  const handleCalculate = () => {
    if (!premium || !commissionRate) return

    const p = parseFloat(premium)
    const r = parseFloat(commissionRate) / 100
    
    const gross = p * r
    // BSMV (Banka ve Sigorta Muameleleri Vergisi) %5
    const taxRate = 0.05
    const tax = deductTax ? gross * taxRate : 0
    const net = gross - tax

    setResult({
      gross,
      net,
      tax
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Percent className="size-5 text-primary" />
          <CardTitle>Komisyon Hesaplayıcı</CardTitle>
        </div>
        <CardDescription>Brüt prim üzerinden oran bazlı net ve brüt komisyon hesaplama.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Üretim (Prim TL)</Label>
            <Input type="number" placeholder="0.00" value={premium} onChange={e => setPremium(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Komisyon Oranı (%)</Label>
            <Input type="number" placeholder="0" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center space-x-2 py-2">
          <Switch id="deduct-tax" checked={deductTax} onCheckedChange={setDeductTax} />
          <Label htmlFor="deduct-tax">Gider Vergisi (%5 BSMV) düşülsün</Label>
        </div>
        
        <Button onClick={handleCalculate} className="w-full">Hesapla</Button>
        
        {result && (
          <div className="mt-2 rounded-lg bg-muted p-4 grid gap-2 text-sm border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brüt Komisyon:</span>
              <span className="font-medium">{formatCurrency(result.gross)}</span>
            </div>
            {deductTax && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vergi (BSMV):</span>
                <span className="font-medium text-destructive">-{formatCurrency(result.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 mt-1">
              <span className="text-muted-foreground font-medium">Net Komisyon:</span>
              <span className="font-bold text-success">{formatCurrency(result.net)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
