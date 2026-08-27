const express = require('express');

const systemRoutes = require('../modules/system/system.routes');
const companyRoutes = require('../modules/company/company.routes');
const clientsRoutes = require('../modules/clients/clients.routes');
const leadsRoutes = require('../modules/leads/leads.routes');
const financialsRoutes = require('../modules/financials/financials.routes');
const expensesRoutes = require('../modules/financials/expenses.routes');
const messagesRoutes = require('../modules/messages/messages.routes');
const branchesRoutes = require('../modules/branches/branches.routes');
const staffRoutes = require('../modules/staff/staff.routes');
const policiesRoutes = require('../modules/policies/policies.routes');
const invoicesRoutes = require('../modules/invoices/invoices.routes');

const router = express.Router();

// Mount modules
const publicRoutes = require('../modules/public/public.routes');

const pushRoutes = require('../modules/push/push.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');

router.get('/status', (req, res) => res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' }));
router.use('/public', publicRoutes);
router.use('/push', pushRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/system', systemRoutes);
router.use('/company', companyRoutes);
router.use('/clients', clientsRoutes);
router.use('/leads', leadsRoutes);
router.use('/financials', financialsRoutes);
router.use('/expenses', expensesRoutes);
router.use('/messages', messagesRoutes);
router.use('/branches', branchesRoutes);
router.use('/staff', staffRoutes);
router.use('/policies', policiesRoutes);
router.use('/invoices', invoicesRoutes);

module.exports = router;
