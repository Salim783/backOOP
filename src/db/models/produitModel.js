const { sequelize } = require('../index');
const { DataTypes } = require('sequelize');

const Produit = sequelize.define(
  'Produit',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categorie: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Non classe',
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'produit',
    timestamps: false,
  }
);

module.exports = Produit;
