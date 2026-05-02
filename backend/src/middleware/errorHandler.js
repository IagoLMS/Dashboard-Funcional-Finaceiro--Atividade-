export function errorHandler(err, _req, res, _next) {
  console.error('[errorHandler]', err.message || err);
  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Internal server error';
  res.status(status).json({ error: message });
}
