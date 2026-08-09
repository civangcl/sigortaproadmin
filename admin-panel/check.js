const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
prisma.lead.findMany().then(leads => {
  console.log(leads.map(l => l.insuranceType))
  prisma.$disconnect()
})
