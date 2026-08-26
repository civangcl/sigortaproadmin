const staffService = require('./staff.service');
const { getPaginationOptions, formatPaginatedResponse } = require('../../utils/pagination');

async function getStaffMembers(req, res, next) {
  try {
    const options = getPaginationOptions(req);
    const result = await staffService.getStaffMembers(req.context, options);
    
    res.json(
      formatPaginatedResponse(result.items, result.total, options.page, options.limit)
    );
  } catch (error) {
    next(error);
  }
}

async function getStaffById(req, res, next) {
  try {
    const staff = await staffService.getStaffById(req.context, req.params.id);
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function createStaff(req, res, next) {
  try {
    const staff = await staffService.createStaff(req.context, req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function updateStaff(req, res, next) {
  try {
    const staff = await staffService.updateStaff(req.context, req.params.id, req.body);
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStaffMembers,
  getStaffById,
  createStaff,
  updateStaff
};
