const AppError = require('../../errors/AppError');
const staffRepository = require('./staff.repository');
const prisma = require('../../lib/prisma');

async function getStaffMembers(context, options) {
  const tenantId = context.effectiveCompanyId;
  return staffRepository.findManyForTenant(tenantId, options);
}

async function getStaffById(context, id) {
  const tenantId = context.effectiveCompanyId;
  const staff = await staffRepository.findUniqueForTenant(tenantId, id);
  
  if (!staff) {
    throw new AppError('NOT_FOUND', 'Personel bulunamadı', 404);
  }
  
  return staff;
}

async function createStaff(context, payload) {
  const tenantId = context.effectiveCompanyId;
  const { branchIds, ...data } = payload;
  
  // Cross-tenant check: ensure branchIds actually belong to this company
  if (branchIds && branchIds.length > 0) {
    const validBranches = await prisma.branch.count({
      where: {
        id: { in: branchIds },
        companyId: tenantId
      }
    });
    if (validBranches !== branchIds.length) {
      throw new AppError('BAD_REQUEST', 'Geçersiz şube seçimi', 400);
    }
  }

  // Cross-tenant check: ensure userId exists
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'Kullanıcı bulunamadı', 404);
  }

  return staffRepository.createForTenant(tenantId, data, branchIds || []);
}

async function updateStaff(context, id, payload) {
  const tenantId = context.effectiveCompanyId;
  const { branchIds, ...data } = payload;
  
  const existing = await staffRepository.findUniqueForTenant(tenantId, id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Personel bulunamadı', 404);
  }

  // Owner koruması
  if (existing.role === 'OWNER' && (data.role && data.role !== 'OWNER' || data.status === 'SUSPENDED')) {
    throw new AppError('FORBIDDEN', 'Şirket sahibinin rolü değiştirilemez veya hesabı askıya alınamaz', 403);
  }

  // Privilege escalation koruması
  if (data.role === 'OWNER' && context.membershipRole !== 'OWNER' && !context.isSuperAdmin) {
    throw new AppError('FORBIDDEN', 'Yalnızca mevcut OWNER yeni bir OWNER atayabilir', 403);
  }

  if (branchIds && branchIds.length > 0) {
    const validBranches = await prisma.branch.count({
      where: {
        id: { in: branchIds },
        companyId: tenantId
      }
    });
    if (validBranches !== branchIds.length) {
      throw new AppError('BAD_REQUEST', 'Geçersiz şube seçimi', 400);
    }
  }

  return staffRepository.updateForTenant(tenantId, id, data, branchIds);
}

module.exports = {
  getStaffMembers,
  getStaffById,
  createStaff,
  updateStaff
};
