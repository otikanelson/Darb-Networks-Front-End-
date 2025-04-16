// src/utils/tokenHelper.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};