function successResponse(res, statusCode = 200, message = 'Success', data = null) {
  const response = {
    status: 'success',
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

function errorResponse(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
  const response = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  successResponse,
  errorResponse
};
