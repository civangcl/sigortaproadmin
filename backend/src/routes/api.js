const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Helper to get company
async function getCompanyProfile() {
  let company = await prisma.company.findFirst({
    where: { name: 'Ece Sigorta' },
  });
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Ece Sigorta', domain: 'ecesigorta.com', theme: 'red' },
    });
  }
  return company;
}

// --- ADMIN / COMPANY ---
router.get('/company', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    res.json(company);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/company', async (req, res) => {
  try {
    const { id, name, ownerName, iban, bankName, address, phone, email, monthlyTarget } = req.body;
    await prisma.company.update({
      where: { id },
      data: { name, ownerName, iban, bankName, address, phone, email, monthlyTarget },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Profil güncellenemedi.' });
  }
});

// --- LEADS ---
router.get('/leads', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const leads = await prisma.lead.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: { company: true }
    });
    
    const mapped = leads.map(lead => ({
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
      premium: lead.premium || undefined,
      commission: lead.commission || undefined,
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const data = req.body;
    const lead = await prisma.lead.create({
      data: {
        insuranceType: data.policyType.toLowerCase() === 'dask' || data.policyType.toLowerCase() === 'konut' ? 'dask' : 'arac',
        fullName: data.name,
        tcKimlikNo: data.tc,
        phoneNumber: data.phone,
        email: data.email,
        city: data.city,
        licensePlate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        premium: data.premium,
        commission: data.commission,
        status: data.status || 'yeni',
        companyId: company.id,
      }
    });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, premium, commission } = req.body;
    
    const lead = await prisma.lead.update({
      where: { id },
      data: { status, premium, commission },
    });

    if (status === 'onaylandi' && !lead.clientId) {
      const companyId = lead.companyId;
      const p = premium || lead.premium || 0;
      const c = commission || lead.commission || 0;
      
      const client = await prisma.client.create({
        data: {
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
          companyId,
        }
      });
      
      await prisma.lead.update({ where: { id }, data: { clientId: client.id } });
      
      const policyType = lead.insuranceType === 'arac' ? 'Trafik' : 'DASK';
      
      await prisma.policy.create({
        data: {
          type: policyType,
          companyName: 'Bilinmiyor',
          policyNo: '—',
          premium: p,
          commission: c,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          clientId: client.id,
          companyId,
        }
      });
      
      if (p > 0) {
        await prisma.financial.create({
          data: {
            kind: 'tahsilat',
            amount: p,
            description: `${policyType} Satışı`,
            date: new Date(),
            clientId: client.id,
            companyId,
          }
        });
      }
      
      if (c > 0) {
        await prisma.financial.create({
          data: {
            kind: 'komisyon',
            amount: c,
            description: `${policyType} Komisyonu`,
            date: new Date(),
            clientId: client.id,
            companyId,
          }
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    await prisma.lead.update({ where: { id: req.params.id }, data: { status: 'silindi' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CLIENTS ---
router.get('/clients', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const clients = await prisma.client.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: { policies: true, financials: true, leads: true }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const client = await prisma.client.create({
      data: { ...req.body, companyId: company.id }
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/clients/:id', async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- FINANCIALS & POLICIES ---
router.get('/financials', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const financials = await prisma.financial.findMany({
      where: { companyId: company.id },
      orderBy: { date: 'desc' },
      include: { client: true }
    });
    res.json(financials);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const { amount, description, date } = req.body;
    const expense = await prisma.financial.create({
      data: {
        kind: 'gider',
        amount: Number(amount),
        description,
        date: new Date(date),
        companyId: company.id,
      }
    });
    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- MESSAGES ---
router.get('/messages', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const messages = await prisma.message.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const company = await getCompanyProfile();
    const message = await prisma.message.create({
      data: { ...req.body, companyId: company.id }
    });
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/messages/:id', async (req, res) => {
  try {
    await prisma.message.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
