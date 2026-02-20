const { DataTypes } = require('sequelize');
const { sequelize } = require('../index');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    mdp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'user',
    timestamps: false,
  }
);

module.exports = User;
