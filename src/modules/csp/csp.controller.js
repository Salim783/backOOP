// src/modules/csp/csp.controller.js
const { saveReport, listReports } = require("./csp.service");

const receiveCspReport = async (req, res) => {
  try {
    // Có trình duyệt gửi body rỗng => vẫn trả 204
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(204).send();
    }

    await saveReport(req.body);
    return res.status(204).send(); // chuẩn cho report endpoint
  } catch (err) {
    // không nên làm crash report endpoint
    return res.status(204).send();
  }
};

const getCspReports = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const reports = await listReports({ limit });

    return res.status(200).json({
      message: "CSP reports recuperes.",
      reports,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { receiveCspReport, getCspReports };