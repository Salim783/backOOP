// src/modules/csp/csp.service.js
const CSPReport = require("../../db/models/cspReportModel");

const saveReport = async (payload) => {
  // CSP report thường nằm trong key "csp-report"
  const report = payload["csp-report"] || payload;

  const doc = report.document-uri || report.documentURL || report.documentUri;
  const blocked = report.blocked-uri || report.blockedURL || report.blockedUri;
  const violated = report["violated-directive"] || report.violatedDirective;
  const effective = report["effective-directive"] || report.effectiveDirective;
  const original = report["original-policy"] || report.originalPolicy;
  const disposition = report.disposition;

  return CSPReport.create({
    documentUri: doc || null,
    blockedUri: blocked || null,
    violatedDirective: violated || null,
    effectiveDirective: effective || null,
    originalPolicy: original || null,
    disposition: disposition || null,
    raw: payload,
  });
};

const listReports = async ({ limit = 20 } = {}) => {
  const rows = await CSPReport.findAll({
    order: [["id", "DESC"]],
    limit,
  });
  return rows;
};

module.exports = { saveReport, listReports };