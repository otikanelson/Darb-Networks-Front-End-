// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      userType, 
      companyName, 
      phoneNumber, 
      address, 
      bvn 
    } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return formatResponse(res, 400, 'User already exists');
    }

    // Create user
    const userId = await userModel.createUser({
      email,
      password,
      fullName,
      userType,
      companyName,
      phoneNumber,
      address,
      bvn
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET || 'darb_default_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user data and token
    return formatResponse(res, 201, 'User registered successfully', {
      id: userId,
      email,
      fullName,
      userType,
      companyName,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return formatResponse(res, 500, `Registration failed: ${error.message}`);
  }
};

/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return formatResponse(res, 401, 'Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return formatResponse(res, 401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'darb_default_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Log successful token generation
    console.log(`Generated token for user ${user.id}: ${token.substring(0, 20)}...`);

    // Return user data and token
    return formatResponse(res, 200, 'Login successful', {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      userType: user.user_type,
      companyName: user.company_name,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return formatResponse(res, 500, `Login failed: ${error.message}`);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    
    if (!user) {
      return formatResponse(res, 404, 'User not found');
    }
    
    // Remove sensitive information
    const { password_hash, ...userWithoutPassword } = user;
    
    return formatResponse(res, 200, 'Profile retrieved successfully', userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    return formatResponse(res, 500, `Failed to get profile: ${error.message}`);
  }
};

module.exports = {
  register,
  login,
  getProfile
};