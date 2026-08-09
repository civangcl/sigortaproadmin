const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const leads = await prisma.lead.findMany()
  console.log(`Total leads in DB: ${leads.length}`)
  console.log(leads.map(l => ({ id: l.id, status: l.status, name: l.fullName })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
