const policiesService = require('./policies.service');
const { createPolicySchema, updatePolicySchema } = require('./policies.schema');

async function listPolicies(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await policiesService.listPolicies({
      context: req.context,
      page,
      limit
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createPolicy(req, res, next) {
  try {
    const validatedData = createPolicySchema.parse(req.body);
    const policy = await policiesService.createPolicy({
      context: req.context,
      input: validatedData
    });
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}

async function updatePolicy(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = updatePolicySchema.parse(req.body);
    const policy = await policiesService.updatePolicy({
      context: req.context,
      id,
      input: validatedData
    });
    res.json(policy);
  } catch (error) {
    next(error);
  }
}

async function deletePolicy(req, res, next) {
  try {
    const { id } = req.params;
    await policiesService.deletePolicy({
      context: req.context,
      id
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy
};
