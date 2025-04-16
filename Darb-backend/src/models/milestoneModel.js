// src/models/milestoneModel.js
const db = require('../config/database');

/**
 * Milestone Model - Manages campaign milestone data
 */
const Milestone = {
  /**
   * Create a new milestone
   * @param {Object} data - Milestone data
   * @returns {Promise<Object>} Created milestone
   */
  async create(data) {
    try {
      const [result] = await db.query(
        `INSERT INTO milestones 
        (campaign_id, title, description, target_date, amount, deliverables, image_url, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.campaignId,
          data.title,
          data.description || null,
          data.targetDate,
          data.amount,
          data.deliverables || null,
          data.imageUrl || null,
          data.status || 'pending'
        ]
      );
      
      return { id: result.insertId, ...data };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get milestones by campaign ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<Array>} Milestones
   */
  async getByCampaignId(campaignId) {
    try {
      const [milestones] = await db.query(
        `SELECT * FROM milestones WHERE campaign_id = ? ORDER BY target_date ASC`,
        [campaignId]
      );
      return milestones;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get milestone by ID
   * @param {number} id - Milestone ID
   * @returns {Promise<Object|null>} Milestone
   */
  async getById(id) {
    try {
      const [milestones] = await db.query(
        'SELECT * FROM milestones WHERE id = ?',
        [id]
      );
      return milestones.length ? milestones[0] : null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update milestone
   * @param {number} id - Milestone ID
   * @param {Object} data - Updated milestone data
   * @returns {Promise<boolean>} Update result
   */
  async update(id, data) {
    try {
      const updateData = {};
      const allowedFields = ['title', 'description', 'target_date', 'amount', 'deliverables', 'image_url', 'status'];
      
      // Filter only allowed fields
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        return false;
      }
      
      // Build SQL query dynamically
      const setValues = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];
      
      const [result] = await db.query(
        `UPDATE milestones SET ${setValues} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete milestone
   * @param {number} id - Milestone ID
   * @returns {Promise<boolean>} Delete result
   */
  async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM milestones WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update milestone status
   * @param {number} id - Milestone ID
   * @param {string} status - New status ('pending', 'in_progress', 'completed', 'verified')
   * @returns {Promise<boolean>} Update result
   */
  async updateStatus(id, status) {
    try {
      const [result] = await db.query(
        'UPDATE milestones SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Milestone;