const branchesService = require('./branches.service');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/pagination');

async function getBranches(req, res, next) {
  try {
    const options = getPaginationOptions(req);
    const result = await branchesService.getBranches(req.context, options);
    
    res.json(
      formatPaginatedResponse(result.items, result.total, options.page, options.limit)
    );
  } catch (error) {
    next(error);
  }
}

async function getBranchById(req, res, next) {
  try {
    const branch = await branchesService.getBranchById(req.context, req.params.id);
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

async function createBranch(req, res, next) {
  try {
    const branch = await branchesService.createBranch(req.context, req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

async function updateBranch(req, res, next) {
  try {
    const branch = await branchesService.updateBranch(req.context, req.params.id, req.body);
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch
};
