// src/controllers/adminController.js
const db = require('../config/database');
const { formatResponse } = require('../utils/responseFormatter');
const { v4: uuidv4 } = require('uuid');

/**
 * Admin controller for managing founder and campaign approvals
 */
const adminController = {
  /**
   * Get all pending founder requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFounderRequests(req, res) {
    try {
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Get founder approval requests (users who registered as founders but aren't approved yet)
      const [founders] = await db.query(`
        SELECT id, email, full_name, company_name, user_type, created_at, is_verified 
        FROM users 
        WHERE user_type = 'founder' 
        ORDER BY created_at DESC
      `);
      
      // Format the results
      const formattedFounders = founders.map(founder => ({
        id: founder.id,
        name: founder.full_name,
        email: founder.email,
        companyName: founder.company_name,
        requestDate: founder.created_at,
        status: founder.is_verified ? 'approved' : 'pending'
      }));
      
      return formatResponse(res, 200, 'Founder requests retrieved successfully', { 
        requests: formattedFounders 
      });
    } catch (error) {
      console.error('Error getting founder requests:', error);
      return formatResponse(res, 500, `Failed to retrieve founder requests: ${error.message}`);
    }
  },
  
  /**
   * Get all campaign approval requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCampaignRequests(req, res) {
    try {
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Get campaign approval requests (campaigns waiting for admin approval)
      const [campaigns] = await db.query(`
        SELECT c.id, c.title, c.target_amount, c.category, c.created_at, c.status,
               u.full_name as founder_name
        FROM campaigns c
        JOIN users u ON c.creator_id = u.id
        WHERE c.status = 'pending_approval'
        ORDER BY c.created_at DESC
      `);
      
      // Format the results
      const formattedCampaigns = campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        founder: campaign.founder_name,
        goalAmount: campaign.target_amount,
        category: campaign.category,
        submittedDate: campaign.created_at,
        status: campaign.status
      }));
      
      return formatResponse(res, 200, 'Campaign requests retrieved successfully', { 
        requests: formattedCampaigns 
      });
    } catch (error) {
      console.error('Error getting campaign requests:', error);
      return formatResponse(res, 500, `Failed to retrieve campaign requests: ${error.message}`);
    }
  },
  
  /**
   * Approve a founder account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async approveFounder(req, res) {
    try {
      const { founderId } = req.params;
      
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Update user verified status
      const [result] = await db.query(
        'UPDATE users SET is_verified = TRUE WHERE id = ? AND user_type = "founder"',
        [founderId]
      );
      
      if (result.affectedRows === 0) {
        return formatResponse(res, 404, 'Founder not found');
      }
      
      return formatResponse(res, 200, 'Founder approved successfully');
    } catch (error) {
      console.error(`Error approving founder ${req.params.founderId}:`, error);
      return formatResponse(res, 500, `Failed to approve founder: ${error.message}`);
    }
  },
  
  /**
   * Reject a founder account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rejectFounder(req, res) {
    try {
      const { founderId } = req.params;
      
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Update user type to 'rejected'
      const [result] = await db.query(
        'UPDATE users SET user_type = "rejected_founder" WHERE id = ? AND user_type = "founder"',
        [founderId]
      );
      
      if (result.affectedRows === 0) {
        return formatResponse(res, 404, 'Founder not found');
      }
      
      return formatResponse(res, 200, 'Founder request rejected');
    } catch (error) {
      console.error(`Error rejecting founder ${req.params.founderId}:`, error);
      return formatResponse(res, 500, `Failed to reject founder: ${error.message}`);
    }
  },
  
  /**
   * Approve a campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async approveCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Update campaign status to 'active'
      const [result] = await db.query(
        'UPDATE campaigns SET status = "active" WHERE id = ? AND status = "pending_approval"',
        [campaignId]
      );
      
      if (result.affectedRows === 0) {
        return formatResponse(res, 404, 'Campaign not found or already processed');
      }
      
      return formatResponse(res, 200, 'Campaign approved successfully');
    } catch (error) {
      console.error(`Error approving campaign ${req.params.campaignId}:`, error);
      return formatResponse(res, 500, `Failed to approve campaign: ${error.message}`);
    }
  },
  
  /**
   * Reject a campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rejectCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { reason } = req.body;
      
      // Check if user is an admin
      if (req.user.userType !== 'admin') {
        return formatResponse(res, 403, 'Access denied');
      }
      
      // Update campaign status to 'rejected'
      const [result] = await db.query(
        'UPDATE campaigns SET status = "rejected", rejection_reason = ? WHERE id = ? AND status = "pending_approval"',
        [reason || 'No reason provided', campaignId]
      );
      
      if (result.affectedRows === 0) {
        return formatResponse(res, 404, 'Campaign not found or already processed');
      }
      
      return formatResponse(res, 200, 'Campaign rejected successfully');
    } catch (error) {
      console.error(`Error rejecting campaign ${req.params.campaignId}:`, error);
      return formatResponse(res, 500, `Failed to reject campaign: ${error.message}`);
    }
  },
  
  /**
   * Register an admin account (requires admin keycode)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async registerAdmin(req, res) {
    try {
      const { email, password, fullName, keycode } = req.body;
      
      // Validate keycode - should be an environment variable in real implementation
      const validKeycode = process.env.ADMIN_KEYCODE || 'darb-network-admin-2023';
      
      if (keycode !== validKeycode) {
        return formatResponse(res, 403, 'Invalid admin keycode');
      }
      
      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        return formatResponse(res, 400, 'User with this email already exists');
      }
      
      // Hash password
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create admin user
      const [result] = await db.query(
        `INSERT INTO users (
           email, password_hash, full_name, user_type, is_verified, is_active
         ) VALUES (?, ?, ?, 'admin', TRUE, TRUE)`,
        [email, hashedPassword, fullName]
      );
      
      const userId = result.insertId;
      
      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'darb_default_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      return formatResponse(res, 201, 'Admin registered successfully', {
        id: userId,
        email,
        fullName,
        userType: 'admin',
        token
      });
    } catch (error) {
      console.error('Error registering admin:', error);
      return formatResponse(res, 500, `Failed to register admin: ${error.message}`);
    }
  }
};

module.exports = adminController;