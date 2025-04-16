// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/notifications
 * @desc Get user notifications
 * @access Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route PATCH /api/notifications/:notificationId/read
 * @desc Mark notification as read
 * @access Private
 */
router.patch('/:notificationId/read', notificationController.markAsRead);

/**
 * @route PATCH /api/notifications/mark-all-read
 * @desc Mark all notifications as read
 * @access Private
 */
router.patch('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route DELETE /api/notifications/:notificationId
 * @desc Delete notification
 * @access Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;