const globalPrisma = require('../../lib/prisma');

async function findManyForTenant(tenantId, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;

  const [items, total] = await Promise.all([
    prisma.companyMembership.findMany({
      where: { companyId: tenantId },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        branchAccess: { include: { branch: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.companyMembership.count({ where: { companyId: tenantId } })
  ]);
  
  return { items, total };
}

async function findUniqueForTenant(tenantId, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.companyMembership.findFirst({
    where: {
      id,
      companyId: tenantId
    },
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      branchAccess: { include: { branch: true } }
    }
  });
}

async function createForTenant(tenantId, data, branchIds = [], tx) {
  const prisma = tx || globalPrisma;
  return prisma.companyMembership.create({
    data: {
      ...data,
      companyId: tenantId,
      branchAccess: {
        create: branchIds.map(branchId => ({ branchId }))
      }
    },
    include: { branchAccess: true }
  });
}

async function updateForTenant(tenantId, id, data, branchIds, tx) {
  const prisma = tx || globalPrisma;
  
  const updateData = { ...data };
  
  if (branchIds !== undefined) {
    updateData.branchAccess = {
      deleteMany: {}, // Remove all existing
      create: branchIds.map(branchId => ({ branchId })) // Add new
    };
  }

  return prisma.companyMembership.update({
    where: { id },
    data: updateData,
    include: { branchAccess: { include: { branch: true } } }
  });
}

module.exports = {
  findManyForTenant,
  findUniqueForTenant,
  createForTenant,
  updateForTenant
};
