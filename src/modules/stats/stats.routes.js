const express = require('express');
const { getCategoriesStats } = require('./stats.controller');

const router = express.Router();

// IMPORTANT: public endpoint (exception CORS)
router.get('/categories', getCategoriesStats);

module.exports = router;