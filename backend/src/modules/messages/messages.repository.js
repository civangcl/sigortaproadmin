const globalPrisma = require('../../lib/prisma');
const { buildTenantScope } = require('../../utils/tenant-scope');

async function findManyForTenant(context, options = {}) {
  const { skip, take } = options;
  const prisma = options.tx || globalPrisma;
  const where = buildTenantScope(context);

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.message.count({ where })
  ]);

  return { items, total };
}

async function findUniqueForTenant(context, id, tx) {
  const prisma = tx || globalPrisma;
  return prisma.message.findFirst({
    where: {
      id,
      ...buildTenantScope(context)
    }
  });
}

async function updateForTenant(tenantId, id, data, tx) {
  const prisma = tx || globalPrisma;
  return prisma.message.update({
    where: { id },
    data
  });
}

module.exports = {
  findManyForTenant,
  findUniqueForTenant,
  updateForTenant
};
