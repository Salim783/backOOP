const fs = require('fs');
const path = require('path');

let multer = null;

try {
  multer = require('multer');
} catch (_error) {
  multer = null;
}

if (!multer) {
  const uploadImageProduit = (_req, res, _next) =>
    res.status(500).json({
      message:
        "Le package multer est manquant. Lance la commande: npm install multer",
    });

  module.exports = {
    uploadImageProduit,
  };
} else {
  const DOSSIER_UPLOADS_PRODUITS = path.join(
    __dirname,
    '..',
    'uploads',
    'produits'
  );

  fs.mkdirSync(DOSSIER_UPLOADS_PRODUITS, { recursive: true });

  const TYPES_IMAGES_AUTORISES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, DOSSIER_UPLOADS_PRODUITS);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const nomFichier = `${Date.now()}-${Math.round(
        Math.random() * 1_000_000_000
      )}${extension}`;
      cb(null, nomFichier);
    },
  });

  const fileFilter = (_req, file, cb) => {
    if (TYPES_IMAGES_AUTORISES.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Format image invalide (jpeg, png, webp, gif).'));
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  const uploadImageProduit = (req, res, next) => {
    upload.single('imgFile')(req, res, (error) => {
      if (!error) {
        return next();
      }

      if (
        error instanceof multer.MulterError &&
        error.code === 'LIMIT_FILE_SIZE'
      ) {
        return res.status(400).json({
          message: 'Image trop volumineuse (maximum 5MB).',
        });
      }

      return res.status(400).json({
        message: error.message || "Erreur pendant l upload de l image.",
      });
    });
  };

  module.exports = {
    uploadImageProduit,
  };
}
