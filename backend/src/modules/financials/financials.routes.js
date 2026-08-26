const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const { asyncHandler } = require('../../middleware/error-handler');
const validate = require('../../middleware/validate');
const financialsController = require('./financials.controller');
const { paginationSchema } = require('../../utils/pagination');

const router = express.Router();

router.use(authenticateUser, requireTenant);

router.get('/', validate({ query: paginationSchema }), asyncHandler(financialsController.listFinancials));

module.exports = router;
