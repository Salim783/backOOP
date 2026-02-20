// src/db/models/cspReportModel.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const CSPReport = sequelize.define(
  "CSPReport",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    documentUri: { type: DataTypes.TEXT, allowNull: true },
    blockedUri: { type: DataTypes.TEXT, allowNull: true },
    violatedDirective: { type: DataTypes.STRING(255), allowNull: true },
    effectiveDirective: { type: DataTypes.STRING(255), allowNull: true },
    originalPolicy: { type: DataTypes.TEXT, allowNull: true },
    disposition: { type: DataTypes.STRING(50), allowNull: true }, // enforce/report
    raw: { type: DataTypes.JSON, allowNull: false },
  },
  {
    tableName: "csp_reports",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

module.exports = CSPReport;