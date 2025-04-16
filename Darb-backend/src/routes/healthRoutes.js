// src/routes/healthRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * @route GET /api/health
 * @desc Check API health status
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const databaseConnected = await db.testConnection();
    
    // Check upload directory access
    let fileSystemOk = true;
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '../../uploads');
      fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      fileSystemOk = false;
      console.error('File system check failed:', error);
    }
    
    // Build health status
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: databaseConnected,
        pool: {
          numConnections: db.pool.pool?.config?.connectionLimit || 10,
          activeConnections: (db.pool.pool?._allConnections?.length || 0) - (db.pool.pool?._freeConnections?.length || 0),
          idleConnections: db.pool.pool?._freeConnections?.length || 0
        }
      },
      fileSystem: {
        ok: fileSystemOk
      },
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // Determine overall health status
    if (!databaseConnected || !fileSystemOk) {
      health.status = 'degraded';
    }
    
    const statusCode = health.status === 'ok' ? 200 : 503;
    return formatResponse(res, statusCode, `API health: ${health.status}`, health);
  } catch (error) {
    console.error('Health check error:', error);
    return formatResponse(res, 500, 'Health check failed', { error: error.message });
  }
});

/**
 * @route GET /api/health/db
 * @desc Check database connection
 * @access Public
 */
router.get('/db', async (req, res) => {
  try {
    // Run a simple query to verify database connection
    const [result] = await db.query('SELECT 1 as connection_test');
    
    return formatResponse(res, 200, 'Database connection successful', {
      connected: true,
      result: result[0]
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return formatResponse(res, 503, 'Database connection failed', {
      connected: false,
      error: error.message
    });
  }
});

module.exports = router;