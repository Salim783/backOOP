const express = require('express');
const request = require('supertest');
const { genererJwtUtilisateur } = require('../utils/jwt');

jest.mock('../controller/produitController', () => ({
  recupererProduits: jest.fn(),
  recupererProduitParId: jest.fn(),
  ajouterProduit: jest.fn(),
  modifierProduit: jest.fn(),
  supprimerProduit: jest.fn(),
}));

const produitController = require('../controller/produitController');
const produitRoutes = require('../routes/produitRoutes');

const creerAppTest = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/produits', produitRoutes);
  return app;
};

const creerTokenValide = () =>
  genererJwtUtilisateur({
    id: 123,
    mail: 'user-test@example.com',
  }).token;

beforeEach(() => {
  jest.clearAllMocks();

  produitController.ajouterProduit.mockImplementation((req, res) =>
    res.status(201).json({
      message: 'Ajout OK',
      utilisateur: req.utilisateur,
    })
  );

  produitController.modifierProduit.mockImplementation((req, res) =>
    res.status(200).json({
      message: 'Modification OK',
      utilisateur: req.utilisateur,
    })
  );

  produitController.supprimerProduit.mockImplementation((req, res) =>
    res.status(200).json({
      message: 'Suppression OK',
      utilisateur: req.utilisateur,
    })
  );
});

test('POST /api/produits refuse sans token', async () => {
  const app = creerAppTest();

  const response = await request(app).post('/api/produits').send({
    titre: 'Produit A',
    description: 'Description A',
  });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Token d identification manquant ou invalide.");
  expect(produitController.ajouterProduit).not.toHaveBeenCalled();
});

test('POST /api/produits refuse avec token invalide', async () => {
  const app = creerAppTest();

  const response = await request(app)
    .post('/api/produits')
    .set('Authorization', 'Bearer token_invalide')
    .send({
      titre: 'Produit A',
      description: 'Description A',
    });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Token d identification invalide.");
  expect(produitController.ajouterProduit).not.toHaveBeenCalled();
});

test('POST /api/produits autorise avec token valide', async () => {
  const app = creerAppTest();
  const token = creerTokenValide();

  const response = await request(app)
    .post('/api/produits')
    .set('Authorization', `Bearer ${token}`)
    .send({
      titre: 'Produit A',
      description: 'Description A',
    });

  expect(response.status).toBe(201);
  expect(response.body.message).toBe('Ajout OK');
  expect(response.body.utilisateur).toEqual({
    id: 123,
    mail: 'user-test@example.com',
  });
  expect(produitController.ajouterProduit).toHaveBeenCalledTimes(1);
});

test('PUT /api/produits/:id refuse sans token', async () => {
  const app = creerAppTest();

  const response = await request(app).put('/api/produits/1').send({
    titre: 'Nouveau titre',
  });

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Token d identification manquant ou invalide.");
  expect(produitController.modifierProduit).not.toHaveBeenCalled();
});

test('PUT /api/produits/:id autorise avec token valide', async () => {
  const app = creerAppTest();
  const token = creerTokenValide();

  const response = await request(app)
    .put('/api/produits/1')
    .set('Authorization', `Bearer ${token}`)
    .send({
      titre: 'Nouveau titre',
    });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Modification OK');
  expect(response.body.utilisateur).toEqual({
    id: 123,
    mail: 'user-test@example.com',
  });
  expect(produitController.modifierProduit).toHaveBeenCalledTimes(1);
});

test('DELETE /api/produits/:id refuse sans token', async () => {
  const app = creerAppTest();

  const response = await request(app).delete('/api/produits/1');

  expect(response.status).toBe(401);
  expect(response.body.message).toBe("Token d identification manquant ou invalide.");
  expect(produitController.supprimerProduit).not.toHaveBeenCalled();
});

test('DELETE /api/produits/:id autorise avec token valide', async () => {
  const app = creerAppTest();
  const token = creerTokenValide();

  const response = await request(app)
    .delete('/api/produits/1')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Suppression OK');
  expect(response.body.utilisateur).toEqual({
    id: 123,
    mail: 'user-test@example.com',
  });
  expect(produitController.supprimerProduit).toHaveBeenCalledTimes(1);
});
