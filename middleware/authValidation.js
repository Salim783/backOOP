const { body, validationResult } = require('express-validator');

const mapperErreursValidation = (errors) =>
  errors.array().map((error) => ({
    champ: error.path,
    message: error.msg,
  }));

const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: 'Erreurs de validation.',
    erreurs: mapperErreursValidation(errors),
  });
};

const validerMailObligatoire = () =>
  body('mail')
    .trim()
    .notEmpty()
    .withMessage('Le mail est obligatoire.')
    .isEmail()
    .withMessage('Format de mail invalide.');

const validerMotDePasseObligatoire = () =>
  body('mdp').notEmpty().withMessage('Le mot de passe est obligatoire.');

const validerMotDePasseInscription = () =>
  validerMotDePasseObligatoire()
    .isLength({ min: 12 })
    .withMessage('Le mot de passe doit contenir au moins 12 caracteres.')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage(
      'Le mot de passe doit contenir au moins un caractere special.'
    );

const validateInscription = [
  validerMailObligatoire(),
  validerMotDePasseInscription(),
  formatValidationErrors,
];

const validateConnexion = [
  validerMailObligatoire(),
  validerMotDePasseObligatoire(),
  formatValidationErrors,
];

module.exports = {
  validateInscription,
  validateConnexion,
};
