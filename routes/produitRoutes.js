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

const router = express.Router();

router.get('/', validatePaginationProduits, recupererProduits);
router.get('/:id', validateProduitId, recupererProduitParId);
router.post('/', uploadImageProduit, validateCreationProduit, ajouterProduit);
router.put(
  '/:id',
  validateProduitId,
  uploadImageProduit,
  validateMiseAJourProduit,
  modifierProduit
);
router.delete('/:id', validateProduitId, supprimerProduit);

module.exports = router;
