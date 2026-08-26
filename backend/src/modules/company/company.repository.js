const prisma = require('../../lib/prisma');

async function findUniqueForTenant(tenantId) {
  return prisma.company.findUnique({
    where: { id: tenantId }
  });
}

async function updateForTenant(tenantId, data) {
  return prisma.company.update({
    where: { id: tenantId },
    data
  });
}

module.exports = {
  findUniqueForTenant,
  updateForTenant
};
