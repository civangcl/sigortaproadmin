const systemService = require('./system.service');
const AppError = require('../../errors/AppError');

async function createCompany(req, res) {
  const result = await systemService.createCompany({ context: req.context, input: req.validated.body });
  res.json({ success: true, ...result });
}

async function listCompanies(req, res) {
  const { page, limit } = req.validated.query;
  const companies = await systemService.listCompanies({ context: req.context, page, limit });
  res.json(companies);
}

async function getCompanyDetails(req, res) {
  const { id } = req.validated.params;
  const details = await systemService.getCompanyDetails({ context: req.context, id });
  
  if (!details.company) {
    throw new AppError('NOT_FOUND', 'Company not found', 404);
  }

  res.json({ success: true, ...details });
}

module.exports = {
  createCompany,
  listCompanies,
  getCompanyDetails
};
