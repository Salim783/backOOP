const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion MySQL etablie');
  } catch (error) {
    console.error('Erreur connexion MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
