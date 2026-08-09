require('ts-node').register({
  compilerOptions: { module: 'commonjs', esModuleInterop: true },
});
const { PrismaClient } = require('@prisma/client')
const { leads } = require('./lib/mock-data.ts')

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
          email: lead.email,
          city: lead.city,
          address: lead.address,
          status: lead.status,
          licensePlate: lead.plate,
          belgeNo: lead.registrationNo,
          brand: lead.brand,
          model: lead.model,
          year: lead.year,
          engineNo: lead.engineNo,
          chassisNo: lead.chassisNo,
          premium: lead.premium,
          commission: lead.commission,
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
