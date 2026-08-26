const companyService = require('./company.service');

async function getCompany(req, res) {
  const company = await companyService.getCompany({ context: req.context });
  res.json(company);
}

async function updateCompany(req, res) {
  await companyService.updateCompany({ context: req.context, input: req.validated.body });
  res.json({ success: true });
}

module.exports = {
  getCompany,
  updateCompany
};
