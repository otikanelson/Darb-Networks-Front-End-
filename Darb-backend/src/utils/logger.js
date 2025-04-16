// src/utils/logger.js
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const infoLogPath = path.join(logsDir, 'info.log');
const accessLogPath = path.join(logsDir, 'access.log');

/**
 * Format a log message with timestamp and additional metadata
 * @param {string} level - Log level (INFO, ERROR, etc)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} Formatted log entry
 */
function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
  
  return `[${timestamp}] [${level}] ${message}${metaString}\n`;
}

/**
 * Write to log file
 * @param {string} filePath - Path to log file
 * @param {string} entry - Log entry
 */
function writeToLog(filePath, entry) {
  fs.appendFile(filePath, entry, (err) => {
    if (err) {
      console.error(`Failed to write to log file ${filePath}:`, err);
    }
  });
}

/**
 * Log info message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function info(message, meta = {}) {
  const entry = formatLogEntry('INFO', message, meta);
  console.log(entry);
  writeToLog(infoLogPath, entry);
}

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or additional metadata
 */
function error(message, error = {}) {
  let meta = {};
  
  if (error instanceof Error) {
    meta = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
      ...(error.errno && { errno: error.errno }),
      ...(error.sql && { sql: error.sql })
    };
  } else {
    meta = error;
  }
  
  const entry = formatLogEntry('ERROR', message, meta);
  console.error(entry);
  writeToLog(errorLogPath, entry);
}

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function warn(message, meta = {}) {
  const entry = formatLogEntry('WARN', message, meta);
  console.warn(entry);
  writeToLog(infoLogPath, entry);
}

/**
 * Log debug message (only in development)
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
function debug(message, meta = {}) {
  if (process.env.NODE_ENV !== 'production') {
    const entry = formatLogEntry('DEBUG', message, meta);
    console.debug(entry);
  }
}

/**
 * Log API access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} time - Response time in ms
 */
function logAccess(req, res, time) {
  const entry = formatLogEntry('ACCESS', `${req.method} ${req.originalUrl}`, {
    ip: req.ip || req.connection.remoteAddress,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    responseTime: `${time}ms`,
    userId: req.user?.id || 'anonymous'
  });
  
  writeToLog(accessLogPath, entry);
}

module.exports = {
  info,
  error,
  warn,
  debug,
  logAccess
};