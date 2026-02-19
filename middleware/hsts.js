const DIRECTIVES_HSTS =
  process.env.HSTS_DIRECTIVES || 'max-age=31536000; includeSubDomains';

const estRequeteHttps = (req) => {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  return req.secure || req.protocol === 'https' || forwardedProto === 'https';
};

const hstsConditionnel = (req, res, next) => {
  if (estRequeteHttps(req)) {
    res.setHeader('Strict-Transport-Security', DIRECTIVES_HSTS);
  }

  return next();
};

module.exports = {
  hstsConditionnel,
};
