const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const financialsController = require('./financials.controller');
const schemas = require('./financials.schema');

const router = express.Router();

router.use(authenticateUser, requireTenant);

router.post('/', validate(schemas.createExpenseSchema), asyncHandler(financialsController.createExpense));

module.exports = router;
