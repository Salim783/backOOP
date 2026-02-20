const express = require('express');
const {
  recupererProduits,
  recupererProduitParId,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
} = require('./produit.controller');
const {
  validatePaginationProduits,
  validateProduitId,
  validateCreationProduit,
  validateMiseAJourProduit,
} = require('../../middlewares/produitValidation');
const { uploadImageProduit } = require('../../middlewares/produitUpload');

const { requireAuth } = require('../../middlewares/requireAuth'); 
const { requireCsrf } = require('../../middlewares/csrf');

const router = express.Router();

router.get('/', validatePaginationProduits, recupererProduits);
router.get('/:id', validateProduitId, recupererProduitParId);
router.post('/',  requireAuth, requireCsrf, uploadImageProduit, validateCreationProduit, ajouterProduit);
router.put(
  '/:id',
  requireAuth,
  requireCsrf,
  validateProduitId,
  uploadImageProduit,
  validateMiseAJourProduit,
  modifierProduit
);
router.delete('/:id', requireAuth, requireCsrf, validateProduitId, supprimerProduit);

module.exports = router;
