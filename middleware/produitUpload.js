const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DOSSIER_UPLOADS_PRODUITS = path.join(
  __dirname,
  '..',
  'uploads',
  'produits'
);

const CHAMP_FICHIER_IMAGE = 'imgFile';
const CHAMPS_TEXTE_AUTORISES = new Set([
  'titre',
  'description',
  'categorie',
  'prix',
  'img',
  'quantite',
]);

const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;
const TAILLE_MAX_MULTIPART = 6 * 1024 * 1024;
const TAILLE_MAX_CHAMP_TEXTE = 100 * 1024;

const MIME_AUTORISES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXTENSION_PAR_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

fs.mkdirSync(DOSSIER_UPLOADS_PRODUITS, { recursive: true });

const erreurHttp = (status, message) => Object.assign(new Error(message), { status });

const normaliserMime = (mime = '') => {
  const mimeNormalise = String(mime).trim().toLowerCase();
  return mimeNormalise === 'image/jpg' ? 'image/jpeg' : mimeNormalise;
};

const detecterMimeImage = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
};

const extraireBoundary = (contentType = '') => {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  const boundary = (match && (match[1] || match[2]) ? match[1] || match[2] : '').trim();
  return boundary && boundary.length <= 200 ? boundary : null;
};

const lireCorps = (req, tailleMax) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let termine = false;

    const clean = () => {
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
      req.removeListener('aborted', onAbort);
    };

    const fail = (error) => {
      if (termine) return;
      termine = true;
      clean();
      reject(error);
    };

    const onData = (chunk) => {
      if (termine) return;
      total += chunk.length;
      if (total > tailleMax) {
        fail(erreurHttp(413, 'Image trop volumineuse (maximum 5MB).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    };

    const onEnd = () => {
      if (termine) return;
      termine = true;
      clean();
      resolve(Buffer.concat(chunks, total));
    };

    const onError = () => fail(erreurHttp(400, 'Corps de requete invalide.'));
    const onAbort = () => fail(erreurHttp(400, 'Requete interrompue.'));

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
    req.on('aborted', onAbort);
  });

const lireHeaders = (blocHeaderUtf8) => {
  const headers = {};
  for (const ligne of blocHeaderUtf8.split('\r\n')) {
    const idx = ligne.indexOf(':');
    if (idx === -1) continue;
    headers[ligne.slice(0, idx).trim().toLowerCase()] = ligne.slice(idx + 1).trim();
  }
  return headers;
};

const lireDisposition = (contentDisposition = '') => {
  const champ = /(?:^|;)\s*name="([^"]+)"/i.exec(contentDisposition);
  const fichier = /(?:^|;)\s*filename="([^"]*)"/i.exec(contentDisposition);
  return {
    champ: champ ? champ[1] : null,
    filename: fichier ? fichier[1] : undefined,
  };
};

const parserMultipart = (buffer, boundary) => {
  const open = Buffer.from(`--${boundary}`);
  const between = Buffer.from(`\r\n--${boundary}`);
  const headerSep = Buffer.from('\r\n\r\n');

  if (buffer.indexOf(open) !== 0) {
    throw erreurHttp(400, 'Format multipart invalide.');
  }

  const champsTexte = {};
  let fichierImage = null;
  let cursor = open.length;

  while (cursor < buffer.length) {
    if (buffer[cursor] === 45 && buffer[cursor + 1] === 45) break; // "--"

    if (buffer[cursor] !== 13 || buffer[cursor + 1] !== 10) {
      throw erreurHttp(400, 'Format multipart invalide.');
    }
    cursor += 2;

    const finHeaders = buffer.indexOf(headerSep, cursor);
    if (finHeaders === -1) throw erreurHttp(400, 'Headers multipart invalides.');

    const headers = lireHeaders(buffer.toString('utf8', cursor, finHeaders));
    cursor = finHeaders + headerSep.length;

    const prochainePartie = buffer.indexOf(between, cursor);
    if (prochainePartie === -1) throw erreurHttp(400, 'Format multipart invalide.');

    const data = buffer.subarray(cursor, prochainePartie);
    cursor = prochainePartie + between.length;

    const disposition = lireDisposition(headers['content-disposition']);
    if (!disposition.champ) throw erreurHttp(400, 'Partie multipart invalide.');

    if (disposition.filename !== undefined) {
      if (disposition.champ !== CHAMP_FICHIER_IMAGE) {
        throw erreurHttp(400, `Champ fichier invalide. Utilise uniquement "${CHAMP_FICHIER_IMAGE}".`);
      }

      if (fichierImage) throw erreurHttp(400, 'Un seul fichier image est autorise.');
      if (disposition.filename === '' && data.length === 0) continue;
      if (data.length === 0) throw erreurHttp(400, 'Le fichier image est vide.');
      if (data.length > TAILLE_MAX_IMAGE) throw erreurHttp(413, 'Image trop volumineuse (maximum 5MB).');

      const mimeDeclare = normaliserMime(headers['content-type']);
      const mimeDetecte = detecterMimeImage(data);

      if (!MIME_AUTORISES.has(mimeDeclare)) {
        throw erreurHttp(400, 'Type MIME non autorise (jpeg, png, webp, gif).');
      }

      if (!mimeDetecte || mimeDetecte !== mimeDeclare) {
        throw erreurHttp(400, 'Le contenu du fichier ne correspond pas au MIME.');
      }

      fichierImage = { mime: mimeDeclare, buffer: data };
      continue;
    }

    if (data.length > TAILLE_MAX_CHAMP_TEXTE) {
      throw erreurHttp(400, `Le champ "${disposition.champ}" depasse la taille autorisee.`);
    }

    if (CHAMPS_TEXTE_AUTORISES.has(disposition.champ)) {
      champsTexte[disposition.champ] = data.toString('utf8').trim();
    }
  }

  return { champsTexte, fichierImage };
};

const sauvegarderImage = async (fichierImage) => {
  const extension = EXTENSION_PAR_MIME[fichierImage.mime];
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(DOSSIER_UPLOADS_PRODUITS, filename);

  await fs.promises.writeFile(filePath, fichierImage.buffer, { flag: 'wx' });

  return {
    filename,
    path: filePath,
    mimetype: fichierImage.mime,
    size: fichierImage.buffer.length,
  };
};

const uploadImageProduit = async (req, res, next) => {
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return next();

  try {
    const boundary = extraireBoundary(contentType);
    if (!boundary) throw erreurHttp(400, 'Boundary multipart manquant ou invalide.');

    const contentLength = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(contentLength) && contentLength > TAILLE_MAX_MULTIPART) {
      throw erreurHttp(413, 'Image trop volumineuse (maximum 5MB).');
    }

    const corps = await lireCorps(req, TAILLE_MAX_MULTIPART);
    const { champsTexte, fichierImage } = parserMultipart(corps, boundary);

    req.body = {
      ...(req.body || {}),
      ...champsTexte,
    };

    if (fichierImage) {
      req.file = await sauvegarderImage(fichierImage);
    }

    return next();
  } catch (error) {
    return res.status(error.status || 400).json({
      message: error.message || "Erreur pendant l upload de l image.",
    });
  }
};

module.exports = {
  uploadImageProduit,
};
