require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/db");

beforeAll(async () => {
  await sequelize.sync({ force: true }); // reset DB test
});

afterAll(async () => {
  await sequelize.close();
});

describe("Auth + Security Tests", () => {
  const user = {
    mail: "jest@test.com",
    mdp: "SuperSecurePass123"
  };

  let token;

  // 1. register OK
  test("register OK", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(res.statusCode).toBe(201);
  });

  // 2. register duplicate
  test("register duplicate → 409", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(res.statusCode).toBe(409);
  });

  // 3. login OK → returns JWT
  test("login OK → returns JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send(user);

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
  });

  // 4. login wrong
  test("login wrong → 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ mail: user.mail, mdp: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  // 5. POST produit no token
  test("POST produit no token → 401", async () => {
    const res = await request(app)
      .post("/api/produits")
      .send({
        titre: "Test",
        description: "Desc",
        categorie: "Test",
        prix: 10,
        quantite: 1
      });

    expect(res.statusCode).toBe(401);
  });

  // 6. POST produit with token but no CSRF
  test("POST produit with token but no CSRF → 403", async () => {
    const res = await request(app)
      .post("/api/produits")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titre: "Test",
        description: "Desc",
        categorie: "Test",
        prix: 10,
        quantite: 1
      });

    expect(res.statusCode).toBe(403);
  });

  // 7. POST /api/csp/report saves
  test("POST /api/csp/report saves", async () => {
    const res = await request(app)
      .post("/api/csp/report")
      .send({
        "csp-report": {
          "document-uri": "http://localhost",
          "blocked-uri": "http://evil.com",
          "violated-directive": "script-src"
        }
      });

    expect(res.statusCode).toBe(204);
  });

  // 8. GET /api/csp/reports requires auth
  test("GET /api/csp/reports requires auth", async () => {
    const res = await request(app)
      .get("/api/csp/reports");

    expect(res.statusCode).toBe(401);
  });
});