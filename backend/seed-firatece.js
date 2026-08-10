const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: './.env' })

const prisma = new PrismaClient()

async function seed() {
  const companyName = 'Fırat Ece Sigorta'
  const ownerName = 'Fırat Ece'

  console.log('1. Veritabanına Şirket ekleniyor...')
  let company = await prisma.company.findFirst({ where: { name: companyName } })
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: companyName,
        domain: 'firatecesigorta.com',
        ownerName: ownerName,
        email: 'demo@firatecesigorta.com',
        phone: '0555 555 5555',
        address: 'İstanbul, Türkiye'
      }
    })
  }

  console.log('2. Fake Data (Müşteriler, Talepler vb.) ekleniyor...')

  // Clear existing fake data for this company to prevent duplicates if run multiple times
  await prisma.lead.deleteMany({ where: { companyId: company.id } })
  await prisma.policy.deleteMany({ where: { companyId: company.id } })
  await prisma.financial.deleteMany({ where: { companyId: company.id } })
  await prisma.client.deleteMany({ where: { companyId: company.id } })
  await prisma.message.deleteMany({ where: { companyId: company.id } })

  // 1. Create Fake Clients
  const clientsData = [
    { name: 'Ahmet Yılmaz', tc: '12345678901', phone: '0532 111 2233', city: 'İstanbul', plate: '34ABC123', brand: 'Renault', model: 'Clio', year: 2020 },
    { name: 'Ayşe Kaya', tc: '12345678902', phone: '0533 222 3344', city: 'Ankara', plate: '06DEF456', brand: 'Volkswagen', model: 'Golf', year: 2018 },
    { name: 'Mehmet Demir', tc: '12345678903', phone: '0534 333 4455', city: 'İzmir', address: 'Karşıyaka', brand: 'Toyota', model: 'Corolla', year: 2022 },
    { name: 'Fatma Çelik', tc: '12345678904', phone: '0535 444 5566', city: 'Bursa', plate: '16GHI789', brand: 'Fiat', model: 'Egea', year: 2021 },
    { name: 'Can Özkan', tc: '12345678905', phone: '0536 555 6677', city: 'Antalya' },
  ];

  const clients = [];
  for (const c of clientsData) {
    const client = await prisma.client.create({
      data: { ...c, companyId: company.id }
    })
    clients.push(client)
  }

  // 2. Create Fake Policies & Financials for Clients
  for (let i = 0; i < clients.length - 1; i++) { // Skip the last one so they don't have a policy yet
    const c = clients[i];
    const premium = Math.floor(Math.random() * 5000) + 3000;
    const commission = premium * 0.15;
    
    await prisma.policy.create({
      data: {
        type: i % 2 === 0 ? 'Trafik' : 'Kasko',
        companyName: i % 2 === 0 ? 'Allianz' : 'Anadolu Sigorta',
        policyNo: `POL-${Math.floor(Math.random() * 1000000)}`,
        premium,
        commission,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        clientId: c.id,
        companyId: company.id
      }
    });

    await prisma.financial.create({
      data: {
        kind: 'tahsilat',
        amount: premium,
        description: `${c.name} Poliçe Satışı`,
        date: new Date(),
        clientId: c.id,
        companyId: company.id
      }
    });

    await prisma.financial.create({
      data: {
        kind: 'komisyon',
        amount: commission,
        description: `${c.name} Poliçe Komisyonu`,
        date: new Date(),
        clientId: c.id,
        companyId: company.id
      }
    });
  }

  // 3. Create Fake Leads (Web Sitesinden Gelen Talepler)
  const leadsData = [
    { insuranceType: 'arac', fullName: 'Kerem Yücel', phoneNumber: '0544 123 4567', city: 'İstanbul', licensePlate: '34ZZZ99', brand: 'BMW', model: '320i', year: 2019, status: 'yeni' },
    { insuranceType: 'konut', fullName: 'Elif Şahin', phoneNumber: '0545 234 5678', city: 'Ankara', address: 'Çankaya Mahallesi', status: 'iletildi' },
    { insuranceType: 'dask', fullName: 'Burak Arslan', phoneNumber: '0546 345 6789', city: 'İzmir', address: 'Bornova', status: 'yeni' },
    { insuranceType: 'arac', fullName: 'Zeynep Kaplan', phoneNumber: '0547 456 7890', city: 'Antalya', licensePlate: '07ABC07', brand: 'Honda', model: 'Civic', year: 2023, status: 'onaylandi', premium: 4500, commission: 675 }, // Onaylanmış ama cliente dönüştürülmemiş gibi
  ];

  for (const l of leadsData) {
    await prisma.lead.create({
      data: { ...l, companyId: company.id }
    });
  }

  console.log('✅ Veritabanına test verileri başarıyla yüklendi!')
  console.log('----------------------------------------------------')
  console.log(`Sunum için kendi Süper Admin hesabınızla (/system-admin) giriş yapıp, listeden Fırat Ece Sigorta'nın yanındaki "İçine Gir (God Mode)" butonuna tıklayın!`)
  console.log('----------------------------------------------------')
}

seed().catch(console.error).finally(() => prisma.$disconnect())
