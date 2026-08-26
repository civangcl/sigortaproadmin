const messagesRepository = require('./messages.repository');
const AppError = require('../../errors/AppError');

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listMessages({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await messagesRepository.findManyForTenant(context, options);
  return formatPaginatedResponse(items, total, page, limit);
}

async function updateMessageStatus({ context, id, input }) {
  const existing = await messagesRepository.findUniqueForTenant(context, id);
  
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Mesaj bulunamadı.', 404);
  }

  return messagesRepository.updateForTenant(context.effectiveCompanyId, id, { status: input.status });
}

module.exports = {
  listMessages,
  updateMessageStatus
};
