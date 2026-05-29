const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Log the error
  logger.error(`${req.method} ${req.url} - Status: ${error.statusCode} - Error: ${error.message}`);
  if (error.stack && process.env.NODE_ENV !== 'production') {
    console.error(error.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {})
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;
