const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role-guard');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const companyController = require('./company.controller');
const schemas = require('./company.schema');

const router = express.Router();

router.use(authenticateUser, requireTenant);

router.get('/', asyncHandler(companyController.getCompany));
router.put('/', requireRole(['ADMIN']), validate(schemas.updateCompanySchema), asyncHandler(companyController.updateCompany));

module.exports = router;
