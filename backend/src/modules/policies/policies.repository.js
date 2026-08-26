const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = buildTenantScope(context);
  
  const [items, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
      skip,
      take
    }),
    prisma.policy.count({ where })
  ]);
  
  return { items, total };
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  const { companyId, id, createdAt, updatedAt, ...safeData } = data;
  
  return prisma.policy.create({
    data: {
      ...safeData,
      companyId: tenantId
    }
  });
}

async function findUniqueForTenant(context, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.policy.findFirst({
    where: {
      id,
      ...buildTenantScope(context)
    }
  });
}

async function updateForTenant(tenantId, id, data, tx) {
  const prisma = tx || globalPrisma;
  const { companyId, createdAt, updatedAt, ...safeData } = data;

  return prisma.policy.update({
    where: { id },
    data: safeData
  });
}

async function deleteForTenant(tenantId, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.policy.delete({
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
