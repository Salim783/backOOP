const { doubleCsrf } = require('csrf-csrf');

const DUREE_CSRF_MINUTES =
  Number.parseInt(process.env.CSRF_TOKEN_TTL_MINUTES, 10) || 15;
const DUREE_CSRF_MS = DUREE_CSRF_MINUTES * 60 * 1000;
const CSRF_SECRET_PAR_DEFAUT = 'change_this_csrf_secret_for_production';

const cookieSecure = process.env.NODE_ENV === 'production';
const csrfSecret =
  process.env.CSRF_SECRET ||
  process.env.JWT_SECRET ||
  CSRF_SECRET_PAR_DEFAUT;

if (process.env.NODE_ENV === 'production' && csrfSecret === CSRF_SECRET_PAR_DEFAUT) {
  throw new Error('CSRF_SECRET doit etre defini en production.');
}

const extraireTokenCsrf = (req) => {
  const tokenHeader = req.headers['x-csrf-token'];
  if (typeof tokenHeader === 'string' && tokenHeader.trim()) {
    return tokenHeader.trim();
  }

  if (req.body && typeof req.body._csrf === 'string' && req.body._csrf.trim()) {
    return req.body._csrf.trim();
  }

  return undefined;
};

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) =>
    String(req.headers['user-agent'] || '') + String(req.ip || ''),
  cookieName: process.env.CSRF_COOKIE_NAME || 'csrf_token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: cookieSecure,
    path: '/',
    maxAge: DUREE_CSRF_MS,
  },
  getCsrfTokenFromRequest: extraireTokenCsrf,
});

const fournirTokenCsrf = (req, res, next) => {
  try {
    req.csrfTokenValue = generateCsrfToken(req, res);
    req.csrfExpireLe = new Date(Date.now() + DUREE_CSRF_MS).toISOString();
    return next();
  } catch (_error) {
    return res.status(500).json({
      message: 'Erreur pendant la generation du token CSRF.',
    });
  }
};

const verifierCsrf = (req, res, next) =>
  doubleCsrfProtection(req, res, (error) => {
    if (error) {
      return res.status(403).json({
        message: 'Token CSRF invalide ou manquant.',
      });
    }

    return next();
  });

module.exports = {
  fournirTokenCsrf,
  verifierCsrf,
};
