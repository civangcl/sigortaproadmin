"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Label,
} from "recharts"
import {
  Wallet,
  FileCheck2,
  CalendarClock,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Coins,
  Percent,
  Repeat,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  type Client,
  type Lead,
  formatCurrency,
  daysUntilExpiry,
} from "@/lib/mock-data"
import { PolicyTypeBadge, ExpiryBadge } from "@/components/admin/policy-badges"

const productionConfig = {
  prim: { label: "Prim Üretimi", color: "var(--chart-1)" },
  komisyon: { label: "Net Komisyon", color: "var(--chart-4)" },
} satisfies ChartConfig

const portfolioConfig = {
  arac: { label: "Araç", color: "var(--chart-1)" },
  dask: { label: "DASK", color: "var(--chart-3)" },
  konut: { label: "Konut", color: "var(--chart-2)" },
  saglik: { label: "Sağlık", color: "var(--chart-5)" },
  empty: { label: "Kayıt Yok", color: "var(--muted)" },
} satisfies ChartConfig

function formatPercent(value: number): string {
  return `%${value.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  accent?: "primary" | "warning" | "destructive" | "success"
}) {
  const accentClass =
    accent === "warning"
      ? "bg-warning/12 text-warning"
      : accent === "destructive"
        ? "bg-destructive/12 text-destructive"
        : accent === "success"
          ? "bg-success/12 text-success"
          : "bg-primary/12 text-primary"
  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="pb-0">
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${accentClass}`}
          >
            <Icon className="size-4" />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.startsWith('-') ? 'text-destructive' : 'text-success'}`}>
              <ArrowUpRight className={`size-3 ${trend.startsWith('-') ? 'rotate-90' : ''}`} />
              {trend}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardView({
  clients,
  leads,
}: {
  clients: Client[]
  leads: Lead[]
}) {
  const allPolicies = clients.flatMap((c) =>
    c.policies.map((p) => ({ client: c, policy: p }))
  )

  const activePolicies = allPolicies.length

  const upcoming = allPolicies
    .map((entry) => ({ ...entry, days: daysUntilExpiry(entry.policy) }))
    .filter((entry) => entry.days >= 0 && entry.days <= 7)
    .sort((a, b) => a.days - b.days)

  // --- DYNAMIC CALCULATIONS ---
  const pendingQuotes = leads.filter((l) => l.status === "yeni").length

  const totalRevenue = clients.reduce((sum, client) => {
    return sum + client.financials.filter(f => f.kind === 'tahsilat').reduce((s, f) => s + f.amount, 0)
  }, 0)
  const totalCommission = clients.reduce((sum, client) => {
    return sum + client.financials.filter(f => f.kind === 'komisyon').reduce((s, f) => s + f.amount, 0)
  }, 0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const netEarningsThisMonth = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'komisyon' && new Date(f.date).getMonth() === currentMonth && new Date(f.date).getFullYear() === currentYear)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)

  const netEarningsLastMonth = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'komisyon' && new Date(f.date).getMonth() === lastMonth && new Date(f.date).getFullYear() === lastMonthYear)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)

  const netEarningsMoMValue = netEarningsLastMonth === 0 
    ? (netEarningsThisMonth > 0 ? 100 : 0) 
    : ((netEarningsThisMonth - netEarningsLastMonth) / netEarningsLastMonth) * 100
  
  const netEarningsMoM = netEarningsMoMValue >= 0 ? `+${formatPercent(netEarningsMoMValue)}` : `-${formatPercent(Math.abs(netEarningsMoMValue))}`

  const revenueThisMonth = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'tahsilat' && new Date(f.date).getMonth() === currentMonth && new Date(f.date).getFullYear() === currentYear)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)
    
  const revenueLastMonth = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'tahsilat' && new Date(f.date).getMonth() === lastMonth && new Date(f.date).getFullYear() === lastMonthYear)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)

  const revenueMoMValue = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
  const revenueMoM = revenueMoMValue >= 0 ? `+${formatPercent(revenueMoMValue)}` : `-${formatPercent(Math.abs(revenueMoMValue))}`

  const currentYearCommission = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'komisyon' && new Date(f.date).getFullYear() === currentYear)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)
    
  const lastYearCommission = clients.reduce((sum, client) => {
    return sum + client.financials
      .filter(f => f.kind === 'komisyon' && new Date(f.date).getFullYear() === currentYear - 1)
      .reduce((s, f) => s + f.amount, 0)
  }, 0)
    
  const commissionYoYValue = lastYearCommission === 0 ? (currentYearCommission > 0 ? 100 : 0) : ((currentYearCommission - lastYearCommission) / lastYearCommission) * 100
  const commissionYoY = commissionYoYValue >= 0 ? `+${formatPercent(commissionYoYValue)}` : `-${formatPercent(Math.abs(commissionYoYValue))}`

  const activeThisMonth = clients.filter(c => new Date(c.since).getMonth() === currentMonth && new Date(c.since).getFullYear() === currentYear).length
  const activeLastMonth = clients.filter(c => new Date(c.since).getMonth() === lastMonth && new Date(c.since).getFullYear() === lastMonthYear).length
  const activeMoMValue = activeLastMonth === 0 ? (activeThisMonth > 0 ? 100 : 0) : ((activeThisMonth - activeLastMonth) / activeLastMonth) * 100
  const activeMoM = activeMoMValue >= 0 ? `+${formatPercent(activeMoMValue)}` : `-${formatPercent(Math.abs(activeMoMValue))}`

  const retentionRate = 0 // Data not tracked yet

  const monthlyProduction: { month: string, prim: number, komisyon: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = d.toLocaleDateString("tr-TR", { month: "short" })
    
    const monthFinancials = clients.flatMap(c => c.financials.filter(f => {
      const fd = new Date(f.date)
      return fd.getMonth() === d.getMonth() && fd.getFullYear() === d.getFullYear()
    }))

    monthlyProduction.push({
      month: monthName,
      prim: monthFinancials.filter(f => f.kind === 'tahsilat').reduce((sum, f) => sum + f.amount, 0),
      komisyon: monthFinancials.filter(f => f.kind === 'komisyon').reduce((sum, f) => sum + f.amount, 0)
    })
  }

  const typeToPortfolioKey = {
    Trafik: "arac",
    Kasko: "arac",
    DASK: "dask",
    Konut: "konut",
    Saglik: "saglik"
  } as const

  const mixMap = allPolicies.reduce((acc, p) => {
    const key = typeToPortfolioKey[p.policy.type as keyof typeof typeToPortfolioKey] || "arac"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const policyMix = Object.keys(mixMap).map(key => ({
    key,
    type: portfolioConfig[key as keyof typeof portfolioConfig]?.label || key,
    value: allPolicies.length > 0 ? Math.round((mixMap[key] / allPolicies.length) * 100) : 0,
    fill: portfolioConfig[key as keyof typeof portfolioConfig]?.color || "var(--chart-1)"
  }))
  if (policyMix.length === 0) {
    policyMix.push({ key: "empty", type: "Kayıt Yok", value: 100, fill: "var(--muted)" })
  }

  // --- END DYNAMIC CALCULATIONS ---

  return (
    <div className="flex flex-col gap-6">
      {/* Finance KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Toplam Ciro"
          value={formatCurrency(totalRevenue)}
          hint="aktif poliçe primi"
          trend={revenueMoM}
          icon={Wallet}
        />
        <KpiCard
          label="Bu Ayki Net Kazanç"
          value={formatCurrency(netEarningsThisMonth)}
          hint="net komisyon geliri"
          trend={netEarningsMoM}
          icon={Coins}
          accent="success"
        />
        <KpiCard
          label="Yıllık Net Komisyon"
          value={formatCurrency(totalCommission)}
          hint="son 12 ay toplam"
          trend={commissionYoY}
          icon={Percent}
        />
        <KpiCard
          label="Poliçe Yenileme Oranı"
          value={formatPercent(retentionRate)}
          hint="retention verisi yok"
          icon={Repeat}
          accent="success"
        />
        <KpiCard
          label="Aktif Poliçe"
          value={String(activePolicies)}
          hint={`Trafik · Kasko · DASK · ${pendingQuotes} bekleyen teklif`}
          trend={activeMoM}
          icon={FileCheck2}
        />
        <KpiCard
          label="Yaklaşan Yenilemeler"
          value={String(upcoming.length)}
          hint="önümüzdeki 7 gün"
          icon={CalendarClock}
          accent="destructive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Premium vs commission area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aylık Prim Üretimi & Net Komisyon</CardTitle>
            <CardDescription>
              Son 12 ayın prim üretimi ve net komisyon geliri (TRY)
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">
                <TrendingUp className="size-3" data-icon="inline-start" />
                12 Ay
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={productionConfig}
              className="aspect-auto h-72 w-full"
            >
              <AreaChart
                data={monthlyProduction}
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="fillPrim" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-prim)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-prim)"
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                  <linearGradient id="fillKom" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-komisyon)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-komisyon)"
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}B`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {productionConfig[
                              name as keyof typeof productionConfig
                            ]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="prim"
                  type="monotone"
                  stroke="var(--color-prim)"
                  strokeWidth={2}
                  fill="url(#fillPrim)"
                />
                <Area
                  dataKey="komisyon"
                  type="monotone"
                  stroke="var(--color-komisyon)"
                  strokeWidth={2}
                  fill="url(#fillKom)"
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-2 flex items-center gap-4 px-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-chart-1" />
                Prim Üretimi
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-chart-4" />
                Net Komisyon
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio breakdown donut */}
        <Card>
          <CardHeader>
            <CardTitle>Portföy Dağılımı</CardTitle>
            <CardDescription>Üretim payına göre branş dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer
              config={portfolioConfig}
              className="mx-auto aspect-square h-52 w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {portfolioConfig[
                              name as keyof typeof portfolioConfig
                            ]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatPercent(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={policyMix}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={58}
                  outerRadius={82}
                  strokeWidth={4}
                  stroke="var(--card)"
                >
                  {policyMix.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const maxMix = policyMix.reduce((prev, current) => (prev.value > current.value && current.key !== "empty") ? prev : current, policyMix[0] || { value: 0, type: "Kayıt Yok" })
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-semibold tabular-nums"
                            >
                              %{maxMix.value}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              {maxMix.type} ağırlıklı
                            </tspan>
                          </text>
                        )
                      }
                      return null
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex flex-col gap-2">
              {policyMix.map((entry) => (
                <div
                  key={entry.key}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        portfolioConfig[
                          entry.key as keyof typeof portfolioConfig
                        ].color,
                    }}
                  />
                  <span className="flex-1 text-muted-foreground">
                    {entry.type}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPercent(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent renewals */}
      <Card>
        <CardHeader>
          <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/12 text-destructive">
            <AlertTriangle className="size-4" />
          </div>
          <CardTitle>Yaklaşan Poliçeler</CardTitle>
          <CardDescription>
            Kasko / Trafik sigortası 7 gün içinde sona eren müşteriler
          </CardDescription>
          <CardAction>
            <Badge variant="destructive">{upcoming.length} acil</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col">
          {upcoming.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Önümüzdeki 7 gün içinde sona eren poliçe bulunmuyor.
            </p>
          )}
          {upcoming.map((entry, i) => (
            <React.Fragment key={entry.policy.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 py-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-muted text-xs font-medium">
                    {entry.client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {entry.client.name}
                    </span>
                    <PolicyTypeBadge type={entry.policy.type} />
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {entry.client.vehicle.plate} · {entry.policy.company}
                  </span>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium tabular-nums">
                    {formatCurrency(entry.policy.premium)}
                  </div>
                  <div className="text-xs text-muted-foreground">prim</div>
                </div>
                <div className="w-24 text-right">
                  <ExpiryBadge days={entry.days} />
                </div>
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
