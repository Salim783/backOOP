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

const recupererProduits = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

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
    return res.status(500).json({
      message: 'Erreur serveur pendant la recuperation des produits.',
      erreur: error.message,
    });
  }
};

const recupererProduitParId = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      return res.status(404).json({
        message: 'Produit introuvable.',
      });
    }

    return res.status(200).json({
      message: 'Produit recupere avec succes.',
      produit,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur pendant la recuperation du produit.',
      erreur: error.message,
    });
  }
};

const ajouterProduit = async (req, res) => {
  try {
    const produitData = pickDefinedFields(req.body, CHAMPS_MODIFIABLES_PRODUIT);
    const imageProduit = extraireImageProduit(req);

    if (imageProduit !== undefined) {
      produitData.img = imageProduit;
    }

    const produitCree = await Produit.create(produitData);

    return res.status(201).json({
      message: 'Produit ajoute avec succes.',
      produit: produitCree,
    });
  } catch (error) {
    await supprimerImageLocaleProduit(extraireImageProduit(req));

    return res.status(500).json({
      message: "Erreur serveur pendant l ajout du produit.",
      erreur: error.message,
    });
  }
};

const modifierProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      await supprimerImageLocaleProduit(extraireImageProduit(req));

      return res.status(404).json({
        message: 'Produit introuvable.',
      });
    }

    const produitData = pickDefinedFields(req.body, CHAMPS_MODIFIABLES_PRODUIT);
    const imageProduit = extraireImageProduit(req);
    const ancienneImage = produit.img;

    if (imageProduit !== undefined) {
      produitData.img = imageProduit;
    }

    await produit.update(produitData);

    if (req.file && ancienneImage !== produit.img) {
      await supprimerImageLocaleProduit(ancienneImage);
    }

    return res.status(200).json({
      message: 'Produit modifie avec succes.',
      produit,
    });
  } catch (error) {
    await supprimerImageLocaleProduit(extraireImageProduit(req));

    return res.status(500).json({
      message: 'Erreur serveur pendant la modification du produit.',
      erreur: error.message,
    });
  }
};

const supprimerProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);

    if (!produit) {
      return res.status(404).json({
        message: 'Produit introuvable.',
      });
    }

    await produit.destroy();
    await supprimerImageLocaleProduit(produit.img);

    return res.status(200).json({
      message: 'Produit supprime avec succes.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur pendant la suppression du produit.',
      erreur: error.message,
    });
  }
};

module.exports = {
  recupererProduits,
  recupererProduitParId,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
};
