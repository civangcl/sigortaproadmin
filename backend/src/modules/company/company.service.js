const companyRepository = require('./company.repository');
const AppError = require('../../errors/AppError');

async function getCompany({ context }) {
  const company = await companyRepository.findUniqueForTenant(context.effectiveCompanyId);
  if (!company) {
    throw new AppError('NOT_FOUND', 'Şirket bulunamadı.', 404);
  }
  return company;
}

async function updateCompany({ context, input }) {
  // input.id was validated by Zod
  const { id, ...updateData } = input;
  
  if (id !== context.effectiveCompanyId) {
    throw new AppError('FORBIDDEN', 'Başka bir şirketin bilgilerini güncelleyemezsiniz.', 403);
  }

  return companyRepository.updateForTenant(context.effectiveCompanyId, updateData);
}

module.exports = {
  getCompany,
  updateCompany
};
