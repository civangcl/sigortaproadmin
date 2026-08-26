const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const invoicesController = require('./invoices.controller');

// All routes require auth and tenant context
router.use(authenticateUser);
router.use(requireTenant);

router.get('/', invoicesController.listInvoices);
router.post('/', invoicesController.createInvoice);
router.delete('/:id', invoicesController.deleteInvoice);

module.exports = router;
