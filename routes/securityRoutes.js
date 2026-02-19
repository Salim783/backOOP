const express = require('express');
const {
  fournirTokenCsrf,
  verifierCsrf,
} = require('../middleware/csrfProtection');

const router = express.Router();

router.get('/csrf/token', fournirTokenCsrf, (req, res) => {
  return res.status(200).json({
    csrfToken: req.csrfTokenValue,
    expireLe: req.csrfExpireLe,
  });
});

router.get('/csrf/form', fournirTokenCsrf, (req, res) => {
  res.type('html');

  return res.send(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Demo CSRF</title>
</head>
<body>
  <h1>Formulaire protege par CSRF</h1>
  <p>Le token expire le: ${req.csrfExpireLe}</p>
  <form method="post" action="/api/security/csrf/form">
    <label for="message">Message</label>
    <input id="message" name="message" type="text" required />
    <input type="hidden" name="_csrf" value="${req.csrfTokenValue}" />
    <button type="submit">Envoyer</button>
  </form>
</body>
</html>`);
});

router.post('/csrf/form', verifierCsrf, (req, res) => {
  return res.status(200).json({
    message: 'Requete acceptee (CSRF valide).',
    donnees: {
      message: req.body.message || null,
    },
  });
});

module.exports = router;
