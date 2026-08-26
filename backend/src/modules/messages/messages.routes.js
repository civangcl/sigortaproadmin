const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const messagesController = require('./messages.controller');
const schemas = require('./messages.schema');
const { paginationSchema } = require('../../utils/pagination');

const router = express.Router();

router.use(authenticateUser, requireTenant);

router.get('/', validate({ query: paginationSchema }), asyncHandler(messagesController.listMessages));
router.patch('/:id', validate(schemas.updateMessageStatusSchema), asyncHandler(messagesController.updateMessageStatus));

module.exports = router;
