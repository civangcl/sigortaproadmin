const leadsService = require('./leads.service');
const AppError = require('../../errors/AppError');

async function createLead(req, res) {
  // Use secure header for company resolution
  const companyId = req.headers['x-company-id'];
  
  if (!companyId) {
    throw new AppError('VALIDATION_ERROR', 'Şirket kimliği (Company ID) eksik', 400);
  }

  const lead = await leadsService.createLead(companyId, req.validated.body);
  res.status(201).json({ success: true, lead });
}

async function listLeads(req, res) {
  const { page, limit } = req.validated.query;
  const result = await leadsService.listLeads({ context: req.context, page, limit });
  res.json(result);
}

async function updateLeadStatus(req, res) {
  const { id } = req.validated.params;
  await leadsService.updateLeadStatus({ context: req.context, id, input: req.validated.body });
  res.json({ success: true });
}

async function deleteLead(req, res) {
  const { id } = req.validated.params;
  await leadsService.deleteLead({ context: req.context, id });
  res.json({ success: true });
}

module.exports = {
  createLead,
  listLeads,
  updateLeadStatus,
  deleteLead
};
