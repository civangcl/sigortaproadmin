const AppError = require('../errors/AppError');

// Define specific permissions
const PERMISSIONS = {
  BRANCH_READ: 'BRANCH_READ',
  BRANCH_MANAGE: 'BRANCH_MANAGE',
  
  STAFF_READ: 'STAFF_READ',
  STAFF_MANAGE: 'STAFF_MANAGE',
  
  CLIENT_READ: 'CLIENT_READ',
  CLIENT_CREATE: 'CLIENT_CREATE',
  CLIENT_UPDATE: 'CLIENT_UPDATE',
  CLIENT_ARCHIVE: 'CLIENT_ARCHIVE',
  
  POLICY_READ: 'POLICY_READ',
  POLICY_CREATE: 'POLICY_CREATE',
  POLICY_UPDATE: 'POLICY_UPDATE',
  
  LEAD_READ: 'LEAD_READ',
  LEAD_UPDATE: 'LEAD_UPDATE',
  
  FINANCE_READ: 'FINANCE_READ',
  FINANCE_CREATE: 'FINANCE_CREATE',
  FINANCE_UPDATE: 'FINANCE_UPDATE',
  
  MESSAGE_READ: 'MESSAGE_READ',
  MESSAGE_UPDATE: 'MESSAGE_UPDATE',
  
  COMPANY_SETTINGS_READ: 'COMPANY_SETTINGS_READ',
  COMPANY_SETTINGS_UPDATE: 'COMPANY_SETTINGS_UPDATE',
};

// Map roles to permissions
const ROLE_PERMISSIONS = {
  OWNER: Object.values(PERMISSIONS), // Wildcard: ALL permissions
  ADMIN: Object.values(PERMISSIONS), // Similar to OWNER for now, can be restricted later
  MANAGER: [
    PERMISSIONS.BRANCH_READ, PERMISSIONS.STAFF_READ, 
    PERMISSIONS.CLIENT_READ, PERMISSIONS.CLIENT_CREATE, PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.POLICY_READ, PERMISSIONS.POLICY_CREATE, PERMISSIONS.POLICY_UPDATE,
    PERMISSIONS.LEAD_READ, PERMISSIONS.LEAD_UPDATE,
    PERMISSIONS.MESSAGE_READ, PERMISSIONS.MESSAGE_UPDATE
  ],
  SALES: [
    PERMISSIONS.CLIENT_READ, PERMISSIONS.CLIENT_CREATE, PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.POLICY_READ, PERMISSIONS.POLICY_CREATE,
    PERMISSIONS.LEAD_READ, PERMISSIONS.LEAD_UPDATE
  ],
  ACCOUNTING: [
    PERMISSIONS.FINANCE_READ, PERMISSIONS.FINANCE_CREATE, PERMISSIONS.FINANCE_UPDATE,
    PERMISSIONS.CLIENT_READ, PERMISSIONS.POLICY_READ
  ],
  STAFF: [
    PERMISSIONS.CLIENT_READ, PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.LEAD_READ, PERMISSIONS.LEAD_UPDATE
  ],
  VIEWER: [
    PERMISSIONS.CLIENT_READ, PERMISSIONS.POLICY_READ, PERMISSIONS.LEAD_READ, PERMISSIONS.FINANCE_READ
  ]
};

/**
 * Checks if the user's role has the required permission
 */
const hasPermission = (role, permission) => {
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
};

/**
 * Express middleware to enforce permissions
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    // Platform Role (SUPERADMIN) bypasses tenant permissions
    if (req.context.isSuperAdmin) {
      return next();
    }
    
    const role = req.context.membershipRole;
    if (!role || !hasPermission(role, permission)) {
      return next(new AppError('FORBIDDEN', `Bu işlem için yetkiniz bulunmamaktadır (${permission}).`, 403));
    }
    
    next();
  };
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  requirePermission
};
