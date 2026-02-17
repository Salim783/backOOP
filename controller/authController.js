const bcrypt = require('bcryptjs');
const User = require('../model/userModel');

const inscrire = async (req, res) => {
  try {
    const { mail, mdp } = req.body;

    const userExiste = await User.findOne({ where: { mail } });
    if (userExiste) {
      return res.status(409).json({
        message: 'Ce mail est deja utilise.',
      });
    }

    const mdpHash = await bcrypt.hash(mdp, 12);

    const nouvelUtilisateur = await User.create({
      mail,
      mdp: mdpHash,
    });

    return res.status(201).json({
      message: 'Inscription reussie.',
      user: {
        id: nouvelUtilisateur.id,
        mail: nouvelUtilisateur.mail,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur pendant l inscription.',
      erreur: error.message,
    });
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

    return res.status(200).json({
      message: 'Connexion reussie.',
      user: {
        id: utilisateur.id,
        mail: utilisateur.mail,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur pendant la connexion.',
      erreur: error.message,
    });
  }
};

module.exports = {
  inscrire,
  connexion,
};
