const express = require('express');
const { inscrire, connexion } = require('../controller/authController');
const {
  validateInscription,
  validateConnexion,
} = require('../middleware/authValidation');

const router = express.Router();

router.post('/inscription', validateInscription, inscrire);
router.post('/connexion', validateConnexion, connexion);

module.exports = router;
