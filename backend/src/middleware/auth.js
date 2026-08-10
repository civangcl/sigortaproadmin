const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // JWT signature is valid. Now look up the actual user in Prisma to get their role and companyId.
    const userId = decoded.sub;
    
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!dbUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found in database' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      companyId: dbUser.companyId
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

module.exports = { authenticateUser, requireRole };
