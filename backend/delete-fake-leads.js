const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const fceCompanyId = 'f74c889c-1887-40fc-8710-3630bccff59d';
  const fakeNames = [
    'Okan Yıldız',
    'Deniz Korkmaz',
    'Gökhan Aksoy',
    'Emre Doğan',
    'Tolga Erdoğan',
    'Merve Şen',
    'Hakan Yücel',
    'Ayşe Polat',
    'Kerem Aydın',
    'Sibel Yaman',
    'Barış Çetin'
  ];

  try {
    const deletedLeads = await prisma.lead.deleteMany({
      where: {
        companyId: fceCompanyId,
        fullName: { in: fakeNames }
      }
    });
    console.log(`Deleted ${deletedLeads.count} fake leads from Fırat Ece.`);
  } catch (e) {
    console.error('Error deleting leads:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
