const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const { genererJwtUtilisateur } = require('../utils/jwt');

const NOMBRE_ROUNDS_HASH_MDP = 12;

const construirePayloadUtilisateur = (utilisateur) => ({
  id: utilisateur.id,
  mail: utilisateur.mail,
});

const envoyerSuccesAuthentification = (
  res,
  statusCode,
  message,
  utilisateur
) => {
  const { token, tokenExpireLe } = genererJwtUtilisateur(utilisateur);

  return res.status(statusCode).json({
    message,
    user: construirePayloadUtilisateur(utilisateur),
    token,
    tokenExpireLe,
  });
};

const envoyerErreurServeur = (res, message, error) =>
  res.status(500).json({
    message,
    erreur: error.message,
  });

const inscrire = async (req, res) => {
  try {
    const { mail, mdp } = req.body;

    const utilisateurExistant = await User.findOne({ where: { mail } });
    if (utilisateurExistant) {
      return res.status(409).json({
        message: 'Ce mail est deja utilise.',
      });
    }

    const mdpHash = await bcrypt.hash(mdp, NOMBRE_ROUNDS_HASH_MDP);

    const utilisateur = await User.create({
      mail,
      mdp: mdpHash,
    });

    return envoyerSuccesAuthentification(
      res,
      201,
      'Inscription reussie.',
      utilisateur
    );
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant l inscription.',
      error
    );
  }
};

const connexion = async (req, res) => {
  try {
    const { mail, mdp } = req.body;

    const utilisateur = await User.findOne({ where: { mail } });
    if (!utilisateur) {
      return res.status(401).json({
        message: 'Identifiants invalides.',
      });
    }

    const mdpValide = await bcrypt.compare(mdp, utilisateur.mdp);
    if (!mdpValide) {
      return res.status(401).json({
        message: 'Identifiants invalides.',
      });
    }

    return envoyerSuccesAuthentification(
      res,
      200,
      'Connexion reussie.',
      utilisateur
    );
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la connexion.',
      error
    );
  }
};

module.exports = {
  inscrire,
  connexion,
};
