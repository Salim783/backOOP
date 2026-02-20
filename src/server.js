const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB, sequelize } = require('./db');


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Tables synchronisées');

  app.listen(PORT, () => {
    console.log(`Serveur lance sur le port ${PORT}`);
  });
};

startServer();
