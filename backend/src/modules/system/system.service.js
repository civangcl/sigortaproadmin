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

async function listCompanies({ page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.company.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { branches: true, users: true, clients: true, leads: true, policies: true }
        }
      }
    }),
    prisma.company.count()
  ]);

  return { items, total, page, limit };
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

  return { company };
}

async function getSystemDashboard() {
  const [totalAgencies, totalBranches, totalUsers, totalClients, totalLeads, totalPolicies] = await Promise.all([
    prisma.company.count(),
    prisma.branch.count(),
    prisma.user.count(),
    prisma.client.count(),
    prisma.lead.count(),
    prisma.policy.count()
  ]);

  // Optionally fetch today's leads etc.
  const today = new Date();
  today.setHours(0,0,0,0);
  const leadsToday = await prisma.lead.count({
    where: { createdAt: { gte: today } }
  });

  return {
    totalAgencies,
    totalBranches,
    totalUsers,
    totalClients,
    totalLeads,
    totalPolicies,
    leadsToday
  };
}

module.exports = {
  onboardCompany,
  listCompanies,
  getCompanyDetails,
  getSystemDashboard
};
