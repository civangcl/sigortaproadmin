const AppError = require('../errors/AppError');

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Oturum açmanız gerekiyor.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 'Bu işlem için yetkiniz yok.', 403));
    }
    
    next();
  };
};

module.exports = { requireRole };
