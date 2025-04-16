// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return formatResponse(res, 401, 'Authentication required');
    }

    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    // Make sure we have a JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'darb_default_secret_key';
    console.log('Using JWT_SECRET:', jwtSecret.substring(0, 3) + '...');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('Token verified successfully. User ID:', decoded.id);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError.message);
      return formatResponse(res, 401, `Invalid or expired token: ${tokenError.message}`);
    }
    
    // Check if user exists in database
    try {
      const [rows] = await db.pool.query(
        'SELECT id, email, full_name, user_type FROM users WHERE id = ?', 
        [decoded.id]
      );
      
      if (rows.length === 0) {
        console.error('User not found for token. User ID:', decoded.id);
        return formatResponse(res, 401, 'User not found');
      }
      
      // Set user in request object
      req.user = rows[0];
      
      // Add admin check
      req.user.isAdmin = req.user.user_type === 'admin';
      
      console.log('User authenticated:', req.user.id, req.user.user_type);
      next();
    } catch (dbError) {
      console.error('Database error during authentication:', dbError);
      return formatResponse(res, 500, 'Server error during authentication');
    }
  } catch (error) {
    console.error('General authentication error:', error);
    return formatResponse(res, 500, 'Authentication error');
  }
};

// Middleware to check if user is a founder
const isFounder = (req, res, next) => {
  if (req.user.user_type !== 'founder') {
    return formatResponse(res, 403, 'Access denied. Founder role required');
  }
  next();
};

// Middleware to check if user is an investor
const isInvestor = (req, res, next) => {
  if (req.user.user_type !== 'investor') {
    return formatResponse(res, 403, 'Access denied. Investor role required');
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return formatResponse(res, 403, 'Access denied. Admin role required');
  }
  next();
};

module.exports = {
  authenticateToken,
  isFounder,
  isInvestor,
  isAdmin
};