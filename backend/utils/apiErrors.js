const getApiErrorResponse = (error) => {
  if (error?.code === 11000) {
    return { status: 409, body: { error: 'Resource already exists' } };
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return { status: 422, body: { error: 'Invalid request data' } };
  }
  return { status: 500, body: { error: 'Internal server error' } };
};

module.exports = { getApiErrorResponse };
