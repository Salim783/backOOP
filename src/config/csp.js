// src/config/csp.js
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

const cspPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  // front use fetch alors call API:
  `connect-src 'self' ${API_BASE} http://localhost:5000`,
  // report  backend A:
  `report-uri ${API_BASE}/api/csp/report`,
].join("; ");

module.exports = { cspPolicy };