// src/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * @route GET /api/test/db
 * @desc Test database connection
 * @access Public
 */
router.get('/db', async (req, res) => {
  try {
    // Test database connection by running a simple query
    const [result] = await db.query('SELECT 1 + 1 as sum');
    formatResponse(res, 200, 'Database connection successful', { result: result[0] });
  } catch (error) {
    console.error('Database connection test failed:', error);
    formatResponse(res, 500, 'Database connection failed', { error: error.message });
  }
});

/**
 * @route GET /api/test/models
 * @desc Test model existence
 * @access Public
 */
router.get('/models', (req, res) => {
  try {
    // List all models that have been created
    const models = [
      'User Model',
      'Campaign Model',
      'Milestone Model',
      'Payment Model',
      'Favorite Model',
      'Campaign View Model'
    ];
    
    formatResponse(res, 200, 'Models check successful', { models });
  } catch (error) {
    formatResponse(res, 500, 'Models check failed', { error: error.message });
  }
});

module.exports = router;