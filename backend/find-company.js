const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const eceCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: 'Ece', mode: 'insensitive' } },
          { name: { contains: 'Fırat', mode: 'insensitive' } },
          { domain: { contains: 'ece', mode: 'insensitive' } }
        ]
      }
    });
    console.log('ECE COMPANY:', eceCompany);
    
    if (eceCompany) {
      const branch = await prisma.branch.findFirst({
        where: { companyId: eceCompany.id }
      });
      console.log('DEFAULT BRANCH:', branch);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
