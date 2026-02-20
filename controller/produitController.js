const Produit = require('../model/produitModel');
const fs = require('fs');
const path = require('path');

const CHAMPS_MODIFIABLES_PRODUIT = [
  'titre',
  'description',
  'categorie',
  'prix',
  'img',
  'quantite',
];

const pickDefinedFields = (source, champsAutorises) =>
  champsAutorises.reduce((acc, champ) => {
    if (source[champ] !== undefined) {
      acc[champ] = source[champ];
    }

    return acc;
  }, {});

const PREFIXE_UPLOAD_IMAGE_PRODUIT = '/uploads/produits/';

const envoyerErreurServeur = (res, message, error) =>
  res.status(500).json({
    message,
    erreur: error.message,
  });

const envoyerProduitIntrouvable = (res) =>
  res.status(404).json({
    message: 'Produit introuvable.',
  });

const estImageLocaleProduit = (valeurImage) =>
  typeof valeurImage === 'string' &&
  valeurImage.startsWith(PREFIXE_UPLOAD_IMAGE_PRODUIT);

const supprimerImageLocaleProduit = async (valeurImage) => {
  if (!estImageLocaleProduit(valeurImage)) {
    return;
  }

  const cheminAbsolu = path.join(__dirname, '..', valeurImage.replace(/^\//, ''));

  try {
    await fs.promises.unlink(cheminAbsolu);
  } catch (_error) {
    // Ignore si le fichier n existe deja plus.
  }
};

const extraireImageProduit = (req) => {
  if (req.file) {
    return `${PREFIXE_UPLOAD_IMAGE_PRODUIT}${req.file.filename}`;
  }

  if (req.body.img !== undefined) {
    return req.body.img;
  }

  return undefined;
};

const appliquerImageProduit = (produitData, imageProduit) => {
  if (imageProduit !== undefined) {
    produitData.img = imageProduit;
  }
};

const lirePaginationProduits = (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const recupererProduits = async (req, res) => {
  try {
    const { page, limit, offset } = lirePaginationProduits(req.query);

    const { count, rows } = await Produit.findAndCountAll({
      offset,
      limit,
      order: [['id', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Produits recuperes avec succes.',
      meta: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
      },
      produits: rows,
    });
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la recuperation des produits.',
      error
    );
  }
};

const recupererProduitParId = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      return envoyerProduitIntrouvable(res);
    }

    return res.status(200).json({
      message: 'Produit recupere avec succes.',
      produit,
    });
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la recuperation du produit.',
      error
    );
  }
};

const ajouterProduit = async (req, res) => {
  let imageProduit;

  try {
    const produitData = pickDefinedFields(req.body, CHAMPS_MODIFIABLES_PRODUIT);
    imageProduit = extraireImageProduit(req);
    appliquerImageProduit(produitData, imageProduit);

    const produitCree = await Produit.create(produitData);

    return res.status(201).json({
      message: 'Produit ajoute avec succes.',
      produit: produitCree,
    });
  } catch (error) {
    await supprimerImageLocaleProduit(imageProduit);

    return envoyerErreurServeur(
      res,
      "Erreur serveur pendant l ajout du produit.",
      error
    );
  }
};

const modifierProduit = async (req, res) => {
  let imageProduit;

  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);
    imageProduit = extraireImageProduit(req);

    if (!produit) {
      await supprimerImageLocaleProduit(imageProduit);

      return envoyerProduitIntrouvable(res);
    }

    const produitData = pickDefinedFields(req.body, CHAMPS_MODIFIABLES_PRODUIT);
    const ancienneImage = produit.img;
    appliquerImageProduit(produitData, imageProduit);

    await produit.update(produitData);

    if (req.file && ancienneImage !== produit.img) {
      await supprimerImageLocaleProduit(ancienneImage);
    }

    return res.status(200).json({
      message: 'Produit modifie avec succes.',
      produit,
    });
  } catch (error) {
    await supprimerImageLocaleProduit(imageProduit);

    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la modification du produit.',
      error
    );
  }
};

const supprimerProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      return envoyerProduitIntrouvable(res);
    }

    await produit.destroy();
    await supprimerImageLocaleProduit(produit.img);

    return res.status(200).json({
      message: 'Produit supprime avec succes.',
    });
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la suppression du produit.',
      error
    );
  }
};

const recupererStatistiquesProduits = async (_req, res) => {
  try {
    const [totalProduits, totalQuantite] = await Promise.all([
      Produit.count(),
      Produit.sum('quantite'),
    ]);

    return res.status(200).json({
      message: 'Statistiques produits recuperees avec succes.',
      statistiques: {
        totalProduits,
        totalQuantite: Number(totalQuantite) || 0,
      },
    });
  } catch (error) {
    return envoyerErreurServeur(
      res,
      'Erreur serveur pendant la recuperation des statistiques.',
      error
    );
  }
};

module.exports = {
  recupererProduits,
  recupererProduitParId,
  recupererStatistiquesProduits,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
};
