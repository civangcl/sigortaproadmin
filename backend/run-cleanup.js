const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const eceId = 'f74c889c-1887-40fc-8710-3630bccff59d';
  const dupId = 'af5cd5c3-b477-46c5-803e-de41fb6f5e7f';
  
  console.log('--- STARTING CLEANUP ---');

  // 1. Superadmin Isolation
  const superadmins = ['admin@sigortapanel.com', 'civangcl@gmail.com'];
  const superadminUsers = await prisma.user.findMany({ where: { email: { in: superadmins } } });
  
  for (const sa of superadminUsers) {
    // Set companyId to null
    await prisma.user.update({
      where: { id: sa.id },
      data: { companyId: null }
    });
    // Delete memberships
    await prisma.companyMembership.deleteMany({
      where: { userId: sa.id }
    });
    console.log(`[OK] Isolated SuperAdmin: ${sa.email}`);
  }

  // 2. Setup ECE OWNER Tenant Account (demo@sigortapro.com)
  const ownerUser = await prisma.user.findFirst({ where: { email: 'demo@sigortapro.com' } });
  if (ownerUser) {
    // Update user
    await prisma.user.update({
      where: { id: ownerUser.id },
      data: { 
        companyId: eceId,
        role: 'STAFF' // Should be STAFF or OWNER legacy? Schema role is STAFF for tenant users
      }
    });

    // Find if user already has a membership in ECE, or update existing
    const existingMembership = await prisma.companyMembership.findFirst({
      where: { userId: ownerUser.id }
    });

    if (existingMembership) {
      await prisma.companyMembership.update({
        where: { id: existingMembership.id },
        data: {
          companyId: eceId,
          role: 'OWNER',
          status: 'ACTIVE',
          allBranches: true
        }
      });
    } else {
      await prisma.companyMembership.create({
        data: {
          userId: ownerUser.id,
          companyId: eceId,
          role: 'OWNER',
          status: 'ACTIVE',
          allBranches: true
        }
      });
    }
    console.log(`[OK] Updated ECE OWNER (demo@sigortapro.com) to point to canonical Ece tenant.`);
  } else {
    console.log(`[WARN] demo@sigortapro.com not found.`);
  }

  // 3. Duplicate Company Cleanup
  const leadsDeleted = await prisma.lead.deleteMany({ where: { companyId: dupId } });
  console.log(`[OK] Deleted ${leadsDeleted.count} duplicate leads.`);
  
  const branchesDeleted = await prisma.branch.deleteMany({ where: { companyId: dupId } });
  console.log(`[OK] Deleted ${branchesDeleted.count} duplicate branches.`);
  
  const membershipsDeleted = await prisma.companyMembership.deleteMany({ where: { companyId: dupId } });
  console.log(`[OK] Deleted ${membershipsDeleted.count} duplicate memberships.`);
  
  try {
    await prisma.company.delete({ where: { id: dupId } });
    console.log(`[OK] Deleted Duplicate Company (af5...).`);
  } catch (err) {
    console.log(`[WARN] Could not delete company af5...:`, err.message);
  }

  console.log('--- CLEANUP FINISHED ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
