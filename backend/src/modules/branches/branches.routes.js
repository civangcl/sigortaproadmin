const express = require('express');
const branchesController = require('./branches.controller');
const validateRequest = require('../../middleware/validate');
const schemas = require('./branches.schema');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const { requirePermission, PERMISSIONS } = require('../../auth/permissions');

const router = express.Router();

router.use(authenticateUser);
router.use(requireTenant);

router.get('/', requirePermission(PERMISSIONS.BRANCH_READ), branchesController.getBranches);
router.get('/:id', requirePermission(PERMISSIONS.BRANCH_READ), branchesController.getBranchById);

router.post(
  '/',
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validateRequest(schemas.createBranchSchema),
  branchesController.createBranch
);

router.patch(
  '/:id',
  requirePermission(PERMISSIONS.BRANCH_MANAGE),
  validateRequest(schemas.updateBranchSchema),
  branchesController.updateBranch
);

module.exports = router;
