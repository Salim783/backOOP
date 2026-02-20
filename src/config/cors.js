const allowedOrigin = 'http://localhost:3000';
// change 3000 when hv front

const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-CSRF-Token',
];

module.exports = {
  allowedOrigin,
  allowedMethods,
  allowedHeaders,
};