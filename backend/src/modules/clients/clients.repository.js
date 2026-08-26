const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = buildTenantScope(context);
  
  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { policies: true, financials: true, leads: true },
      skip,
      take
    }),
    prisma.client.count({ where })
  ]);
  
  return { items, total };
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  const { companyId, id, createdAt, updatedAt, ...safeData } = data;
  
  return prisma.client.create({
    data: {
      ...safeData,
      companyId: tenantId
    }
  });
}

async function findUniqueForTenant(context, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.client.findFirst({
    where: {
      id,
      ...buildTenantScope(context)
    }
  });
}

async function updateForTenant(tenantId, id, data, tx) {
  const prisma = tx || globalPrisma;
  const { companyId, createdAt, updatedAt, ...safeData } = data;

  return prisma.client.update({
    where: { id },
    data: safeData
  });
}

async function deleteForTenant(tenantId, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.client.delete({
    where: { id }
  });
}

module.exports = {
  findManyForTenant,
  createForTenant,
  findUniqueForTenant,
  updateForTenant,
  deleteForTenant
};
