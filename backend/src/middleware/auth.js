const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkxuuztfgjtljjmdfdxn.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreHV1enRmZ2p0bGpqbWRmZHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE4OTYsImV4cCI6MjEwMTcwNzg5Nn0.ii6iqiS7o2cAOh_FnNQpb8rqJa8X8SIxEGSawu7AuWg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Supabase sunucularına sorarak token'ı doğruluyoruz (JWT Secret'a ihtiyaç kalmıyor!)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token from Supabase' });
    }

    const userId = user.id;
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
    return res.status(401).json({ success: false, error: 'Unauthorized: Internal auth error' });
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
