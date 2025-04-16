// src/utils/responseFormatter.js
/**
 * Format API response consistently
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {Object} data - Optional data to include in response
 */
const formatResponse = (res, statusCode, message, data = null) => {
    const response = {
      success: statusCode >= 200 && statusCode < 300,
      message
    };
  
    if (data) {
      response.data = data;
    }
  
    return res.status(statusCode).json(response);
  };
  
  module.exports = {
    formatResponse
  };