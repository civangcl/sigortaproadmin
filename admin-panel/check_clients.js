const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const clients = await prisma.client.findMany({
    include: { policies: true, financials: true }
  })
  console.log(`Total clients in DB: ${clients.length}`)
  console.log(JSON.stringify(clients, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
