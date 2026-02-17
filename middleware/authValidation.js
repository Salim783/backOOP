const { body, validationResult } = require('express-validator');

const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: 'Erreurs de validation.',
    erreurs: errors.array().map((error) => ({
      champ: error.path,
      message: error.msg,
    })),
  });
};

const validateInscription = [
  body('mail')
    .trim()
    .notEmpty()
    .withMessage('Le mail est obligatoire.')
    .isEmail()
    .withMessage('Format de mail invalide.'),
  body('mdp')
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire.')
    .isLength({ min: 12 })
    .withMessage('Le mot de passe doit contenir au moins 12 caracteres.')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage(
      'Le mot de passe doit contenir au moins un caractere special.'
    ),
  formatValidationErrors,
];

const validateConnexion = [
  body('mail')
    .trim()
    .notEmpty()
    .withMessage('Le mail est obligatoire.')
    .isEmail()
    .withMessage('Format de mail invalide.'),
  body('mdp')
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire.'),
  formatValidationErrors,
];

module.exports = {
  validateInscription,
  validateConnexion,
};
