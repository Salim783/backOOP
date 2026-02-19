const { lireTokenDepuisHeader, verifierJwt } = require('../utils/jwt');

const verifierToken = (req, res, next) => {
  const token = lireTokenDepuisHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({
      message: "Token d identification manquant ou invalide.",
    });
  }

  const resultatVerification = verifierJwt(token);
  if (!resultatVerification.valide) {
    if (resultatVerification.erreur === 'expire') {
      return res.status(401).json({
        message: "Token d identification expire.",
      });
    }

    return res.status(401).json({
      message: "Token d identification invalide.",
    });
  }

  req.utilisateur = {
    id: resultatVerification.payload.sub,
    mail: resultatVerification.payload.mail,
  };

  return next();
};

module.exports = {
  verifierToken,
};
