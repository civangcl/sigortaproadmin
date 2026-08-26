const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = buildTenantScope(context);

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
      skip,
      take
    }),
    prisma.lead.count({ where })
  ]);
  
  return { items, total };
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.lead.create({
    data: {
      ...data,
      companyId: tenantId
    }
  });
}

async function findUniqueForTenant(context, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.lead.findFirst({
    where: {
      id,
      ...buildTenantScope(context)
    }
  });
}

async function updateForTenant(tenantId, id, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.lead.update({
    where: { id },
    data
  });
}

module.exports = {
  findManyForTenant,
  createForTenant,
  findUniqueForTenant,
  updateForTenant
};
