"use client"

import * as React from "react"
import { TrendingUp, Banknote, Clock, Wallet, Plus, Calculator, Users, TrendingDown, Target } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Lead, Client } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/mock-data"

import { CrossSellOpportunities } from "./calculators/cross-sell-opportunities"
import { CancellationCalculator } from "./calculators/cancellation-calculator"
import { CommissionCalculator } from "./calculators/commission-calculator"

export function FinancialView({ 
  leads, 
  clients, 
  financials = [], 
  companyProfile,
  onAddExpense 
}: { 
  leads: Lead[]
  clients: Client[]
  financials: any[]
  companyProfile: any
  onAddExpense: (amount: number, description: string, date: string) => Promise<void>
}) {
  const [expenseModalOpen, setExpenseModalOpen] = React.useState(false)
  const [expenseAmount, setExpenseAmount] = React.useState("")
  const [expenseDesc, setExpenseDesc] = React.useState("")

  const handleSaveExpense = async () => {
    if (!expenseAmount || !expenseDesc) return
    await onAddExpense(parseFloat(expenseAmount), expenseDesc, new Date().toISOString())
    setExpenseModalOpen(false)
    setExpenseAmount("")
    setExpenseDesc("")
  }

  // Basic Financials
  const sentLeads = leads.filter((l) => l.status === "iletildi")

  let totalPremium = 0
  let totalCommission = 0
  let totalExpense = 0
  
  financials.forEach(f => {
    if (f.kind === 'tahsilat') totalPremium += f.amount
    if (f.kind === 'komisyon') totalCommission += f.amount
    if (f.kind === 'gider') totalExpense += f.amount
  })

  const netProfit = totalCommission - totalExpense

  const expectedPremium = sentLeads.reduce((sum, l) => sum + (l.premium || 0), 0)
  const expectedCommission = sentLeads.reduce((sum, l) => sum + (l.commission || 0), 0)

  // Target Tracking
  const monthlyTarget = companyProfile?.monthlyTarget || 100000
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthCommission = financials
    .filter(f => f.kind === 'komisyon' && new Date(f.date).getMonth() === currentMonth && new Date(f.date).getFullYear() === currentYear)
    .reduce((s, f) => s + f.amount, 0)

  const targetProgress = Math.min((thisMonthCommission / monthlyTarget) * 100, 100)

  // Expenses List
  const expensesList = financials.filter(f => f.kind === 'gider').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold tracking-tighter">
            Finansal Analiz & Araçlar
          </h2>
          <p className="text-muted-foreground">
            Kâr/Zarar durumu, hedef takibi ve gelişmiş hesaplama araçları.
          </p>
        </div>
        <Button onClick={() => setExpenseModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Gider Ekle
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Genel Özet</TabsTrigger>
          <TabsTrigger value="expenses">Gider Yönetimi</TabsTrigger>
          <TabsTrigger value="calculators">Hesaplama Araçları</TabsTrigger>
          <TabsTrigger value="cross-sell">Çapraz Satış</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-success/20 bg-success/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-success">Net Kâr</CardTitle>
                <Wallet className="size-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{formatCurrency(netProfit)}</div>
                <p className="text-xs text-success/70 mt-1">Komisyon - Giderler</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Komisyon</CardTitle>
                <Banknote className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gerçekleşen gelir</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Toplam Gider</CardTitle>
                <TrendingDown className="size-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
                <p className="text-xs text-destructive/70 mt-1">Sabit & Değişken Giderler</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-primary">Beklenen Komisyon</CardTitle>
                <Clock className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(expectedCommission)}</div>
                <p className="text-xs text-primary/70 mt-1">{sentLeads.length} adet bekleyen teklif</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                <CardTitle>Aylık Komisyon Hedefi</CardTitle>
              </div>
              <CardDescription>Bu ayki toplam komisyon üretiminizin hedefinize oranı.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <div className="text-3xl font-bold">{formatCurrency(thisMonthCommission)}</div>
                  <div className="text-sm text-muted-foreground font-medium">Hedef: {formatCurrency(monthlyTarget)}</div>
                </div>
                <Progress value={targetProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  %{targetProgress.toFixed(1)} tamamlandı
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gider Geçmişi</CardTitle>
              <CardDescription>Eklenen tüm şirket giderlerinin kronolojik listesi.</CardDescription>
            </CardHeader>
            <CardContent>
              {expensesList.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">Kayıtlı gider bulunmuyor.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesList.map(exp => (
                        <TableRow key={exp.id}>
                          <TableCell className="whitespace-nowrap">{new Date(exp.date).toLocaleDateString("tr-TR")}</TableCell>
                          <TableCell className="min-w-[120px]">{exp.description}</TableCell>
                          <TableCell className="text-right font-medium text-destructive whitespace-nowrap">
                            -{formatCurrency(exp.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculators" className="mt-4 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CancellationCalculator />
            <CommissionCalculator />
          </div>
        </TabsContent>

        <TabsContent value="cross-sell" className="mt-4">
          <CrossSellOpportunities clients={clients} />
        </TabsContent>
      </Tabs>

      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Gider Ekle</DialogTitle>
            <DialogDescription>
              Acente giderlerinizi (kira, elektrik, personel vb.) buraya girebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-desc">Açıklama</Label>
              <Input
                id="expense-desc"
                placeholder="Örn: Ofis Kirası"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-amount">Tutar (TL)</Label>
              <Input
                id="expense-amount"
                type="number"
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveExpense}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
