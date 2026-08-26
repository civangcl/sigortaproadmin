const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant-context');
const policiesController = require('./policies.controller');

// All routes require auth and tenant context
router.use(authenticateUser);
router.use(requireTenant);

router.get('/', policiesController.listPolicies);
router.post('/', policiesController.createPolicy);
router.patch('/:id', policiesController.updatePolicy);
router.delete('/:id', policiesController.deletePolicy);

module.exports = router;
