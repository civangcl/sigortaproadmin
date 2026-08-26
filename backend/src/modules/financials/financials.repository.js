const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = buildTenantScope(context);

  const [items, total] = await Promise.all([
    prisma.financial.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { client: true },
      skip,
      take
    }),
    prisma.financial.count({ where })
  ]);
  
  return { items, total };
}

async function createForTenant(tenantId, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.financial.create({
    data: {
      ...data,
      companyId: tenantId
    }
  });
}

module.exports = {
  findManyForTenant,
  createForTenant
};
