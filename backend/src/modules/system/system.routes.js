const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role-guard');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const systemController = require('./system.controller');
const schemas = require('./system.schema');
const { paginationSchema } = require('../../utils/pagination');

const router = express.Router();

router.use(authenticateUser, requireTenant, requireRole(['SUPERADMIN']));

router.post('/', validate(schemas.createCompanySchema), asyncHandler(systemController.createCompany));
router.get('/', validate({ query: paginationSchema }), asyncHandler(systemController.listCompanies));
router.get('/:id/details', validate(schemas.getCompanyDetailsSchema), asyncHandler(systemController.getCompanyDetails));

module.exports = router;
