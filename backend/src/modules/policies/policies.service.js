const policiesRepository = require('./policies.repository');
const clientsRepository = require('../clients/clients.repository');
const AppError = require('../../errors/AppError');

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listPolicies({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await policiesRepository.findManyForTenant(context, options);
  return formatPaginatedResponse(items, total, page, limit);
}

async function createPolicy({ context, input }) {
  // Ensure the client belongs to the tenant
  const client = await clientsRepository.findUniqueForTenant(context, input.clientId);
  if (!client) {
    throw new AppError('NOT_FOUND', 'İlişkili müşteri bulunamadı.', 404);
  }

  return policiesRepository.createForTenant(context.effectiveCompanyId, input);
}

async function updatePolicy({ context, id, input }) {
  const existing = await policiesRepository.findUniqueForTenant(context, id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Poliçe bulunamadı.', 404);
  }

  // If changing client, ensure new client belongs to tenant
  if (input.clientId && input.clientId !== existing.clientId) {
    const client = await clientsRepository.findUniqueForTenant(context, input.clientId);
    if (!client) {
      throw new AppError('NOT_FOUND', 'İlişkili müşteri bulunamadı.', 404);
    }
  }

  return policiesRepository.updateForTenant(context.effectiveCompanyId, id, input);
}

async function deletePolicy({ context, id }) {
  const existing = await policiesRepository.findUniqueForTenant(context, id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Poliçe bulunamadı.', 404);
  }

  return policiesRepository.deleteForTenant(context.effectiveCompanyId, id);
}

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy
};
