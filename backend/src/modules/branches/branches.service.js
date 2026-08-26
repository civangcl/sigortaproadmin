const AppError = require('../../errors/AppError');
const branchesRepository = require('./branches.repository');

async function getBranches(context, options) {
  const tenantId = context.effectiveCompanyId;
  return branchesRepository.findManyForTenant(tenantId, options);
}

async function getBranchById(context, id) {
  const tenantId = context.effectiveCompanyId;
  const branch = await branchesRepository.findUniqueForTenant(tenantId, id);
  
  if (!branch) {
    throw new AppError('NOT_FOUND', 'Şube bulunamadı', 404);
  }
  
  return branch;
}

async function createBranch(context, data) {
  const tenantId = context.effectiveCompanyId;
  return branchesRepository.createForTenant(tenantId, data);
}

async function updateBranch(context, id, data) {
  const tenantId = context.effectiveCompanyId;
  
  const branch = await branchesRepository.findUniqueForTenant(tenantId, id);
  if (!branch) {
    throw new AppError('NOT_FOUND', 'Şube bulunamadı', 404);
  }
  
  if (branch.isDefault && data.isActive === false) {
    throw new AppError('BAD_REQUEST', 'Merkez şube pasif yapılamaz', 400);
  }

  return branchesRepository.updateForTenant(tenantId, id, data);
}

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch
};
