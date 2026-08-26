const financialsRepository = require('./financials.repository');

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listFinancials({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await financialsRepository.findManyForTenant(context, options);
  return formatPaginatedResponse(items, total, page, limit);
}

async function createExpense({ context, input }) {
  const { amount, description, date } = input;
  
  return financialsRepository.createForTenant(context.effectiveCompanyId, {
    kind: 'gider',
    amount,
    description,
    date: new Date(date)
  });
}

module.exports = {
  listFinancials,
  createExpense
};
