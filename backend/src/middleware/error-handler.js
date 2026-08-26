const AppError = require('../errors/AppError');

// Wrap async functions to catch errors and pass them to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  // If headers are already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. AppError (Our Custom Errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    });
  }

  // 2. Prisma Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Unique constraint failed
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Bu kayıt zaten mevcut.',
        code: 'CONFLICT'
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Kayıt bulunamadı.',
        code: 'NOT_FOUND'
      });
    }
    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: 'İlişkili kayıt bulunamadığı için işlem gerçekleştirilemiyor.',
        code: 'FOREIGN_KEY_CONSTRAINT_FAILED'
      });
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Veritabanı doğrulama hatası.',
      code: 'DB_VALIDATION_ERROR'
    });
  }

  // 3. Fallback for unhandled errors
  // Log the error internally
  console.error('[Unhandled Error]', err);

  // Return safe generic message to client
  res.status(500).json({
    success: false,
    error: 'Beklenmeyen bir sunucu hatası oluştu.',
    code: 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = {
  asyncHandler,
  errorHandler
};
