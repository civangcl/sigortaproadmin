const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role-guard');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const systemController = require('./system.controller');
const schemas = require('./system.schema');
const { paginationSchema } = require('../../utils/pagination');

const router = express.Router();

router.use(authenticateUser, requireRole(['SUPERADMIN']));

router.get('/dashboard', asyncHandler(systemController.getSystemDashboard));
router.post('/onboard', validate(schemas.createOnboardSchema), asyncHandler(systemController.onboardCompany));
router.get('/companies', validate({ query: paginationSchema }), asyncHandler(systemController.listCompanies));
router.get('/:id/details', validate(schemas.getCompanyDetailsSchema), asyncHandler(systemController.getCompanyDetails));
router.patch('/:id', validate(schemas.updateCompanySchema), asyncHandler(systemController.updateCompany));

module.exports = router;
