// const express = require('express');
// const { inscrire, connexion } = require('./auth.controller');
// const {
//   validateInscription,
//   validateConnexion,
// } = require('../../middlewares/authValidation');
// const { register, login, me } = require('./auth.controller');
// const { validateRegister, validateLogin } = require('./auth.validators');
// const { requireAuth } = require('../../middlewares/requireAuth');


// const router = express.Router();


// // Plan endpoints
// router.post('/register', validateRegister, register);
// router.post('/login', validateLogin, login);
// router.get('/me', requireAuth, me);

// // Backward compatibility (để không casse front / tests cũ)
// router.post('/inscription', validateRegister, register);
// router.post('/connexion', validateLogin, login);


// module.exports = router;
const express = require('express');
const { register, login, me } = require('./auth.controller');
const { validateRegister, validateLogin } = require('./auth.validators');
const { requireAuth } = require('../../middlewares/requireAuth');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', requireAuth, me);

// aliases (optional)
router.post('/inscription', validateRegister, register);
router.post('/connexion', validateLogin, login);

module.exports = router;