const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, requireRole } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// ------------------------------------------------------------------
// SUPER ADMIN: SYSTEM MANAGEMENT
// ------------------------------------------------------------------
router.post('/system/companies', authenticateUser, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const { name, domain, ownerName, email, adminUserId } = req.body;
    
    // Create the new Company
    const company = await prisma.company.create({
      data: {
        name,
        domain,
        ownerName,
        email,
      }
    });

    // Create the first ADMIN user for this company
    const user = await prisma.user.create({
      data: {
        id: adminUserId, // Matches Supabase Auth user ID
        email,
        fullName: ownerName,
        role: 'ADMIN',
        companyId: company.id
      }
    });

    res.json({ success: true, company, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/system/companies', authenticateUser, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ------------------------------------------------------------------
// NORMAL ROUTES (Require Authentication, scope to companyId)
// ------------------------------------------------------------------

// --- PUBLIC ROUTE (Used by Website Forms) ---
router.post('/leads', async (req, res) => {
  try {
    // Website sends COMPANY_ID in headers or body
    const companyId = req.headers['x-company-id'] || req.body.companyId;
    if (!companyId) return res.status(400).json({ success: false, error: 'Company ID required' });

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
        companyId: companyId,
      }
    });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// --- PROTECTED CRM ROUTES ---
router.use(authenticateUser);

router.get('/company', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/company', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id, name, ownerName, iban, bankName, address, phone, email, monthlyTarget } = req.body;
    if (id !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

    await prisma.company.update({
      where: { id: req.user.companyId },
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
    const leads = await prisma.lead.findMany({
      where: { companyId: req.user.companyId },
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

router.patch('/leads/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, premium, commission } = req.body;
    
    // Security check
    const existing = await prisma.lead.findUnique({ where: { id }});
    if (!existing || existing.companyId !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

    const lead = await prisma.lead.update({
      where: { id },
      data: { status, premium, commission },
    });

    if (status === 'onaylandi' && !lead.clientId) {
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
          companyId: req.user.companyId,
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
          companyId: req.user.companyId,
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
            companyId: req.user.companyId,
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
            companyId: req.user.companyId,
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
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id }});
    if (!existing || existing.companyId !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

    await prisma.lead.update({ where: { id: req.params.id }, data: { status: 'silindi' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CLIENTS ---
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { companyId: req.user.companyId },
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
    const client = await prisma.client.create({
      data: { ...req.body, companyId: req.user.companyId }
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/clients/:id', async (req, res) => {
  try {
    const existing = await prisma.client.findUnique({ where: { id: req.params.id }});
    if (!existing || existing.companyId !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

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
    const existing = await prisma.client.findUnique({ where: { id: req.params.id }});
    if (!existing || existing.companyId !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- FINANCIALS & POLICIES ---
router.get('/financials', async (req, res) => {
  try {
    const financials = await prisma.financial.findMany({
      where: { companyId: req.user.companyId },
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
    const { amount, description, date } = req.body;
    const expense = await prisma.financial.create({
      data: {
        kind: 'gider',
        amount: Number(amount),
        description,
        date: new Date(date),
        companyId: req.user.companyId,
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
    const messages = await prisma.message.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/messages/:id', async (req, res) => {
  try {
    const existing = await prisma.message.findUnique({ where: { id: req.params.id }});
    if (!existing || existing.companyId !== req.user.companyId) return res.status(403).json({ success: false, error: 'Forbidden' });

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
