const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Starting Organization Core Backfill${isDryRun ? ' (DRY RUN)' : ''}...`);

  const companies = await prisma.company.findMany({
    include: { users: { orderBy: { createdAt: 'asc' } } }
  });

  const stats = {
    companiesProcessed: 0,
    branchesCreated: 0,
    membershipsCreated: 0,
    ownersCreated: 0,
    clientsUpdated: 0,
    policiesUpdated: 0,
    leadsUpdated: 0,
    financialsUpdated: 0,
    messagesUpdated: 0
  };

  for (const company of companies) {
    stats.companiesProcessed++;
    console.log(`Processing Company: ${company.name} (${company.id})`);

    let defaultBranch = null;

    if (!isDryRun) {
      // Create or Find Default Branch
      defaultBranch = await prisma.branch.findFirst({
        where: { companyId: company.id, isDefault: true }
      });

      if (!defaultBranch) {
        defaultBranch = await prisma.branch.create({
          data: {
            companyId: company.id,
            name: 'Merkez',
            isDefault: true,
            isActive: true
          }
        });
        stats.branchesCreated++;
      }
    } else {
      defaultBranch = { id: 'dry-run-branch-id', companyId: company.id };
      const existingBranch = await prisma.branch.count({ where: { companyId: company.id, isDefault: true } });
      if (existingBranch === 0) stats.branchesCreated++;
    }

    // Process Users to Memberships
    let hasOwner = false;
    for (let i = 0; i < company.users.length; i++) {
      const user = company.users[i];
      let role = 'ADMIN';

      if (!hasOwner || user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        role = 'OWNER';
        hasOwner = true;
      }

      if (!isDryRun) {
        const existingMembership = await prisma.companyMembership.findUnique({
          where: { userId_companyId: { userId: user.id, companyId: company.id } }
        });

        if (!existingMembership) {
          await prisma.companyMembership.create({
            data: {
              userId: user.id,
              companyId: company.id,
              role: role,
              status: 'ACTIVE',
              allBranches: true
            }
          });
          stats.membershipsCreated++;
          if (role === 'OWNER') stats.ownersCreated++;
        }
      } else {
        const existingMembership = await prisma.companyMembership.count({
          where: { userId: user.id, companyId: company.id }
        });
        if (existingMembership === 0) {
          stats.membershipsCreated++;
          if (role === 'OWNER') stats.ownersCreated++;
        }
      }
    }

    // Process Tenant Data
    const models = ['client', 'policy', 'lead', 'financial', 'message'];
    
    for (const modelName of models) {
      const nullCount = await prisma[modelName].count({
        where: { companyId: company.id, branchId: null }
      });
      
      stats[`${modelName}sUpdated`] += nullCount;

      if (!isDryRun && nullCount > 0) {
        await prisma[modelName].updateMany({
          where: { companyId: company.id, branchId: null },
          data: { branchId: defaultBranch.id }
        });
      }
    }
  }

  console.log('\n--- BACKFILL RESULTS ---');
  console.log(JSON.stringify(stats, null, 2));

  if (isDryRun) {
    console.log('\nTo execute, run without --dry-run flag.');
  } else {
    console.log('\nBackfill completed successfully.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
