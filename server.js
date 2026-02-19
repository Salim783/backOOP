const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const { connectDB } = require('./db');
const { corsMiddleware } = require('./middleware/cors');
const { hstsConditionnel } = require('./middleware/hsts');
const authRoutes = require('./routes/authRoutes');
const produitRoutes = require('./routes/produitRoutes');
const securityRoutes = require('./routes/securityRoutes');

const app = express();

app.use(hstsConditionnel);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use('/api/auth', authRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/security', securityRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API backend operationnelle' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Serveur lance sur le port ${PORT}`);
  });
};

startServer();
