// Ece Sigorta Admin — mock data & domain types.
// All financial values are in Turkish Lira (TRY).

export type PolicyType = "Trafik" | "Kasko" | "DASK"

export interface Policy {
  id: string
  type: PolicyType
  company: string
  policyNo: string
  premium: number
  startDate: string // ISO
  endDate: string // ISO
}

export interface FinancialRecord {
  id: string
  date: string // ISO
  description: string
  amount: number
  kind: "tahsilat" | "komisyon"
}

export interface Vehicle {
  plate: string
  brand: string
  model: string
  year: number
  engineNo: string
  chassisNo: string
}

export interface Client {
  id: string
  name: string
  tc: string
  phone: string
  email: string
  city: string
  since: string // ISO — customer since
  vehicle: Vehicle
  policies: Policy[]
  financials: FinancialRecord[]
}

export type InsuranceType = "arac" | "dask" | "saglik" | "konut"

export interface Lead {
  id: string
  date: string // ISO
  insuranceType: InsuranceType
  name: string
  tc: string // TC Kimlik No
  birthDate: string // Doğum Tarihi (dd.mm.yyyy)
  phone: string
  email?: string
  city?: string
  status: "yeni" | "iletildi" | "onaylandi" | "silindi"
  note: string
  // Finansal Değerler
  premium?: number
  commission?: number
  // Araç sigortası alanları
  plate?: string
  registrationNo?: string // Belge / Tescil Numarası
  brand?: string
  model?: string
  year?: number
  engineNo?: string
  chassisNo?: string
  // DASK / Konut alanları
  address?: string
}

export const INSURANCE_TYPES: { id: InsuranceType; label: string }[] = [
  { id: "arac", label: "Araç Sigortası" },
  { id: "dask", label: "DASK" },
  { id: "saglik", label: "Sağlık" },
  { id: "konut", label: "Konut" },
]

export interface MonthlyProduction {
  month: string
  prim: number
  komisyon: number
}

// ---- date helpers (reference "today" is derived from the runtime) ----
const DAY = 24 * 60 * 60 * 1000

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString()
}
function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Percentage of the policy term already elapsed (0-100). */
export function policyProgress(policy: Policy): number {
  const start = new Date(policy.startDate).getTime()
  const end = new Date(policy.endDate).getTime()
  const now = Date.now()
  if (now <= start) return 0
  if (now >= end) return 100
  return Math.round(((now - start) / (end - start)) * 100)
}

/** Whole days remaining until the policy expires (can be negative). */
export function daysUntilExpiry(policy: Policy): number {
  return Math.ceil((new Date(policy.endDate).getTime() - Date.now()) / DAY)
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
export const clients: Client[] = [];

// ---------------------------------------------------------------------------
// Inbound leads (web-form submissions)
// ---------------------------------------------------------------------------
export const leads: Lead[] = [
  // --- Araç Sigortası ---
  {
    id: "l1",
    date: daysAgo(0),
    insuranceType: "arac",
    name: "Okan Yıldız",
    tc: "11223344556",
    birthDate: "12.03.1985",
    plate: "34 GH 8812",
    registrationNo: "AB123456",
    phone: "0532 776 11 09",
    status: "yeni",
    note: "Kasko + Trafik fiyat karşılaştırması istiyor.",
  },
  {
    id: "l2",
    date: daysAgo(0),
    insuranceType: "arac",
    name: "Deniz Korkmaz",
    tc: "22334455667",
    birthDate: "28.07.1992",
    plate: "35 TR 4410",
    registrationNo: "CD778901",
    phone: "0543 220 88 31",
    status: "yeni",
    note: "Yeni araç, sıfır kilometre kasko.",
  },
  {
    id: "l3",
    date: daysAgo(1),
    insuranceType: "arac",
    name: "Gökhan Aksoy",
    tc: "33221100998",
    birthDate: "15.04.1988",
    plate: "06 BN 1247",
    registrationNo: "EF442310",
    phone: "0505 909 45 72",
    status: "yeni",
    note: "Trafik sigortası yenileme.",
  },
  {
    id: "l5",
    date: daysAgo(2),
    insuranceType: "arac",
    name: "Emre Doğan",
    tc: "44118822996",
    birthDate: "22.11.1994",
    plate: "34 PL 5521",
    registrationNo: "GH552108",
    phone: "0542 441 90 03",
    status: "yeni",
    note: "Kasko hasarsızlık indirimi soruyor.",
  },
  {
    id: "l7",
    date: daysAgo(4),
    insuranceType: "arac",
    name: "Tolga Erdoğan",
    tc: "55667788990",
    birthDate: "03.09.1979",
    plate: "41 SV 2201",
    registrationNo: "IJ220145",
    phone: "0544 330 71 25",
    status: "iletildi",
    note: "İkinci araç için kasko.",
  },
  // --- DASK ---
  {
    id: "l4",
    date: daysAgo(1),
    insuranceType: "dask",
    name: "Merve Şen",
    tc: "33445566778",
    birthDate: "09.01.1990",
    address: "Nilüfer / Bursa — 3+1 daire, 120 m²",
    phone: "0536 118 27 64",
    status: "iletildi",
    note: "DASK zorunlu deprem sigortası teklifi gönderildi.",
  },
  {
    id: "l8",
    date: daysAgo(2),
    insuranceType: "dask",
    name: "Hakan Yücel",
    tc: "66778899001",
    birthDate: "17.06.1983",
    address: "Kadıköy / İstanbul — 2+1 daire, 95 m²",
    phone: "0532 004 21 76",
    status: "yeni",
    note: "DASK poliçe yenileme talebi.",
  },
  // --- Sağlık ---
  {
    id: "l9",
    date: daysAgo(0),
    insuranceType: "saglik",
    name: "Ayşe Polat",
    tc: "77889900112",
    birthDate: "25.12.1995",
    phone: "0505 337 65 20",
    status: "yeni",
    note: "Tamamlayıcı sağlık sigortası fiyatı istiyor.",
  },
  {
    id: "l10",
    date: daysAgo(3),
    insuranceType: "saglik",
    name: "Kerem Aydın",
    tc: "88990011223",
    birthDate: "11.02.1987",
    phone: "0543 771 09 44",
    status: "iletildi",
    note: "Özel sağlık sigortası teklifi iletildi.",
  },
  // --- Konut ---
  {
    id: "l11",
    date: daysAgo(1),
    insuranceType: "konut",
    name: "Sibel Yaman",
    tc: "99001122334",
    birthDate: "30.08.1991",
    address: "Çankaya / Ankara — 4+1 villa, 210 m²",
    phone: "0536 220 88 17",
    status: "yeni",
    note: "Konut paket sigortası (eşya + hırsızlık) istiyor.",
  },
  {
    id: "l12",
    date: daysAgo(5),
    insuranceType: "konut",
    name: "Barış Çetin",
    tc: "10111213141",
    birthDate: "05.05.1980",
    address: "Konak / İzmir — 3+1 daire, 130 m²",
    phone: "0542 118 33 05",
    status: "iletildi",
    note: "Konut sigortası yangın teminatı teklifi gönderildi.",
  },
]

// ---------------------------------------------------------------------------
// Monthly production (last 12 months) for financial charts
// ---------------------------------------------------------------------------
export const monthlyProduction: MonthlyProduction[] = [
  { month: "Ağu", prim: 412000, komisyon: 61800 },
  { month: "Eyl", prim: 388000, komisyon: 58200 },
  { month: "Eki", prim: 451000, komisyon: 67650 },
  { month: "Kas", prim: 502000, komisyon: 75300 },
  { month: "Ara", prim: 613000, komisyon: 91950 },
  { month: "Oca", prim: 548000, komisyon: 82200 },
  { month: "Şub", prim: 471000, komisyon: 70650 },
  { month: "Mar", prim: 629000, komisyon: 94350 },
  { month: "Nis", prim: 688000, komisyon: 103200 },
  { month: "May", prim: 734000, komisyon: 110100 },
  { month: "Haz", prim: 801000, komisyon: 120150 },
  { month: "Tem", prim: 872000, komisyon: 130800 },
]

// ---------------------------------------------------------------------------
// Portfolio breakdown for the dashboard donut (share of production, %)
// ---------------------------------------------------------------------------
export const policyMix = [
  { key: "arac", type: "Araç", value: 65, fill: "var(--color-arac)" },
  { key: "dask", type: "DASK", value: 20, fill: "var(--color-dask)" },
  { key: "saglik", type: "Sağlık", value: 15, fill: "var(--color-saglik)" },
]

// ---------------------------------------------------------------------------
// Headline financial metrics for the analysis dashboard
// ---------------------------------------------------------------------------
/** Policy retention / renewal rate (%). */
export const retentionRate = 87.4

/** Net earnings (commission) booked in the current month, TRY. */
export const netEarningsThisMonth =
  monthlyProduction[monthlyProduction.length - 1].komisyon

/** Month-over-month change in net earnings (%). */
export const netEarningsMoM = (() => {
  const last = monthlyProduction[monthlyProduction.length - 1].komisyon
  const prev = monthlyProduction[monthlyProduction.length - 2].komisyon
  return ((last - prev) / prev) * 100
})()
