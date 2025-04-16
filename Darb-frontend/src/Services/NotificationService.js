// src/services/NotificationService.js
import ApiService from './apiService';

// Fallback base URL if not defined in apiConfig
const API_BASE_URL = 'http://localhost:5000/api';

// Define endpoints
const ENDPOINTS = {
  NOTIFICATIONS: `${API_BASE_URL}/notifications`
};

// Cache for notifications
let notificationCache = {
  notifications: [],
  unreadCount: 0,
  timestamp: null
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

class NotificationService {
  /**
   * Get all notifications for the current user
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of notifications to return
   * @param {boolean} options.includeRead - Whether to include read notifications
   * @param {boolean} options.forceRefresh - Force refresh from server
   * @returns {Promise<Array>} - List of notifications
   */
  static async getNotifications(options = {}) {
    const { 
      limit = 20, 
      includeRead = true, 
      forceRefresh = false 
    } = options;
    
    try {
      // Check cache first if not forcing refresh
      if (
        !forceRefresh && 
        notificationCache.notifications.length > 0 && 
        notificationCache.timestamp && 
        (Date.now() - notificationCache.timestamp < CACHE_EXPIRATION)
      ) {
        return notificationCache.notifications;
      }
      
      // Build query string
      const params = new URLSearchParams();
      params.append('limit', limit);
      params.append('includeRead', includeRead);
      
      // Fetch from API
      const response = await ApiService.get(`${ENDPOINTS.NOTIFICATIONS}?${params.toString()}`);
      
      // Update cache
      if (response && response.notifications) {
        notificationCache.notifications = response.notifications;
        notificationCache.timestamp = Date.now();
      }
      
      return response.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Return cached notifications if available as fallback
      if (notificationCache.notifications.length > 0) {
        return notificationCache.notifications;
      }
      
      return [];
    }
  }
  
  /**
   * Get unread notification count
   * @param {boolean} forceRefresh - Force refresh from server
   * @returns {Promise<number>} - Unread count
   */
  static async getUnreadCount(forceRefresh = false) {
    try {
      // Check cache first if not forcing refresh
      if (
        !forceRefresh && 
        notificationCache.timestamp && 
        (Date.now() - notificationCache.timestamp < CACHE_EXPIRATION)
      ) {
        return notificationCache.unreadCount;
      }
      
      // Fetch from API
      const response = await ApiService.get(`${ENDPOINTS.NOTIFICATIONS}/unread-count`);
      
      // Update cache
      if (response && typeof response.count === 'number') {
        notificationCache.unreadCount = response.count;
        notificationCache.timestamp = Date.now();
      }
      
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      
      // Return cached count if available as fallback
      return notificationCache.unreadCount || 0;
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} - Success status
   */
  static async markAsRead(notificationId) {
    try {
      await ApiService.patch(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
      
      // Update cache
      if (notificationCache.notifications.length > 0) {
        notificationCache.notifications = notificationCache.notifications.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, isRead: true };
          }
          return notification;
        });
        
        // Decrement unread count if notification was unread
        if (notificationCache.notifications.some(n => n.id === notificationId && !n.isRead)) {
          notificationCache.unreadCount = Math.max(0, notificationCache.unreadCount - 1);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>} - Success status
   */
  static async markAllAsRead() {
    try {
      await ApiService.patch(`${ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
      
      // Update cache
      if (notificationCache.notifications.length > 0) {
        notificationCache.notifications = notificationCache.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        notificationCache.unreadCount = 0;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
  
  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteNotification(notificationId) {
    try {
      await ApiService.delete(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
      
              // Update cache
      if (notificationCache.notifications.length > 0) {
        const deletedNotification = notificationCache.notifications.find(n => n.id === notificationId);
        
        notificationCache.notifications = notificationCache.notifications.filter(
          notification => notification.id !== notificationId
        );
        
        // Update unread count if needed
        if (deletedNotification && !deletedNotification.isRead) {
          notificationCache.unreadCount = Math.max(0, notificationCache.unreadCount - 1);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      return false;
    }
  }
  
  /**
   * Clear notification cache
   */
  static clearCache() {
    notificationCache = {
      notifications: [],
      unreadCount: 0,
      timestamp: null
    };
  }
}

export default NotificationService;