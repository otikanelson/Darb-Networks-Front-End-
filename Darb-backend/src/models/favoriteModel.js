// src/models/favoriteModel.js
const db = require('../config/database');
/**
 * Favorite Model - Manages user's favorite campaigns
 */
const Favorite = {
  /**
   * Add a campaign to user's favorites
   * @param {number} userId - User ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<Object>} Created favorite
   */
  async add(userId, campaignId) {
    try {
      // Check if already favorited
      const [existing] = await db.query(
        'SELECT * FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );
      
      if (existing.length > 0) {
        return { id: existing[0].id, userId, campaignId };
      }
      
      const [result] = await db.query(
        'INSERT INTO favorites (user_id, campaign_id) VALUES (?, ?)',
        [userId, campaignId]
      );
      
      return { id: result.insertId, userId, campaignId };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a campaign from user's favorites
   * @param {number} userId - User ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<boolean>} Delete result
   */
  async remove(userId, campaignId) {
    try {
      const [result] = await db.query(
        'DELETE FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle favorite status (add if not exists, remove if exists)
   * @param {number} userId - User ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<Object>} Result with isFavorited flag
   */
  async toggle(userId, campaignId) {
    try {
      // Check if already favorited
      const [existing] = await db.query(
        'SELECT * FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );
      
      if (existing.length > 0) {
        // Remove if exists
        await db.query(
          'DELETE FROM favorites WHERE user_id = ? AND campaign_id = ?',
          [userId, campaignId]
        );
        return { isFavorited: false };
      } else {
        // Add if doesn't exist
        await db.query(
          'INSERT INTO favorites (user_id, campaign_id) VALUES (?, ?)',
          [userId, campaignId]
        );
        return { isFavorited: true };
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if a campaign is favorited by user
   * @param {number} userId - User ID
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<boolean>} Is favorited
   */
  async isFavorited(userId, campaignId) {
    try {
      const [result] = await db.query(
        'SELECT * FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );
      
      return result.length > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's favorite campaigns
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Campaigns
   */
  async getUserFavorites(userId) {
    try {
      const [results] = await db.query(
        `SELECT c.*, 
                u.full_name as creator_name,
                u.profile_image_url as creator_avatar
         FROM favorites f
         JOIN campaigns c ON f.campaign_id = c.id
         JOIN users u ON c.creator_id = u.id
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC`,
        [userId]
      );
      
      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get number of favorites for a campaign
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<number>} Favorite count
   */
  async getCount(campaignId) {
    try {
      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM favorites WHERE campaign_id = ?',
        [campaignId]
      );
      
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Favorite;