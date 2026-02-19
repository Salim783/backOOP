const crypto = require('crypto');

const SECRET_PAR_DEFAUT_DEV = 'change_this_secret_for_production';
const EXPIRATION_PAR_DEFAUT = 24 * 60 * 60;
const ALGO_SIGNATURE = 'HS256';

const lireSecretJwt = () => {
  const secret = process.env.JWT_SECRET || SECRET_PAR_DEFAUT_DEV;

  if (process.env.NODE_ENV === 'production' && secret === SECRET_PAR_DEFAUT_DEV) {
    throw new Error('JWT_SECRET doit etre defini en production.');
  }

  return secret;
};

const lireExpirationToken = () => {
  const expiration = Number.parseInt(process.env.TOKEN_EXPIRES_IN_SECONDS, 10);

  if (Number.isInteger(expiration) && expiration > 0) {
    return expiration;
  }

  return EXPIRATION_PAR_DEFAUT;
};

const encoderBase64Url = (valeur) =>
  Buffer.from(valeur).toString('base64url');

const decoderJsonBase64Url = (segment) => {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch (_error) {
    return null;
  }
};

const signer = (donnee, secret) =>
  crypto.createHmac('sha256', secret).update(donnee).digest('base64url');

const comparerSignatures = (signature, signatureAttendue) => {
  const signatureBuffer = Buffer.from(signature || '', 'utf8');
  const signatureAttendueBuffer = Buffer.from(signatureAttendue || '', 'utf8');

  if (signatureBuffer.length !== signatureAttendueBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, signatureAttendueBuffer);
};

const lireTokenDepuisHeader = (enteteAuthorization) => {
  if (typeof enteteAuthorization !== 'string') {
    return null;
  }

  const morceaux = enteteAuthorization.trim().split(' ');
  if (morceaux.length !== 2) {
    return null;
  }

  const [prefixe, token] = morceaux;
  if (prefixe !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const genererJwtUtilisateur = (utilisateur) => {
  const maintenant = Math.floor(Date.now() / 1000);
  const expiration = lireExpirationToken();
  const payload = {
    sub: utilisateur.id,
    mail: utilisateur.mail,
    iat: maintenant,
    exp: maintenant + expiration,
  };

  const headerEncode = encoderBase64Url(
    JSON.stringify({ alg: ALGO_SIGNATURE, typ: 'JWT' })
  );
  const payloadEncode = encoderBase64Url(JSON.stringify(payload));
  const signature = signer(`${headerEncode}.${payloadEncode}`, lireSecretJwt());

  return {
    token: `${headerEncode}.${payloadEncode}.${signature}`,
    tokenExpireLe: new Date(payload.exp * 1000).toISOString(),
  };
};

const verifierJwt = (token) => {
  if (typeof token !== 'string' || !token) {
    return { valide: false, erreur: 'format' };
  }

  const morceaux = token.split('.');
  if (morceaux.length !== 3) {
    return { valide: false, erreur: 'format' };
  }

  const [headerEncode, payloadEncode, signature] = morceaux;
  const header = decoderJsonBase64Url(headerEncode);
  const payload = decoderJsonBase64Url(payloadEncode);

  if (!header || !payload) {
    return { valide: false, erreur: 'format' };
  }

  if (header.alg !== ALGO_SIGNATURE || header.typ !== 'JWT') {
    return { valide: false, erreur: 'format' };
  }

  const signatureAttendue = signer(
    `${headerEncode}.${payloadEncode}`,
    lireSecretJwt()
  );

  if (!comparerSignatures(signature, signatureAttendue)) {
    return { valide: false, erreur: 'signature' };
  }

  const maintenant = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(payload.exp) || payload.exp <= maintenant) {
    return { valide: false, erreur: 'expire' };
  }

  if (payload.sub === undefined || typeof payload.mail !== 'string') {
    return { valide: false, erreur: 'payload' };
  }

  return { valide: true, payload };
};

module.exports = {
  lireTokenDepuisHeader,
  genererJwtUtilisateur,
  verifierJwt,
};
