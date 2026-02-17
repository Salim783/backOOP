const Produit = require('../model/produitModel');

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

    const produitCree = await Produit.create(produitData);

    return res.status(201).json({
      message: 'Produit ajoute avec succes.',
      produit: produitCree,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant l ajout du produit.",
      erreur: error.message,
    });
  }
};

const modifierProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const produitData = pickDefinedFields(req.body, CHAMPS_MODIFIABLES_PRODUIT);
    const [lignesModifiees] = await Produit.update(produitData, {
      where: { id },
    });

    if (!lignesModifiees) {
      return res.status(404).json({
        message: 'Produit introuvable.',
      });
    }

    const produit = await Produit.findByPk(id);

    return res.status(200).json({
      message: 'Produit modifie avec succes.',
      produit,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur pendant la modification du produit.',
      erreur: error.message,
    });
  }
};

const supprimerProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const lignesSupprimees = await Produit.destroy({
      where: { id },
    });

    if (!lignesSupprimees) {
      return res.status(404).json({
        message: 'Produit introuvable.',
      });
    }

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
