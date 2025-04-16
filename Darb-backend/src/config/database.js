// src/config/database.js
const mysql = require('mysql2/promise');
const config = require('./config');

// Create connection pool
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true // Enable named placeholders for more readable queries
});

/**
 * Execute a query with proper error handling
 * @param {string} sql - SQL query
 * @param {Array|Object} params - Query parameters (array for positional, object for named)
 * @returns {Promise<Array>} - Query results
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Async function that receives a connection and executes queries
 * @returns {Promise<any>} - Transaction result
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};