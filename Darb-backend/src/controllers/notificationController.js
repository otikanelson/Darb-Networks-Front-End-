// src/controllers/notificationController.js
const Notification = require("../models/notificationModel");
const { formatResponse } = require("../utils/responseFormatter");

/**
 * Controller for handling notifications
 */
const notificationController = {
  /**
   * Get user notifications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, includeRead = true } = req.query;

      const notifications = await Notification.getByUserId(
        userId,
        parseInt(limit, 10),
        includeRead === "true" || includeRead === true
      );

      return formatResponse(res, 200, "Notifications retrieved successfully", {
        notifications,
      });
    } catch (error) {
      console.error("Error getting notifications:", error);
      return formatResponse(
        res,
        500,
        `Failed to retrieve notifications: ${error.message}`
      );
    }
  },

  /**
   * Get unread notification count
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await Notification.getUnreadCount(userId);

      return formatResponse(res, 200, "Unread count retrieved successfully", {
        count,
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return formatResponse(
        res,
        500,
        `Failed to retrieve unread count: ${error.message}`
      );
    }
  },

  /**
   * Mark notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const success = await Notification.markAsRead(notificationId, userId);

      if (!success) {
        return formatResponse(res, 404, "Notification not found");
      }

      return formatResponse(res, 200, "Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return formatResponse(
        res,
        500,
        `Failed to mark notification as read: ${error.message}`
      );
    }
  },

  /**
   * Mark all notifications as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.markAllAsRead(userId);

      return formatResponse(res, 200, "All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return formatResponse(
        res,
        500,
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  },

  /**
   * Delete notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const success = await Notification.delete(notificationId, userId);

      if (!success) {
        return formatResponse(res, 404, "Notification not found");
      }

      return formatResponse(res, 200, "Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      return formatResponse(
        res,
        500,
        `Failed to delete notification: ${error.message}`
      );
    }
  },
};

module.exports = notificationController;
