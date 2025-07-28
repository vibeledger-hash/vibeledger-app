const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR'
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    error = {
      message: 'Validation Error',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: messages
    };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error = {
      message: 'Resource already exists',
      status: 409,
      code: 'DUPLICATE_ERROR',
      field: err.errors[0]?.path
    };
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      message: 'Invalid reference',
      status: 400,
      code: 'INVALID_REFERENCE'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  }

  // Cast errors (invalid UUIDs, etc.)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      status: 400,
      code: 'INVALID_ID'
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests',
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal Server Error';
    delete error.details;
  }

  res.status(error.status).json({
    error: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(error.field && { field: error.field }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;
