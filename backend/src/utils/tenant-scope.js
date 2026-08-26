/**
 * Builds a Prisma `where` clause object scoped to the user's tenant and branch access.
 * @param {Object} context - The req.context object injected by tenant-context middleware.
 * @returns {Object} A Prisma where clause
 */
function buildTenantScope(context) {
  const where = { companyId: context.effectiveCompanyId };
  
  // Superadmins and Owners (or anyone with allBranches=true) can see all branches in the company.
  if (!context.isSuperAdmin && !context.allBranches) {
    if (context.allowedBranchIds && context.allowedBranchIds.length > 0) {
      where.branchId = { in: context.allowedBranchIds };
    } else {
      // If a user has no allBranches and no specific branches, they can't see anything.
      where.branchId = 'access-denied-no-branches';
    }
  }
  
  return where;
}

module.exports = { buildTenantScope };
