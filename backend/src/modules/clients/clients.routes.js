const express = require('express');
const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const validate = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/error-handler');
const clientsController = require('./clients.controller');
const schemas = require('./clients.schema');
const { paginationSchema } = require('../../utils/pagination');

const router = express.Router();

router.use(authenticateUser, requireTenant);

router.get('/', validate({ query: paginationSchema }), asyncHandler(clientsController.listClients));
router.post('/', validate(schemas.createClientSchema), asyncHandler(clientsController.createClient));
router.patch('/:id', validate(schemas.updateClientSchema), asyncHandler(clientsController.updateClient));
router.delete('/:id', validate(schemas.deleteClientSchema), asyncHandler(clientsController.deleteClient));

module.exports = router;
