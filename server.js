const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./db');

const app = express();

app.use(express.json());

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
