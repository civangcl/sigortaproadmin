const supabase = require('../lib/supabase');
const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Oturum tokeni bulunamadı.', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('UNAUTHORIZED', 'Geçersiz oturum tokeni.', 401);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      throw new AppError('UNAUTHORIZED', 'Kullanıcı veritabanında bulunamadı.', 401);
    }

    req.user = dbUser;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticateUser };
