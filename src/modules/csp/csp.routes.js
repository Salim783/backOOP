// src/modules/csp/csp.routes.js
const express = require("express");
const { receiveCspReport, getCspReports } = require("./csp.controller");
const { requireAuth } = require("../../middlewares/requireAuth");

const router = express.Router();

// public (hoặc minimal restriction)
router.post("/report", express.json({ type: ["application/json", "application/csp-report"] }), receiveCspReport);

// protected
router.get("/reports", requireAuth, getCspReports);

module.exports = router;