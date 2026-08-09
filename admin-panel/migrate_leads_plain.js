const { PrismaClient } = require('@prisma/client')

const leads = [
  // --- Araç Sigortası ---
  {
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    insuranceType: "saglik",
    name: "Ayşe Polat",
    tc: "77889900112",
    birthDate: "25.12.1995",
    phone: "0505 337 65 20",
    status: "yeni",
    note: "Tamamlayıcı sağlık sigortası fiyatı istiyor.",
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    insuranceType: "konut",
    name: "Barış Çetin",
    tc: "10111213141",
    birthDate: "05.05.1980",
    address: "Konak / İzmir — 3+1 daire, 130 m²",
    phone: "0542 118 33 05",
    status: "iletildi",
    note: "Konut sigortası yangın teminatı teklifi gönderildi.",
  }
]

const prisma = new PrismaClient()

async function main() {
  const company = await prisma.company.findFirst({
    where: { name: 'Ece Sigorta' }
  })

  if (!company) {
    console.error("Company not found!")
    return
  }

  let count = 0;
  for (const lead of leads) {
    // Check if it exists by phone and name to prevent duplicates
    const existing = await prisma.lead.findFirst({
      where: {
        fullName: lead.name,
        phoneNumber: lead.phone
      }
    })

    if (!existing) {
      await prisma.lead.create({
        data: {
          insuranceType: lead.insuranceType,
          fullName: lead.name,
          tcKimlikNo: lead.tc,
          phoneNumber: lead.phone,
          dateOfBirth: lead.birthDate,
          email: lead.email || null,
          city: lead.city || null,
          address: lead.address || null,
          status: lead.status,
          licensePlate: lead.plate || null,
          belgeNo: lead.registrationNo || null,
          companyId: company.id,
          createdAt: new Date(lead.date)
        }
      })
      count++;
    }
  }

  console.log(`Migrated ${count} leads to the database.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
