// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Admin registration route (public with keycode)
router.post('/register', adminController.registerAdmin);

// All other routes require admin authentication
router.use(authenticateToken);
router.use(isAdmin);

// Founder approval routes
router.get('/founders', adminController.getFounderRequests);
router.post('/founders/:founderId/approve', adminController.approveFounder);
router.post('/founders/:founderId/reject', adminController.rejectFounder);

// Campaign approval routes
router.get('/campaigns', adminController.getCampaignRequests);
router.post('/campaigns/:campaignId/approve', adminController.approveCampaign);
router.post('/campaigns/:campaignId/reject', adminController.rejectCampaign);

module.exports = router;