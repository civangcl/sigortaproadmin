const invoicesRepository = require('./invoices.repository');
const clientsRepository = require('../clients/clients.repository');
const AppError = require('../../errors/AppError');

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listInvoices({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await invoicesRepository.findManyForTenant(context, options);
  return formatPaginatedResponse(items, total, page, limit);
}

async function createInvoice({ context, input }) {
  // Ensure the client belongs to the tenant
  const client = await clientsRepository.findUniqueForTenant(context, input.clientId);
  if (!client) {
    throw new AppError('NOT_FOUND', 'İlişkili müşteri bulunamadı.', 404);
  }

  return invoicesRepository.createForTenant(context.effectiveCompanyId, input);
}

async function deleteInvoice({ context, id }) {
  const existing = await invoicesRepository.findUniqueForTenant(context, id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Fatura bulunamadı.', 404);
  }

  return invoicesRepository.deleteForTenant(context.effectiveCompanyId, id);
}

module.exports = {
  listInvoices,
  createInvoice,
  deleteInvoice
};
