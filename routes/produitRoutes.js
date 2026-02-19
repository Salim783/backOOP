const express = require('express');
const {
  recupererProduits,
  recupererProduitParId,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
} = require('../controller/produitController');
const {
  validatePaginationProduits,
  validateProduitId,
  validateCreationProduit,
  validateMiseAJourProduit,
} = require('../middleware/produitValidation');
const { uploadImageProduit } = require('../middleware/produitUpload');
const { verifierToken } = require('../middleware/authToken');

const router = express.Router();

router.get('/', validatePaginationProduits, recupererProduits);
router.get('/:id', validateProduitId, recupererProduitParId);
router.post(
  '/',
  verifierToken,
  uploadImageProduit,
  validateCreationProduit,
  ajouterProduit
);
router.put(
  '/:id',
  verifierToken,
  validateProduitId,
  uploadImageProduit,
  validateMiseAJourProduit,
  modifierProduit
);
router.delete('/:id', verifierToken, validateProduitId, supprimerProduit);

module.exports = router;
