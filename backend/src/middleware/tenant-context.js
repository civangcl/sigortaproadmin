const AppError = require('../errors/AppError');
const prisma = require('../lib/prisma');

const requireTenant = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Oturum açmanız gerekiyor.', 401);
    }

    const actorUserId = req.user.id;
    const platformRole = req.user.role; // SUPERADMIN vs STAFF (Legacy)
    const isSuperAdmin = platformRole === 'SUPERADMIN';

    // Build the context object foundation
    req.context = {
      actorUserId,
      platformRole,
      isSuperAdmin,
      // Default to legacy fields for backward compatibility
      actorCompanyId: req.user.companyId,
      effectiveCompanyId: req.user.companyId
    };

    if (isSuperAdmin) {
      return next();
    }

    // 1. Resolve Active Membership
    const membership = await prisma.companyMembership.findFirst({
      where: {
        userId: actorUserId,
        status: 'ACTIVE'
      },
      include: {
        branchAccess: true
      }
    });

    if (!membership) {
      throw new AppError('FORBIDDEN', 'Şirket bağlamı (tenant context) bulunamadı veya hesabınız askıya alınmış.', 403);
    }

    // 2. Populate Context V2
    req.context.membershipId = membership.id;
    req.context.membershipRole = membership.role;
    req.context.membershipStatus = membership.status;
    req.context.effectiveCompanyId = membership.companyId;
    req.context.actorCompanyId = membership.companyId; // Overwrite legacy
    req.context.allBranches = membership.allBranches;
    req.context.allowedBranchIds = membership.branchAccess.map(access => access.branchId);

    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    // Platform Role (SUPERADMIN)
    if (req.context.isSuperAdmin) {
      return next();
    }
    
    // Check membership role if provided
    if (roles && !roles.includes(req.context.membershipRole) && !roles.includes(req.context.platformRole)) {
      return next(new AppError('FORBIDDEN', 'Bu işlem için yetkiniz bulunmamaktadır.', 403));
    }
    next();
  };
};

module.exports = {
  requireTenant,
  requireRole
};
