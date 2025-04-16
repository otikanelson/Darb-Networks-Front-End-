// src/models/paymentModel.js
const db = require('../config/database');

/**
 * Payment Model - Manages payment records and transactions
 */
const Payment = {
  /**
   * Initialize a payment (create payment record)
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} Created payment
   */
  async initializePayment(data) {
    try {
      // Generate a reference number
      const reference = `DARB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const [result] = await db.query(
        `INSERT INTO payments 
        (user_id, campaign_id, amount, reference, payment_method, status, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.userId,
          data.campaignId,
          data.amount,
          reference,
          data.paymentMethod || 'card',
          'pending',
          data.email
        ]
      );
      
      return { 
        id: result.insertId, 
        reference,
        ...data
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {string} status - New status ('pending', 'completed', 'failed')
   * @param {Object} metadata - Additional payment data
   * @returns {Promise<boolean>} Update result
   */
  async updateStatus(id, status, metadata = {}) {
    try {
      const metadataJson = JSON.stringify(metadata);
      
      const [result] = await db.query(
        'UPDATE payments SET status = ?, metadata = ?, updated_at = NOW() WHERE id = ?',
        [status, metadataJson, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify payment by reference
   * @param {string} reference - Payment reference
   * @returns {Promise<Object|null>} Payment
   */
  async verifyByReference(reference) {
    try {
      const [payments] = await db.query(
        'SELECT * FROM payments WHERE reference = ?',
        [reference]
      );
      return payments.length ? payments[0] : null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object|null>} Payment
   */
  async getById(id) {
    try {
      const [payments] = await db.query(
        'SELECT * FROM payments WHERE id = ?',
        [id]
      );
      return payments.length ? payments[0] : null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payments by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Payments
   */
  async getByUserId(userId) {
    try {
      const [payments] = await db.query(
        `SELECT p.*, c.title as campaign_title 
         FROM payments p
         JOIN campaigns c ON p.campaign_id = c.id
         WHERE p.user_id = ? 
         ORDER BY p.created_at DESC`,
        [userId]
      );
      return payments;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payments by campaign ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<Array>} Payments
   */
  async getByCampaignId(campaignId) {
    try {
      const [payments] = await db.query(
        `SELECT p.*, u.full_name as investor_name 
         FROM payments p
         JOIN users u ON p.user_id = u.id
         WHERE p.campaign_id = ? AND p.status = 'completed'
         ORDER BY p.created_at DESC`,
        [campaignId]
      );
      return payments;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Record milestone funding allocation
   * @param {number} paymentId - Payment ID
   * @param {number} milestoneId - Milestone ID
   * @param {number} amount - Amount allocated to milestone
   * @returns {Promise<Object>} Created allocation
   */
  async allocateToMilestone(paymentId, milestoneId, amount) {
    try {
      const [result] = await db.query(
        `INSERT INTO milestone_allocations
        (payment_id, milestone_id, amount)
        VALUES (?, ?, ?)`,
        [paymentId, milestoneId, amount]
      );
      
      return { 
        id: result.insertId,
        paymentId,
        milestoneId,
        amount 
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get milestone allocations for a payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Array>} Milestone allocations
   */
  async getMilestoneAllocations(paymentId) {
    try {
      const [allocations] = await db.query(
        `SELECT ma.*, m.title as milestone_title
         FROM milestone_allocations ma
         JOIN milestones m ON ma.milestone_id = m.id
         WHERE ma.payment_id = ?`,
        [paymentId]
      );
      return allocations;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get total investments amount for a campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<number>} Total amount
   */
  async getCampaignTotalInvestments(campaignId) {
    try {
      const [result] = await db.query(
        `SELECT SUM(amount) as total 
         FROM payments 
         WHERE campaign_id = ? AND status = 'completed'`,
        [campaignId]
      );
      return result[0].total || 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Payment;