const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const leadsController = require('./leads.controller');
const schemas = require('./leads.schema');

const router = express.Router();

const { paginationSchema } = require('../../utils/pagination');

// --- PUBLIC ROUTE (Used by Website Forms) ---
router.post('/', validate(schemas.createPublicLeadSchema), asyncHandler(leadsController.createLead));

// --- PROTECTED CRM ROUTES ---
router.use(authenticateUser, requireTenant);

router.get('/', validate({ query: paginationSchema }), asyncHandler(leadsController.listLeads));
router.patch('/:id/status', validate(schemas.updateLeadStatusSchema), asyncHandler(leadsController.updateLeadStatus));
router.delete('/:id', validate(schemas.deleteLeadSchema), asyncHandler(leadsController.deleteLead));

module.exports = router;
