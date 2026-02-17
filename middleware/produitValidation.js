const { body, param, query, validationResult } = require('express-validator');

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

const validateCreationProduit = [
  body('titre')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est obligatoire.'),
  body('categorie')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La categorie ne doit pas depasser 100 caracteres.'),
  body('prix')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit etre un nombre positif ou nul.'),
  body('quantite')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La quantite doit etre un entier positif ou nul.'),
  body('img')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage("L image doit etre un lien URL valide (http ou https)."),
  formatValidationErrors,
];

const validatePaginationProduits = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit etre un entier superieur ou egal a 1.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit etre un entier entre 1 et 100.'),
  formatValidationErrors,
];

const validateProduitId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L identifiant du produit est invalide.'),
  formatValidationErrors,
];

const validateMiseAJourProduit = [
  body().custom((_, { req }) => {
    const champsMaj = [
      'titre',
      'description',
      'categorie',
      'prix',
      'img',
      'quantite',
    ];

    const contientUnChamp =
      champsMaj.some((champ) => req.body[champ] !== undefined) ||
      Boolean(req.file);

    if (!contientUnChamp) {
      throw new Error('Aucun champ a modifier n a ete fourni.');
    }

    return true;
  }),
  body('titre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le titre ne peut pas etre vide.'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La description ne peut pas etre vide.'),
  body('categorie')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La categorie ne doit pas depasser 100 caracteres.'),
  body('prix')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit etre un nombre positif ou nul.'),
  body('quantite')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La quantite doit etre un entier positif ou nul.'),
  body('img')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage("L image doit etre un lien URL valide (http ou https)."),
  formatValidationErrors,
];

module.exports = {
  validatePaginationProduits,
  validateProduitId,
  validateCreationProduit,
  validateMiseAJourProduit,
};
