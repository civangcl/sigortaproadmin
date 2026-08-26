const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const eceCompanyId = 'f74c889c-1887-40fc-8710-3630bccff59d';
    
    await prisma.user.updateMany({
      where: {
        email: { in: ['admin@sigortapanel.com', 'civangcl@gmail.com'] }
      },
      data: {
        companyId: eceCompanyId
      }
    });

    console.log('Superadmin users updated to use Fırat Ece companyId.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
