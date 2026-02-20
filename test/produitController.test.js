const fs = require('node:fs');

const Produit = require('../model/produitModel');
const {
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
} = require('../controller/produitController');

const methodsOriginaux = {
  create: Produit.create,
  findByPk: Produit.findByPk,
  unlink: fs.promises.unlink,
};

const restaurerMocks = () => {
  Produit.create = methodsOriginaux.create;
  Produit.findByPk = methodsOriginaux.findByPk;
  fs.promises.unlink = methodsOriginaux.unlink;
};

const creerReponseMock = () => {
  const res = {
    statusCode: null,
    payload: null,
  };

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    res.payload = payload;
    return res;
  };

  return res;
};

afterEach(() => {
  restaurerMocks();
});

test('ajouterProduit doit creer un produit', async () => {
  const req = {
    body: {
      titre: 'Produit A',
      description: 'Description A',
      categorie: 'Electronique',
      prix: 120.5,
      quantite: 3,
      champInutile: 'ignore',
    },
  };
  const res = creerReponseMock();

  let donneesRecues = null;
  const produitCree = { id: 1, ...req.body };

  Produit.create = async (donnees) => {
    donneesRecues = donnees;
    return produitCree;
  };

  await ajouterProduit(req, res);

  expect(donneesRecues).toEqual({
    titre: 'Produit A',
    description: 'Description A',
    categorie: 'Electronique',
    prix: 120.5,
    quantite: 3,
  });
  expect(res.statusCode).toBe(201);
  expect(res.payload.message).toBe('Produit ajoute avec succes.');
  expect(res.payload.produit).toEqual(produitCree);
});

test('modifierProduit doit mettre a jour un produit existant', async () => {
  const req = {
    params: { id: '2' },
    body: {
      titre: 'Nouveau titre',
      prix: 79.9,
    },
  };
  const res = creerReponseMock();

  let idRecherche = null;
  let donneesMiseAJour = null;
  const produitExistant = {
    id: 2,
    titre: 'Ancien titre',
    prix: 20,
    img: null,
    update: async function (donnees) {
      donneesMiseAJour = donnees;
      Object.assign(this, donnees);
    },
  };

  Produit.findByPk = async (id) => {
    idRecherche = id;
    return produitExistant;
  };

  await modifierProduit(req, res);

  expect(idRecherche).toBe('2');
  expect(donneesMiseAJour).toEqual({
    titre: 'Nouveau titre',
    prix: 79.9,
  });
  expect(res.statusCode).toBe(200);
  expect(res.payload.message).toBe('Produit modifie avec succes.');
  expect(res.payload.produit.titre).toBe('Nouveau titre');
  expect(res.payload.produit.prix).toBe(79.9);
});

test('supprimerProduit doit supprimer un produit existant', async () => {
  const req = { params: { id: '3' } };
  const res = creerReponseMock();

  let destroyAppele = false;
  const produitExistant = {
    id: 3,
    img: null,
    destroy: async () => {
      destroyAppele = true;
    },
  };

  Produit.findByPk = async () => produitExistant;

  await supprimerProduit(req, res);

  expect(destroyAppele).toBe(true);
  expect(res.statusCode).toBe(200);
  expect(res.payload.message).toBe('Produit supprime avec succes.');
});
