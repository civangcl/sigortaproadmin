const clientsRepository = require('./clients.repository');
const AppError = require('../../errors/AppError');

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listClients({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await clientsRepository.findManyForTenant(context, options);
  return formatPaginatedResponse(items, total, page, limit);
}

async function createClient({ context, input }) {
  return clientsRepository.createForTenant(context.effectiveCompanyId, input);
}

async function updateClient({ context, id, input }) {
  const existing = await clientsRepository.findUniqueForTenant(context, id);
  
  if (!existing) {
    // We return 404 both if it doesn't exist, OR if it belongs to another tenant.
    throw new AppError('NOT_FOUND', 'Müşteri bulunamadı.', 404);
  }

  return clientsRepository.updateForTenant(context.effectiveCompanyId, id, input);
}

async function deleteClient({ context, id }) {
  const existing = await clientsRepository.findUniqueForTenant(context, id);
  
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Müşteri bulunamadı.', 404);
  }

  return clientsRepository.deleteForTenant(context.effectiveCompanyId, id);
}

module.exports = {
  listClients,
  createClient,
  updateClient,
  deleteClient
};
