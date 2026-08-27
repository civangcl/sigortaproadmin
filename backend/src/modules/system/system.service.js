const prisma = require('../../lib/prisma');
const supabaseAdmin = require('../../lib/supabase-admin');
const AppError = require('../../errors/AppError');
const crypto = require('crypto');

/**
 * Onboard a new company (tenant) securely.
 */
async function onboardCompany({ context, input }) {
  const { company, owner, branch, website, subscription } = input;

  // 1. Generate customerNo if not provided
  let customerNo = company.customerNo;
  if (!customerNo) {
    const count = await prisma.company.count();
    customerNo = `SP-${String(count + 1).padStart(6, '0')}`;
  }

  // 2. Conflict checks
  const existingCompany = await prisma.company.findFirst({
    where: { OR: [{ name: company.name }, { customerNo }] }
  });
  if (existingCompany) {
    throw new AppError('CONFLICT', 'Şirket adı veya Müşteri No zaten mevcut.', 409);
  }

  // Generate secure temporary password
  const tempPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) + 'Aa1!';

  // 3. Supabase Auth Create User
  let authUser;
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: owner.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        fullName: owner.fullName,
        role: 'OWNER'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new AppError('CONFLICT', 'Bu email ile zaten bir kullanıcı mevcut.', 409);
      }
      throw new Error(`Supabase Auth Error: ${authError.message}`);
    }
    authUser = authData.user;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('INTERNAL', 'Kullanıcı hesabı oluşturulamadı: ' + err.message, 500);
  }

  // 4. Prisma Transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create Company
      const newCompany = await tx.company.create({
        data: {
          name: company.name,
          customerNo: customerNo,
          domain: company.domain || null,
          phone: company.phone || null,
          email: company.email || null,
          address: company.address || null,
          ownerName: owner.fullName
        }
      });

      // Create Default Branch
      const newBranch = await tx.branch.create({
        data: {
          companyId: newCompany.id,
          name: branch.name,
          isDefault: true,
          isActive: true
        }
      });

      // Create Prisma User
      const newUser = await tx.user.create({
        data: {
          id: authUser.id, // mapped to auth.id
          email: owner.email,
          fullName: owner.fullName,
          role: 'ADMIN', // legacy mapping, though membership resolves this
          companyId: null // Since SUPERADMIN made companyId optional! Wait, no! For OWNER it should be newCompany.id due to legacy!
        }
      });

      // We should set companyId on User for backward compatibility if possible
      await tx.user.update({
        where: { id: newUser.id },
        data: { companyId: newCompany.id }
      });

      // Create Membership
      const newMembership = await tx.companyMembership.create({
        data: {
          userId: newUser.id,
          companyId: newCompany.id,
          role: 'OWNER',
          status: 'ACTIVE',
          allBranches: true
        }
      });

      // Create Website Integration if requested
      if (website && website.domain) {
        await tx.websiteIntegration.create({
          data: {
            companyId: newCompany.id,
            domain: website.domain,
            defaultBranchId: newBranch.id,
            status: website.active ? 'ACTIVE' : 'SUSPENDED'
          }
        });
      }

      return {
        company: newCompany,
        user: newUser,
        tempPassword // Return it exactly ONCE
      };
    });

    return result;
  } catch (error) {
    // COMPENSATING ACTION
    console.error('Prisma Transaction failed, rolling back Supabase Auth User...', error);
    await supabaseAdmin.auth.admin.deleteUser(authUser.id).catch(delErr => {
      console.error('CRITICAL: Failed to rollback Supabase user after Prisma failure!', delErr);
    });
    
    throw new AppError('INTERNAL', 'Firma oluşturulamadı. İşlem geri alındı.', 500);
  }
}

async function listCompanies({ page = 1, limit = 50, search = '' }) {
  const skip = (page - 1) * limit;
  
  const where = {
    isSystem: false,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { customerNo: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: {
          where: { role: 'OWNER', status: 'ACTIVE' },
          include: { user: true },
          take: 1
        },
        _count: {
          select: { branches: true, users: true, clients: true, leads: true, policies: true }
        }
      }
    }),
    prisma.company.count({ where })
  ]);

  // Restructure items to have owner at top level
  const formattedItems = items.map(company => {
    const { memberships, _count, ...rest } = company;
    const ownerMembership = memberships[0];
    return {
      ...rest,
      counts: _count,
      owner: ownerMembership ? {
        id: ownerMembership.user.id,
        email: ownerMembership.user.email,
        name: ownerMembership.user.fullName
      } : null
    };
  });

  return { items: formattedItems, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
}

async function getCompanyDetails({ id }) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      branches: true,
      websiteIntegrations: true,
      users: true,
      memberships: {
        include: { user: true }
      },
      _count: {
        select: { branches: true, users: true, clients: true, leads: true, policies: true }
      }
    }
  });

  if (!company || company.isSystem) {
    return { company: null };
  }

  // Get recent 5 leads and policies for activity summary
  const [recentLeads, recentPolicies] = await Promise.all([
    prisma.lead.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, insuranceType: true, status: true, createdAt: true }
    }),
    prisma.policy.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, type: true, companyName: true, createdAt: true }
    })
  ]);

  return { company, recentLeads, recentPolicies };
}

async function updateCompany({ id, data }) {
  const company = await prisma.company.findUnique({ where: { id } });
  
  if (!company) throw new AppError('NOT_FOUND', 'Firma bulunamadı', 404);
  if (company.isSystem) throw new AppError('FORBIDDEN', 'Sistem firması güncellenemez', 403);

  const updatedCompany = await prisma.company.update({
    where: { id },
    data
  });

  return { company: updatedCompany };
}

async function getSystemDashboard() {
  const [
    totalCompanies,
    totalUsers,
    totalClients,
    totalLeads,
    totalPolicies,
    newLeads,
    recentCompanies,
    last7DaysLeads
  ] = await Promise.all([
    prisma.company.count({ where: { isSystem: false } }),
    prisma.user.count(),
    prisma.client.count(),
    prisma.lead.count(),
    prisma.policy.count(),
    prisma.lead.count({ where: { status: 'yeni' } }),
    prisma.company.findMany({
      where: { isSystem: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, domain: true, customerNo: true, createdAt: true }
    }),
    prisma.lead.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      select: { createdAt: true }
    })
  ]);

  // We consider all companies active for now as there's no explicit 'status' column in Company
  const activeCompanies = totalCompanies; 

  // Process leadTrend for last 7 days
  const trendMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendMap[dateStr] = 0;
  }
  
  last7DaysLeads.forEach(lead => {
    const dateStr = lead.createdAt.toISOString().split('T')[0];
    if (trendMap[dateStr] !== undefined) {
      trendMap[dateStr]++;
    }
  });

  const leadTrend = Object.keys(trendMap).map(date => ({
    date,
    count: trendMap[date]
  }));

  return {
    companies: { total: totalCompanies, active: activeCompanies },
    users: { total: totalUsers },
    clients: { total: totalClients },
    leads: { total: totalLeads, new: newLeads },
    policies: { total: totalPolicies },
    leadTrend,
    recentCompanies
  };
}

module.exports = {
  onboardCompany,
  listCompanies,
  getCompanyDetails,
  getSystemDashboard
};
