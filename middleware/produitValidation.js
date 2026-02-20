const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');

const CHAMPS_MISE_A_JOUR_PRODUIT = [
  'titre',
  'description',
  'categorie',
  'prix',
  'img',
  'quantite',
];

const mapperErreursValidation = (errors) =>
  errors.array().map((error) => ({
    champ: error.path,
    message: error.msg,
  }));

const nettoyerFichierUpload = async (req) => {
  if (!req.file || !req.file.path) {
    return;
  }

  try {
    await fs.promises.unlink(req.file.path);
  } catch (_error) {
    // Ignore si le fichier n existe deja plus.
  }
};

const formatValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  await nettoyerFichierUpload(req);

  return res.status(400).json({
    message: 'Erreurs de validation.',
    erreurs: mapperErreursValidation(errors),
  });
};

const validerCategorieOptionnelle = () =>
  body('categorie')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La categorie ne doit pas depasser 100 caracteres.');

const validerPrixOptionnel = () =>
  body('prix')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit etre un nombre positif ou nul.');

const validerQuantiteOptionnelle = () =>
  body('quantite')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La quantite doit etre un entier positif ou nul.');

const validerImageOptionnelle = () =>
  body('img')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage("L image doit etre un lien URL valide (http ou https).");

const reglesCommunesProduit = () => [
  validerCategorieOptionnelle(),
  validerPrixOptionnel(),
  validerQuantiteOptionnelle(),
  validerImageOptionnelle(),
];

const contientChampMiseAJour = (req) =>
  CHAMPS_MISE_A_JOUR_PRODUIT.some((champ) => req.body[champ] !== undefined) ||
  Boolean(req.file);

const validateCreationProduit = [
  body('titre')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est obligatoire.'),
  ...reglesCommunesProduit(),
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
    if (!contientChampMiseAJour(req)) {
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
  ...reglesCommunesProduit(),
  formatValidationErrors,
];

module.exports = {
  validatePaginationProduits,
  validateProduitId,
  validateCreationProduit,
  validateMiseAJourProduit,
};
