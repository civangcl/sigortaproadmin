const globalPrisma = require('../../lib/prisma');

async function findManyForTenant(tenantId, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;

  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      where: { companyId: tenantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.branch.count({ where: { companyId: tenantId } })
  ]);
  
  return { items, total };
}

async function findUniqueForTenant(tenantId, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.branch.findFirst({
    where: {
      id,
      companyId: tenantId
    }
  });
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.branch.create({
    data: {
      ...data,
      companyId: tenantId
    }
  });
}

async function updateForTenant(tenantId, id, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.branch.update({
    where: { id },
    data
  });
}

module.exports = {
  findManyForTenant,
  findUniqueForTenant,
  createForTenant,
  updateForTenant
};
