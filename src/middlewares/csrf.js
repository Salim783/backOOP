// src/middlewares/csrf.js
const crypto = require('crypto');

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Tạo token ngẫu nhiên
const generateToken = () => crypto.randomBytes(32).toString('hex');

// GET /api/csrf
// - Set cookie csrf_token
// - Return { csrfToken }
const issueCsrfToken = (req, res) => {
  const token = generateToken();

  // Dev localhost => http, nên secure=false.
  // Nếu deploy https => secure=true.
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,       // phải đọc được từ JS để gửi header
    sameSite: 'lax',       // chống CSRF cơ bản
    secure: false,         // true nếu https
    path: '/',             // toàn site
  });

  return res.status(200).json({ csrfToken: token });
};

// Middleware dùng cho POST/PUT/DELETE
const requireCsrf = (req, res, next) => {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers?.[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      message: 'CSRF token manquant.',
    });
  }

  if (cookieToken !== headerToken) {
    return res.status(403).json({
      message: 'CSRF token invalide.',
    });
  }

  return next();
};

module.exports = { issueCsrfToken, requireCsrf };