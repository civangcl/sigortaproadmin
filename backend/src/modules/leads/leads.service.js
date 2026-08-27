const leadsRepository = require('./leads.repository');
const clientsRepository = require('../clients/clients.repository');
const globalPrisma = require('../../lib/prisma');
const AppError = require('../../errors/AppError');
const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function createLead(companyId, data) {
  // Enum/Value mapping
  const inputType = (data.insuranceType || '').toLowerCase();
  const insuranceType = inputType === 'dask' || inputType === 'konut' ? 'dask' : 'arac';
  
  const leadData = {
    insuranceType,
    fullName: data.fullName,
    tcKimlikNo: data.tcIdentity,
    phoneNumber: data.phone,
    email: data.email,
    dateOfBirth: data.dateOfBirth,
    city: data.city,
    address: data.address,
    licensePlate: data.licensePlate,
    belgeNo: data.documentNo,
    status: 'yeni'
  };

  return leadsRepository.createForTenant(companyId, leadData);
}

async function listLeads({ context, page, limit }) {
  const options = getPaginationArgs(page, limit);
  const { items, total } = await leadsRepository.findManyForTenant(context, options);
  
  const formattedItems = items.map(lead => ({
    id: lead.id,
    date: lead.createdAt.toISOString(),
    insuranceType: lead.insuranceType,
    name: lead.fullName,
    tc: lead.tcKimlikNo || '',
    birthDate: lead.dateOfBirth || '',
    phone: lead.phoneNumber,
    email: lead.email || undefined,
    city: lead.city || undefined,
    address: lead.address || undefined,
    status: lead.status,
    note: lead.company ? `${lead.company.name} şirketine gelen talep` : '',
    plate: lead.licensePlate || undefined,
    registrationNo: lead.belgeNo || undefined,
    brand: lead.brand || undefined,
    model: lead.model || undefined,
    year: lead.year || undefined,
    engineNo: lead.engineNo || undefined,
    chassisNo: lead.chassisNo || undefined,
    premium: lead.premium ? parseFloat(lead.premium.toString()) : undefined,
    commission: lead.commission ? parseFloat(lead.commission.toString()) : undefined,
  }));
  
  return formatPaginatedResponse(formattedItems, total, page, limit);
}

async function updateLeadStatus({ context, id, input }) {
  const { status, premium, commission } = input;
  const companyId = context.effectiveCompanyId;
  
  // Start an atomic transaction
  return globalPrisma.$transaction(async (tx) => {
    // 1. Fetch lead safely within transaction
    const existing = await leadsRepository.findUniqueForTenant(context, id, tx);
    
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Talep bulunamadı.', 404);
    }
    
    // 2. Idempotency Check (Race Condition / Double Conversion prevention)
    if (status === 'onaylandi' && (existing.status === 'onaylandi' || existing.clientId)) {
      throw new AppError('CONFLICT', 'Bu talep zaten onaylanmış ve dönüştürülmüştür.', 409);
    }

    // 3. Update the lead
    const lead = await leadsRepository.updateForTenant(companyId, id, { status, premium, commission }, tx);

    // 4. Handle side effects of approval atomically
    if (status === 'onaylandi') {
      const p = premium !== undefined ? premium : (lead.premium ? parseFloat(lead.premium.toString()) : 0);
      const c = commission !== undefined ? commission : (lead.commission ? parseFloat(lead.commission.toString()) : 0);
      
      // Create Client using the repository with the transaction
      const client = await clientsRepository.createForTenant(companyId, {
        name: lead.fullName,
        tc: lead.tcKimlikNo,
        phone: lead.phoneNumber,
        email: lead.email,
        city: lead.city,
        address: lead.address,
        plate: lead.licensePlate,
        brand: lead.brand,
        model: lead.model,
        year: lead.year,
        engineNo: lead.engineNo,
        chassisNo: lead.chassisNo,
      }, tx);
      
      // Update Lead with Client ID
      await leadsRepository.updateForTenant(companyId, id, { clientId: client.id }, tx);
      
      const policyType = lead.insuranceType === 'arac' ? 'Trafik' : 'DASK';
      
      // Create Policy within transaction
      await tx.policy.create({
        data: {
          type: policyType,
          companyName: 'Bilinmiyor',
          policyNo: '—',
          premium: p,
          commission: c,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          clientId: client.id,
          companyId: companyId, // strict tenant boundary
        }
      });
      
      // Create Financials within transaction
      if (p > 0) {
        await tx.financial.create({
          data: {
            kind: 'tahsilat',
            amount: p,
            description: `${policyType} Satışı`,
            date: new Date(),
            clientId: client.id,
            companyId: companyId, // strict tenant boundary
          }
        });
      }
      
      if (c > 0) {
        await tx.financial.create({
          data: {
            kind: 'komisyon',
            amount: c,
            description: `${policyType} Komisyonu`,
            date: new Date(),
            clientId: client.id,
            companyId: companyId, // strict tenant boundary
          }
        });
      }
    }
    
    return lead;
  });
}

async function deleteLead({ context, id }) {
  const existing = await leadsRepository.findUniqueForTenant(context, id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Talep bulunamadı.', 404);
  }

  return leadsRepository.updateForTenant(context.effectiveCompanyId, id, { status: 'silindi' });
}

module.exports = {
  createLead,
  listLeads,
  updateLeadStatus,
  deleteLead
};
