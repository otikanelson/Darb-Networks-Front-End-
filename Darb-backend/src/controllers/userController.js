// src/controllers/userController.js
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const logger = require('../utils/logger');
const mediaController = require('./mediaController');

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    // User is already available in req.user thanks to authentication middleware
    const userId = req.user.id;
    
    // Get complete user profile
    const [rows] = await db.query(
      `SELECT id, email, full_name, user_type, company_name, 
              phone_number, address, profile_image_url, is_verified, 
              is_active, created_at, updated_at 
       FROM users 
       WHERE id = ?`, 
      [userId]
    );
    
    if (rows.length === 0) {
      return formatResponse(res, 404, 'User not found');
    }
    
    // Return user data
    return formatResponse(res, 200, 'Profile retrieved successfully', rows[0]);
  } catch (error) {
    logger.error('Error getting user profile:', error);
    return formatResponse(res, 500, 'Server error');
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      fullName, 
      phoneNumber, 
      address, 
      companyName,
      userType, 
      profileImageUrl 
    } = req.body;
    
    // Validate userType if it's being changed
    if (userType && !['founder', 'investor', 'admin'].includes(userType)) {
      return formatResponse(res, 400, 'Invalid user type');
    }
    
    // Start building the query
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];
    
    // Add fields to update only if they are provided
    if (fullName !== undefined) {
      updates.push('full_name = ?');
      params.push(fullName);
    }
    
    if (phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      params.push(phoneNumber);
    }
    
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    
    if (companyName !== undefined) {
      updates.push('company_name = ?');
      params.push(companyName);
    }
    
    if (userType !== undefined) {
      updates.push('user_type = ?');
      params.push(userType);
    }
    
    if (profileImageUrl !== undefined) {
      updates.push('profile_image_url = ?');
      params.push(profileImageUrl);
    }
    
    // Always add updated_at
    updates.push('updated_at = NOW()');
    
    // Only proceed if there are fields to update
    if (updates.length === 0) {
      return formatResponse(res, 400, 'No fields to update');
    }
    
    // Complete the query
    query += updates.join(', ') + ' WHERE id = ?';
    params.push(userId);
    
    // Execute the update
    const [result] = await db.query(query, params);
    
    if (result.affectedRows === 0) {
      return formatResponse(res, 404, 'User not found');
    }
    
    // Get the updated user data
    const [updatedUser] = await db.query(
      `SELECT id, email, full_name, user_type, company_name, 
              phone_number, address, profile_image_url, is_verified, 
              is_active, created_at, updated_at 
       FROM users 
       WHERE id = ?`, 
      [userId]
    );
    
    return formatResponse(res, 200, 'Profile updated successfully', updatedUser[0]);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return formatResponse(res, 500, 'Server error');
  }
};

/**
 * Update user password
 * @route PUT /api/users/password
 * @access Private
 */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return formatResponse(res, 400, 'Current password and new password are required');
    }
    
    // Validate password requirements
    if (newPassword.length < 8) {
      return formatResponse(res, 400, 'Password must be at least 8 characters');
    }
    
    // Password complexity check (uppercase, lowercase, number)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return formatResponse(res, 400, 'Password must include at least one uppercase letter, one lowercase letter, and one number');
    }
    
    // Get current user
    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return formatResponse(res, 404, 'User not found');
    }
    
    const user = users[0];
    
    // Check if current password is correct
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return formatResponse(res, 400, 'Current password is incorrect');
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the password
    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return formatResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    logger.error('Error updating password:', error);
    return formatResponse(res, 500, 'Server error');
  }
};

/**
 * Upload profile image (uses mediaController)
 * @route POST /api/users/profile-image
 * @access Private
 */
const uploadProfileImage = async (req, res) => {
  try {
    // This leverages the existing media controller
    const result = await mediaController.uploadProfileImage(req, res);
    
    // If the mediaController directly handles the response, we don't need to do anything else
    if (res.headersSent) {
      return;
    }
    
    // Otherwise, we handle the response here
    return result;
  } catch (error) {
    logger.error('Error uploading profile image:', error);
    return formatResponse(res, 500, 'Failed to upload profile image');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  uploadProfileImage
};