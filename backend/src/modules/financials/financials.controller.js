const financialsService = require('./financials.service');

async function listFinancials(req, res) {
  const { page, limit } = req.validated.query;
  const result = await financialsService.listFinancials({ context: req.context, page, limit });
  res.json(result);
}

async function createExpense(req, res) {
  const expense = await financialsService.createExpense({ context: req.context, input: req.validated.body });
  res.json({ success: true, expense });
}

module.exports = {
  listFinancials,
  createExpense
};
