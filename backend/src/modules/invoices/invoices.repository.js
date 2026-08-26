const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = { companyId: context.effectiveCompanyId }; // Invoice doesn't have branch scope right now
  
  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: true, items: true },
      skip,
      take
    }),
    prisma.invoice.count({ where })
  ]);
  
  return { items, total };
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  const { items, ...safeData } = data;
  
  return prisma.invoice.create({
    data: {
      ...safeData,
      companyId: tenantId,
      items: {
        create: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  });
}

async function findUniqueForTenant(context, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.invoice.findFirst({
    where: {
      id,
      companyId: context.effectiveCompanyId
    },
    include: { client: true, items: true }
  });
}

async function deleteForTenant(tenantId, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.invoice.delete({
    where: { id }
  });
}

module.exports = {
  findManyForTenant,
  createForTenant,
  findUniqueForTenant,
  deleteForTenant
};
