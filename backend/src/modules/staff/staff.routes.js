const express = require('express');
const staffController = require('./staff.controller');
const validateRequest = require('../../middleware/validate');
const schemas = require('./staff.schema');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const { requirePermission, PERMISSIONS } = require('../../auth/permissions');

const router = express.Router();

router.use(authenticateUser);
router.use(requireTenant);

router.get('/', requirePermission(PERMISSIONS.STAFF_READ), staffController.getStaffMembers);
router.get('/:id', requirePermission(PERMISSIONS.STAFF_READ), staffController.getStaffById);

router.post(
  '/',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest(schemas.createStaffSchema),
  staffController.createStaff
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.STAFF_MANAGE),
  validateRequest(schemas.updateStaffSchema),
  staffController.updateStaff
);

module.exports = router;
