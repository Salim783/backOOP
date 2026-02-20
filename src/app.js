const express = require('express');
const cookieParser = require('cookie-parser');
const corsMiddleware = require('./middlewares/corsMiddleware');
const statsRoutes = require('./modules/stats/stats.routes');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const produitRoutes = require('./modules/produit/produit.routes');
const cspRoutes = require("./modules/csp/csp.routes");

const { issueCsrfToken } = require('./middlewares/csrf');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

app.use('/stats', statsRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ✅ endpoint donne CSRF token
app.get('/api/csrf', issueCsrfToken);
app.use("/api/csp", cspRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API backend operationnelle' });
});

app.get("/.well-known/security.txt", (req, res) => {
  res.type("text/plain");
  res.send(`Contact: mailto:security@localhost
Policy: http://localhost:5000/security-policy
Acknowledgements: http://localhost:5000/hall-of-fame
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: fr, en
`);
});

// optional (bonus)
app.get("/security.txt", (req, res) => {
  res.redirect("/.well-known/security.txt");
});

module.exports = app;
