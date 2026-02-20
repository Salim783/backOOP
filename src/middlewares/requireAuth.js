const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token manquant ou invalide.' });
    }

    const payload = jwt.verify(token, jwtSecret);
    // payload = { sub: userId, mail, iat, exp }
    req.user = payload;

    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'Token invalide ou expire.' });
  }
};

module.exports = { requireAuth };