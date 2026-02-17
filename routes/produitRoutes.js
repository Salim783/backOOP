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

const router = express.Router();

router.get('/', validatePaginationProduits, recupererProduits);
router.get('/:id', validateProduitId, recupererProduitParId);
router.post('/', validateCreationProduit, ajouterProduit);
router.put('/:id', validateMiseAJourProduit, modifierProduit);
router.delete('/:id', validateProduitId, supprimerProduit);

module.exports = router;
