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
export const clients: Client[] = [
  {
    id: "c1",
    name: "Ahmet Yılmaz",
    tc: "12345678901",
    phone: "0532 411 22 09",
    email: "ahmet.yilmaz@gmail.com",
    city: "İstanbul",
    since: daysAgo(920),
    vehicle: {
      plate: "34 ABC 123",
      brand: "Volkswagen",
      model: "Passat 1.6 TDI",
      year: 2021,
      engineNo: "CXXB994210",
      chassisNo: "WVWZZZ3CZME045221",
    },
    policies: [
      {
        id: "p1",
        type: "Trafik",
        company: "Anadolu Sigorta",
        policyNo: "TRF-2025-884210",
        premium: 8450,
        startDate: daysAgo(360),
        endDate: daysFromNow(5),
      },
      {
        id: "p2",
        type: "Kasko",
        company: "Allianz",
        policyNo: "KSK-2025-114552",
        premium: 41200,
        startDate: daysAgo(120),
        endDate: daysFromNow(245),
      },
    ],
    financials: [
      { id: "f1", date: daysAgo(360), description: "Trafik poliçe tahsilatı", amount: 8450, kind: "tahsilat" },
      { id: "f2", date: daysAgo(360), description: "Trafik komisyon geliri", amount: 1183, kind: "komisyon" },
      { id: "f3", date: daysAgo(120), description: "Kasko poliçe tahsilatı", amount: 41200, kind: "tahsilat" },
      { id: "f4", date: daysAgo(120), description: "Kasko komisyon geliri", amount: 6180, kind: "komisyon" },
    ],
  },
  {
    id: "c2",
    name: "Elif Demir",
    tc: "23456789012",
    phone: "0505 332 88 41",
    email: "elif.demir@outlook.com",
    city: "Ankara",
    since: daysAgo(540),
    vehicle: {
      plate: "06 XY 4521",
      brand: "Renault",
      model: "Clio 1.0 TCe",
      year: 2022,
      engineNo: "H4DB412210",
      chassisNo: "VF15RBM0H67451220",
    },
    policies: [
      {
        id: "p3",
        type: "Kasko",
        company: "AXA Sigorta",
        policyNo: "KSK-2025-771043",
        premium: 33750,
        startDate: daysAgo(358),
        endDate: daysFromNow(3),
      },
      {
        id: "p4",
        type: "Trafik",
        company: "HDI Sigorta",
        policyNo: "TRF-2025-552118",
        premium: 7200,
        startDate: daysAgo(200),
        endDate: daysFromNow(165),
      },
    ],
    financials: [
      { id: "f5", date: daysAgo(358), description: "Kasko poliçe tahsilatı", amount: 33750, kind: "tahsilat" },
      { id: "f6", date: daysAgo(358), description: "Kasko komisyon geliri", amount: 5062, kind: "komisyon" },
      { id: "f7", date: daysAgo(200), description: "Trafik poliçe tahsilatı", amount: 7200, kind: "tahsilat" },
    ],
  },
  {
    id: "c3",
    name: "Mehmet Kaya",
    tc: "34567890123",
    phone: "0542 907 15 63",
    email: "mehmet.kaya@gmail.com",
    city: "İzmir",
    since: daysAgo(1240),
    vehicle: {
      plate: "35 KY 998",
      brand: "Ford",
      model: "Focus 1.5 TDCi",
      year: 2019,
      engineNo: "XWDA221980",
      chassisNo: "WF05XXGCC5KR21998",
    },
    policies: [
      {
        id: "p5",
        type: "Kasko",
        company: "Türkiye Sigorta",
        policyNo: "KSK-2025-330912",
        premium: 28900,
        startDate: daysAgo(300),
        endDate: daysFromNow(65),
      },
      {
        id: "p6",
        type: "DASK",
        company: "DASK",
        policyNo: "DSK-2025-119043",
        premium: 1350,
        startDate: daysAgo(90),
        endDate: daysFromNow(275),
      },
    ],
    financials: [
      { id: "f8", date: daysAgo(300), description: "Kasko poliçe tahsilatı", amount: 28900, kind: "tahsilat" },
      { id: "f9", date: daysAgo(300), description: "Kasko komisyon geliri", amount: 4335, kind: "komisyon" },
      { id: "f10", date: daysAgo(90), description: "DASK poliçe tahsilatı", amount: 1350, kind: "tahsilat" },
    ],
  },
  {
    id: "c4",
    name: "Zeynep Şahin",
    tc: "45678901234",
    phone: "0533 218 77 90",
    email: "zeynep.sahin@icloud.com",
    city: "Bursa",
    since: daysAgo(210),
    vehicle: {
      plate: "16 ZS 205",
      brand: "Toyota",
      model: "Corolla 1.8 Hybrid",
      year: 2023,
      engineNo: "2ZRFXE20523",
      chassisNo: "NMTBA3BE20R120205",
    },
    policies: [
      {
        id: "p7",
        type: "Kasko",
        company: "Sompo Sigorta",
        policyNo: "KSK-2025-660128",
        premium: 52400,
        startDate: daysAgo(60),
        endDate: daysFromNow(305),
      },
      {
        id: "p8",
        type: "Trafik",
        company: "Anadolu Sigorta",
        policyNo: "TRF-2025-660129",
        premium: 9100,
        startDate: daysAgo(6),
        endDate: daysFromNow(6),
      },
    ],
    financials: [
      { id: "f11", date: daysAgo(60), description: "Kasko poliçe tahsilatı", amount: 52400, kind: "tahsilat" },
      { id: "f12", date: daysAgo(60), description: "Kasko komisyon geliri", amount: 7860, kind: "komisyon" },
    ],
  },
  {
    id: "c5",
    name: "Can Öztürk",
    tc: "56789012345",
    phone: "0544 601 30 22",
    email: "can.ozturk@gmail.com",
    city: "İstanbul",
    since: daysAgo(760),
    vehicle: {
      plate: "34 CO 7788",
      brand: "BMW",
      model: "320i M Sport",
      year: 2022,
      engineNo: "B48B20O777",
      chassisNo: "WBA5V110X0FH77883",
    },
    policies: [
      {
        id: "p9",
        type: "Kasko",
        company: "Allianz",
        policyNo: "KSK-2025-901277",
        premium: 68900,
        startDate: daysAgo(150),
        endDate: daysFromNow(215),
      },
    ],
    financials: [
      { id: "f13", date: daysAgo(150), description: "Kasko poliçe tahsilatı", amount: 68900, kind: "tahsilat" },
      { id: "f14", date: daysAgo(150), description: "Kasko komisyon geliri", amount: 10335, kind: "komisyon" },
    ],
  },
  {
    id: "c6",
    name: "Fatma Arslan",
    tc: "67890123456",
    phone: "0537 445 91 08",
    email: "fatma.arslan@hotmail.com",
    city: "Antalya",
    since: daysAgo(430),
    vehicle: {
      plate: "07 FA 312",
      brand: "Hyundai",
      model: "i20 1.4 MPI",
      year: 2020,
      engineNo: "G4LCK312044",
      chassisNo: "NLHB251CALZ312044",
    },
    policies: [
      {
        id: "p10",
        type: "Trafik",
        company: "Ray Sigorta",
        policyNo: "TRF-2025-410233",
        premium: 6850,
        startDate: daysAgo(363),
        endDate: daysFromNow(2),
      },
      {
        id: "p11",
        type: "DASK",
        company: "DASK",
        policyNo: "DSK-2025-410234",
        premium: 1180,
        startDate: daysAgo(40),
        endDate: daysFromNow(325),
      },
    ],
    financials: [
      { id: "f15", date: daysAgo(363), description: "Trafik poliçe tahsilatı", amount: 6850, kind: "tahsilat" },
      { id: "f16", date: daysAgo(40), description: "DASK poliçe tahsilatı", amount: 1180, kind: "tahsilat" },
    ],
  },
  {
    id: "c7",
    name: "Burak Çelik",
    tc: "78901234567",
    phone: "0538 772 64 15",
    email: "burak.celik@gmail.com",
    city: "Kocaeli",
    since: daysAgo(88),
    vehicle: {
      plate: "41 BC 6600",
      brand: "Mercedes-Benz",
      model: "C200 AMG",
      year: 2023,
      engineNo: "M254E15660",
      chassisNo: "W1K2060461A660012",
    },
    policies: [
      {
        id: "p12",
        type: "Kasko",
        company: "AXA Sigorta",
        policyNo: "KSK-2025-556012",
        premium: 74300,
        startDate: daysAgo(20),
        endDate: daysFromNow(345),
      },
    ],
    financials: [
      { id: "f17", date: daysAgo(20), description: "Kasko poliçe tahsilatı", amount: 74300, kind: "tahsilat" },
      { id: "f18", date: daysAgo(20), description: "Kasko komisyon geliri", amount: 11145, kind: "komisyon" },
    ],
  },
  {
    id: "c8",
    name: "Selin Aydın",
    tc: "89012345678",
    phone: "0505 118 42 77",
    email: "selin.aydin@outlook.com",
    city: "Eskişehir",
    since: daysAgo(365),
    vehicle: {
      plate: "26 SA 145",
      brand: "Fiat",
      model: "Egea 1.4 Fire",
      year: 2021,
      engineNo: "843A114145",
      chassisNo: "NM4358000M4145021",
    },
    policies: [
      {
        id: "p13",
        type: "Trafik",
        company: "HDI Sigorta",
        policyNo: "TRF-2025-220145",
        premium: 5980,
        startDate: daysAgo(355),
        endDate: daysFromNow(10),
      },
      {
        id: "p14",
        type: "Kasko",
        company: "Türkiye Sigorta",
        policyNo: "KSK-2025-220146",
        premium: 26400,
        startDate: daysAgo(180),
        endDate: daysFromNow(185),
      },
    ],
    financials: [
      { id: "f19", date: daysAgo(355), description: "Trafik poliçe tahsilatı", amount: 5980, kind: "tahsilat" },
      { id: "f20", date: daysAgo(180), description: "Kasko poliçe tahsilatı", amount: 26400, kind: "tahsilat" },
      { id: "f21", date: daysAgo(180), description: "Kasko komisyon geliri", amount: 3960, kind: "komisyon" },
    ],
  },
]

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
