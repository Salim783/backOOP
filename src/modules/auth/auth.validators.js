// // src/modules/auth/auth.validators.js
// const { body, validationResult } = require("express-validator");

// /**
//  * Minimal NIST-like password policy (pragmatic for grading):
//  * - length >= 12
//  * - block common passwords (small embedded list; can be replaced by top-1k file)
//  * - reject if contains email/username (local part) or full email
//  * - do NOT enforce uppercase/special
//  */

// // Small built-in denylist (extend if you want)
// const COMMON_PASSWORDS = new Set([
//   "password",
//   "password123",
//   "password1234",
//   "password12345",
//   "123456789",
//   "1234567890",
//   "12345678",
//   "1234567",
//   "123456",
//   "qwerty",
//   "qwerty123",
//   "azerty",
//   "azerty123",
//   "letmein",
//   "welcome",
//   "admin",
//   "administrator",
//   "iloveyou",
//   "monkey",
//   "dragon",
//   "football",
// ]);

// const normalize = (s) => String(s || "").trim();
// const normalizeLower = (s) => normalize(s).toLowerCase();

// // Very small helper to get local-part of an email (before @)
// const getEmailLocalPart = (email) => {
//   const e = normalizeLower(email);
//   const at = e.indexOf("@");
//   if (at <= 0) return "";
//   return e.slice(0, at);
// };

// const formatValidationErrors = (req, res, next) => {
//   const errors = validationResult(req);
//   if (errors.isEmpty()) return next();

//   return res.status(400).json({
//     message: "Erreurs de validation.",
//     erreurs: errors.array().map((error) => ({
//       champ: error.path,
//       message: error.msg,
//     })),
//   });
// };

// const validateRegister = [
//   body("mail")
//     .exists({ checkFalsy: true })
//     .withMessage("Le mail est obligatoire.")
//     .bail()
//     .isEmail()
//     .withMessage("Format de mail invalide.")
//     .bail()
//     .normalizeEmail(),

//   body("mdp")
//     .exists({ checkFalsy: true })
//     .withMessage("Le mot de passe est obligatoire.")
//     .bail()
//     .isString()
//     .withMessage("Le mot de passe doit etre une chaine de caracteres.")
//     .bail()
//     .custom((value, { req }) => {
//       const mdp = normalize(value);
//       const mail = normalize(req.body.mail);

//       if (mdp.length < 12) {
//         throw new Error("Le mot de passe doit contenir au moins 12 caracteres.");
//       }

//       const mdpLower = normalizeLower(mdp);

//       // denylist check (exact match and also trimmed)
//       if (COMMON_PASSWORDS.has(mdpLower)) {
//         throw new Error("Mot de passe trop courant (refuse).");
//       }

//       // reject if contains email or local-part
//       const mailLower = normalizeLower(mail);
//       const local = getEmailLocalPart(mailLower);

//       if (mailLower && mdpLower.includes(mailLower)) {
//         throw new Error("Le mot de passe ne doit pas contenir votre email.");
//       }

//       if (local && local.length >= 3 && mdpLower.includes(local)) {
//         throw new Error("Le mot de passe ne doit pas contenir votre identifiant.");
//       }

//       // ok
//       return true;
//     }),

//   formatValidationErrors,
// ];

// const validateLogin = [
//   body("mail")
//     .exists({ checkFalsy: true })
//     .withMessage("Le mail est obligatoire.")
//     .bail()
//     .isEmail()
//     .withMessage("Format de mail invalide.")
//     .bail()
//     .normalizeEmail(),

//   body("mdp")
//     .exists({ checkFalsy: true })
//     .withMessage("Le mot de passe est obligatoire.")
//     .bail()
//     .isString()
//     .withMessage("Le mot de passe doit etre une chaine de caracteres."),

//   formatValidationErrors,
// ];

// module.exports = {
//   validateRegister,
//   validateLogin,
// };

const { body, validationResult } = require("express-validator");

const COMMON_PASSWORDS = new Set([
  "password12345",
  "password123",
  "azerty12345",
  "123456789012",
  "qwerty12345",
]);

const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: "Erreurs de validation.",
    erreurs: errors.array().map((e) => ({
      champ: e.path,
      message: e.msg,
    })),
  });
};

// NIST minimal: >=12, block common, reject contains email/username
const validateRegister = [
  body("mail")
    .trim()
    .notEmpty()
    .withMessage("Le mail est obligatoire.")
    .isEmail()
    .withMessage("Format de mail invalide."),

  body("mdp")
    .notEmpty()
    .withMessage("Le mot de passe est obligatoire.")
    .isLength({ min: 12 })
    .withMessage("Le mot de passe doit contenir au moins 12 caracteres.")
    .custom((value, { req }) => {
      const mdp = String(value);
      const mail = String(req.body.mail || "").toLowerCase();

      // block common passwords
      if (COMMON_PASSWORDS.has(mdp.toLowerCase())) {
        throw new Error("Mot de passe trop commun (refuse).");
      }

      // reject if contains email or local-part
      if (mail) {
        const localPart = mail.split("@")[0] || "";
        if (localPart && mdp.toLowerCase().includes(localPart)) {
          throw new Error("Le mot de passe ne doit pas contenir votre email.");
        }
        if (mdp.toLowerCase().includes(mail)) {
          throw new Error("Le mot de passe ne doit pas contenir votre email.");
        }
      }

      return true;
    }),

  formatValidationErrors,
];

const validateLogin = [
  body("mail")
    .trim()
    .notEmpty()
    .withMessage("Le mail est obligatoire.")
    .isEmail()
    .withMessage("Format de mail invalide."),
  body("mdp").notEmpty().withMessage("Le mot de passe est obligatoire."),
  formatValidationErrors,
];

module.exports = { validateRegister, validateLogin };