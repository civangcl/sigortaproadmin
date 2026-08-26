const systemService = require('./system.service');
const AppError = require('../../errors/AppError');

async function onboardCompany(req, res, next) {
  try {
    const result = await systemService.onboardCompany({ context: req.context, input: req.validated.body });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const companies = await systemService.listCompanies({ context: req.context, page, limit });
    res.json(companies);
  } catch (error) {
    next(error);
  }
}

async function getCompanyDetails(req, res, next) {
  try {
    const { id } = req.validated.params;
    const details = await systemService.getCompanyDetails({ context: req.context, id });
    
    if (!details.company) {
      throw new AppError('NOT_FOUND', 'Firma bulunamadı', 404);
    }

    res.json({ success: true, ...details });
  } catch (error) {
    next(error);
  }
}

async function getSystemDashboard(req, res, next) {
  try {
    const dashboard = await systemService.getSystemDashboard();
    res.json({ success: true, dashboard });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  onboardCompany,
  listCompanies,
  getCompanyDetails,
  getSystemDashboard
};
