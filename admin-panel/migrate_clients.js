const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany({
    where: {
      status: { in: ['iletildi', 'onaylandi'] },
      clientId: null
    }
  })

  console.log(`Found ${leads.length} leads to migrate.`)

  for (const lead of leads) {
    const client = await prisma.client.create({
      data: {
        name: lead.fullName,
        tc: lead.tcKimlikNo,
        phone: lead.phoneNumber,
        email: lead.email,
        city: lead.city,
        address: lead.address,
        plate: lead.licensePlate,
        brand: lead.brand,
        model: lead.model,
        year: lead.year,
        engineNo: lead.engineNo,
        chassisNo: lead.chassisNo,
        companyId: lead.companyId,
      }
    })

    await prisma.lead.update({
      where: { id: lead.id },
      data: { clientId: client.id }
    })

    if (lead.status === 'onaylandi') {
      const policyType = lead.insuranceType === 'arac' ? 'Trafik' : 'DASK'
      const premium = lead.premium || 0
      const commission = lead.commission || 0

      await prisma.policy.create({
        data: {
          type: policyType,
          companyName: 'Bilinmiyor',
          policyNo: '—',
          premium,
          commission,
          startDate: lead.createdAt,
          endDate: new Date(new Date(lead.createdAt).setFullYear(new Date(lead.createdAt).getFullYear() + 1)),
          clientId: client.id,
          companyId: lead.companyId,
        }
      })

      if (premium > 0) {
        await prisma.financial.create({
          data: {
            kind: 'tahsilat',
            amount: premium,
            description: `${policyType} Satışı`,
            date: lead.createdAt,
            clientId: client.id,
            companyId: lead.companyId,
          }
        })
      }

      if (commission > 0) {
        await prisma.financial.create({
          data: {
            kind: 'komisyon',
            amount: commission,
            description: `${policyType} Komisyonu`,
            date: lead.createdAt,
            clientId: client.id,
            companyId: lead.companyId,
          }
        })
      }
    }
  }

  console.log('Migration done!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
