const ORIGINES_AUTORISEES = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origine) => origine.trim())
  .filter(Boolean);

const METHODES_AUTORISEES = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const HEADERS_AUTORISES = 'Content-Type,Authorization';

const determinerOrigineAutorisee = (origineRequete) => {
  if (!origineRequete) {
    return null;
  }

  if (ORIGINES_AUTORISEES.length === 0) {
    return '*';
  }

  if (ORIGINES_AUTORISEES.includes(origineRequete)) {
    return origineRequete;
  }

  return null;
};

const corsMiddleware = (req, res, next) => {
  const origineAutorisee = determinerOrigineAutorisee(req.headers.origin);

  if (origineAutorisee) {
    res.setHeader('Access-Control-Allow-Origin', origineAutorisee);
    res.setHeader('Access-Control-Allow-Methods', METHODES_AUTORISEES);
    res.setHeader('Access-Control-Allow-Headers', HEADERS_AUTORISES);
    res.setHeader('Access-Control-Max-Age', '86400');

    if (origineAutorisee !== '*') {
      res.setHeader('Vary', 'Origin');
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

module.exports = {
  corsMiddleware,
};
