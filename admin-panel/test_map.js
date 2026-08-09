const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: true,
      }
    })

    const mapped = leads.map(lead => ({
      id: lead.id,
      date: lead.createdAt.toISOString(),
      insuranceType: lead.insuranceType,
      name: lead.fullName,
      tc: lead.tcKimlikNo || '',
      birthDate: lead.dateOfBirth || '',
      phone: lead.phoneNumber,
      email: lead.email || undefined,
      city: lead.city || undefined,
      address: lead.address || undefined,
      status: lead.status,
      note: lead.company ? `${lead.company.name} şirketine gelen talep` : '',
      plate: lead.licensePlate || undefined,
      registrationNo: lead.belgeNo || undefined,
      brand: lead.brand || undefined,
      model: lead.model || undefined,
      year: lead.year || undefined,
      engineNo: lead.engineNo || undefined,
      chassisNo: lead.chassisNo || undefined,
      premium: lead.premium || undefined,
      commission: lead.commission || undefined,
    }))
    
    console.log(JSON.stringify(mapped, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
