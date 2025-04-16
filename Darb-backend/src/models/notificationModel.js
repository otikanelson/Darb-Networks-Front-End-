// src/models/notificationModel.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Notification model for handling user notifications
 */
class Notification {
  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification
   */
  static async create(data) {
    try {
      const {
        userId,
        type,
        title,
        message,
        relatedId = null,
        relatedType = null
      } = data;
      
      // Generate a unique ID
      const notificationId = uuidv4();
      const now = new Date();
      
      // Insert notification
      await db.query(`
        INSERT INTO notifications (
          id, user_id, type, title, message, related_id, related_type, is_read, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, ?)
      `, [
        notificationId,
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        now
      ]);
      
      // Return created notification
      return {
        id: notificationId,
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        isRead: false,
        createdAt: now
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Create a campaign approval notification
   * @param {string} userId - User ID
   * @param {string} campaignId - Campaign ID
   * @param {string} campaignTitle - Campaign title
   * @param {boolean} approved - Whether campaign was approved
   * @returns {Promise<Object>} Created notification
   */
  static async createCampaignApprovalNotification(userId, campaignId, campaignTitle, approved) {
    const title = approved 
      ? 'Campaign Approved' 
      : 'Campaign Rejected';
      
    const message = approved
      ? `Your campaign "${campaignTitle}" has been approved and is now live.`
      : `Your campaign "${campaignTitle}" has been rejected. Check your emails for more information.`;
      
    return this.create({
      userId,
      type: 'campaign_approval',
      title,
      message,
      relatedId: campaignId,
      relatedType: 'campaign'
    });
  }
  
  /**
   * Create a founder approval notification
   * @param {string} userId - User ID
   * @param {boolean} approved - Whether founder was approved
   * @returns {Promise<Object>} Created notification
   */
  static async createFounderApprovalNotification(userId, approved) {
    const title = approved 
      ? 'Founder Account Approved' 
      : 'Founder Account Rejected';
      
    const message = approved
      ? 'Your founder account has been approved. You can now create campaigns.'
      : 'Your founder account application has been rejected. Please contact support for more information.';
      
    return this.create({
      userId,
      type: 'founder_approval',
      title,
      message,
      relatedId: userId,
      relatedType: 'user'
    });
  }
  
  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of notifications
   * @param {boolean} includeRead - Whether to include read notifications
   * @returns {Promise<Array>} Notifications
   */
  static async getByUserId(userId, limit = 20, includeRead = true) {
    try {
      let query = `
        SELECT id, type, title, message, related_id, related_type, is_read, created_at
        FROM notifications
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      // Add filter for unread if needed
      if (!includeRead) {
        query += ' AND is_read = FALSE';
      }
      
      // Add order and limit
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);
      
      // Execute query
      const [notifications] = await db.query(query, params);
      
      // Format results
      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedId: notification.related_id,
        relatedType: notification.related_type,
        isRead: Boolean(notification.is_read),
        createdAt: notification.created_at
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }
  
  /**
   * Get unread count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  static async getUnreadCount(userId) {
    try {
      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} Success
   */
  static async markAsRead(notificationId, userId) {
    try {
      const [result] = await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success
   */
  static async markAllAsRead(userId) {
    try {
      const [result] = await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} Success
   */
  static async delete(notificationId, userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = Notification;