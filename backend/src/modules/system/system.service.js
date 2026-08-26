const prisma = require('../../lib/prisma');
const AppError = require('../../errors/AppError');

async function createCompany({ context, input }) {
  if (!context.isSuperAdmin) {
    throw new AppError('FORBIDDEN', 'Yalnızca SUPERADMIN şirket oluşturabilir.', 403);
  }

  const { name, domain, ownerName, email, adminUserId } = input;
  
  const company = await prisma.company.create({
    data: {
      name,
      domain: domain || null,
      ownerName,
      email,
    }
  });

  const user = await prisma.user.create({
    data: {
      id: adminUserId, 
      email,
      fullName: ownerName,
      role: 'ADMIN',
      companyId: company.id
    }
  });

  return { company, user };
}

const { getPaginationArgs, formatPaginatedResponse } = require('../../utils/pagination');

async function listCompanies({ context, page, limit }) {
  if (!context.isSuperAdmin) {
    throw new AppError('FORBIDDEN', 'Yalnızca SUPERADMIN şirketleri görebilir.', 403);
  }

  const options = getPaginationArgs(page, limit);

  const [items, total] = await Promise.all([
    prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take,
      include: {
        _count: {
          select: { clients: true, leads: true, policies: true }
        }
      }
    }),
    prisma.company.count()
  ]);

  // Handle revenue calculation with grouping to avoid N+1 inside JS loop
  // First, extract company IDs
  const companyIds = items.map(c => c.id);
  
  let revenues = [];
  if (companyIds.length > 0) {
    revenues = await prisma.financial.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: companyIds },
        kind: 'tahsilat'
      },
      _sum: {
        amount: true
      }
    });
  }

  const revenueMap = revenues.reduce((acc, curr) => {
    acc[curr.companyId] = curr._sum.amount || 0;
    return acc;
  }, {});

  const formattedItems = items.map(c => ({
    ...c,
    totalRevenue: revenueMap[c.id] || 0
  }));

  return formatPaginatedResponse(formattedItems, total, page, limit);
}

async function getCompanyDetails({ context, id }) {
  if (!context.isSuperAdmin) {
    throw new AppError('FORBIDDEN', 'Yalnızca SUPERADMIN şirket detaylarını görebilir.', 403);
  }

  const [company, clients, leads, financials] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clients: true, leads: true, policies: true }
        }
      }
    }),
    prisma.client.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.lead.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.financial.findMany({
      where: { companyId: id },
      orderBy: { date: 'desc' },
      take: 10
    })
  ]);

  return { company, recent: { clients, leads, financials } };
}

module.exports = {
  createCompany,
  listCompanies,
  getCompanyDetails
};
