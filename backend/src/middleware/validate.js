const AppError = require('../errors/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    req.validated = {
      body: {},
      query: {},
      params: {}
    };

    if (schema.body) {
      req.validated.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.validated.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.validated.params = schema.params.parse(req.params);
    }
    
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const issues = error.issues ?? error.errors ?? [];
      const details = issues.map(issue => ({
        field: issue.path?.join('.') || 'unknown',
        message: issue.message
      }));
      
      return next(new AppError('VALIDATION_ERROR', 'Gönderilen bilgiler geçersiz.', 400, details));
    }
    next(error);
  }
};

module.exports = validate;
