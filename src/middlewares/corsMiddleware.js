const {
  allowedOrigin,
  allowedMethods,
  allowedHeaders,
} = require('../config/cors');

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Public exception (no restriction)
  if (req.path.startsWith('/stats/categories')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  }

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','));
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;