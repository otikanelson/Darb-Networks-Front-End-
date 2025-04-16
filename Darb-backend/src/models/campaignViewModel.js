// src/models/campaignViewModel.js
const db = require('../config/database');

/**
 * Campaign View Model - Tracks user's campaign viewing history
 */
const CampaignView = {
  /**
   * Track a campaign view
   * @param {number|null} userId - User ID (null for anonymous)
   * @param {number} campaignId - Campaign ID
   * @param {string} ipAddress - IP address for anonymous users
   * @returns {Promise<Object>} View record
   */
  async trackView(userId, campaignId, ipAddress = null) {
    try {
      // First, increment view count on campaign
      await db.query(
        'UPDATE campaigns SET view_count = view_count + 1 WHERE id = ?',
        [campaignId]
      );
      
      // If no user ID, only track IP-based view once per day
      if (!userId && ipAddress) {
        // Check if this IP has viewed this campaign in the last 24 hours
        const [recentViews] = await db.query(
          `SELECT * FROM campaign_views 
           WHERE campaign_id = ? AND ip_address = ? AND user_id IS NULL
           AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
           LIMIT 1`,
          [campaignId, ipAddress]
        );
        
        // If already viewed recently, don't create a new record
        if (recentViews.length > 0) {
          return recentViews[0];
        }
      }
      
      // Record the view
      const [result] = await db.query(
        `INSERT INTO campaign_views 
        (user_id, campaign_id, ip_address) 
        VALUES (?, ?, ?)`,
        [userId, campaignId, ipAddress]
      );
      
      return {
        id: result.insertId,
        userId,
        campaignId,
        ipAddress
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recently viewed campaigns for a user
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of campaigns to return
   * @returns {Promise<Array>} Campaigns
   */
  async getUserRecentlyViewed(userId, limit = 10) {
    try {
      const [results] = await db.query(
        `SELECT c.*, 
                cv.created_at as viewed_at,
                u.full_name as creator_name,
                u.profile_image_url as creator_avatar
         FROM campaign_views cv
         JOIN campaigns c ON cv.campaign_id = c.id
         JOIN users u ON c.creator_id = u.id
         WHERE cv.user_id = ?
         GROUP BY cv.campaign_id
         ORDER BY MAX(cv.created_at) DESC
         LIMIT ?`,
        [userId, limit]
      );
      
      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get anonymous recently viewed campaigns from session/cookies
   * @param {Array} campaignIds - Array of campaign IDs
   * @returns {Promise<Array>} Campaigns
   */
  async getAnonymousRecentlyViewed(campaignIds) {
    if (!campaignIds.length) return [];
    
    try {
      // Create placeholders for the IN clause
      const placeholders = campaignIds.map(() => '?').join(',');
      
      const [results] = await db.query(
        `SELECT c.*, 
                u.full_name as creator_name,
                u.profile_image_url as creator_avatar
         FROM campaigns c
         JOIN users u ON c.creator_id = u.id
         WHERE c.id IN (${placeholders})
         ORDER BY FIELD(c.id, ${placeholders})`,
        [...campaignIds, ...campaignIds]
      );
      
      return results;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get most viewed campaigns
   * @param {number} limit - Maximum number of campaigns to return
   * @returns {Promise<Array>} Campaigns
   */
  async getMostViewed(limit = 10) {
    try {
      const [results] = await db.query(
        `SELECT c.*, 
                u.full_name as creator_name,
                u.profile_image_url as creator_avatar
         FROM campaigns c
         JOIN users u ON c.creator_id = u.id
         WHERE c.status = 'active'
         ORDER BY c.view_count DESC
         LIMIT ?`,
        [limit]
      );
      
      return results;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = CampaignView;