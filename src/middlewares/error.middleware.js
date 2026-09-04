const { errorResponse } = require('../utils/response.util');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    return errorResponse(res, statusCode, message, {
      stack: err.stack
    });
  }

  return errorResponse(res, statusCode, message);
}

module.exports = errorHandler;
