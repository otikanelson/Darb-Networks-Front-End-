// src/routes/apiRouter.js
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const campaignController = require('../controllers/campaignController');
const userController = require('../controllers/userController');
const paymentController = require('../controllers/paymentController');
const mediaController = require('../controllers/mediaController');
const milestoneController = require('../controllers/milestoneController');

// Import middleware
const { authenticateToken, isFounder, isInvestor, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { validateRegistration, validateCampaign, validateMilestone } = require('../middleware/validation');

// ===============================
// AUTH ROUTES
// ===============================
router.post('/auth/register', validateRegistration, authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);

// ===============================
// USER ROUTES
// ===============================
router.put('/users/profile', authenticateToken, userController.updateProfile);

// ===============================
// CAMPAIGN ROUTES
// ===============================
// Public campaign routes
router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/:id', campaignController.getCampaign);

// Protected campaign routes
router.get('/campaigns/user/my-campaigns', authenticateToken, campaignController.getMyCampaigns);
router.post('/campaigns', authenticateToken, isFounder, validateCampaign, campaignController.createCampaign);
router.put('/campaigns/:id', authenticateToken, isFounder, campaignController.updateCampaign);
router.delete('/campaigns/:id', authenticateToken, isFounder, campaignController.deleteCampaign);

// ===============================
// MILESTONE ROUTES
// ===============================
router.get('/campaigns/:campaignId/milestones', milestoneController.getCampaignMilestones);
router.post('/campaigns/:campaignId/milestones', 
    authenticateToken, 
    isFounder, 
    validateMilestone, 
    milestoneController.createMilestone
);
router.get('/milestones/:id', milestoneController.getMilestone);
router.put('/milestones/:id', authenticateToken, isFounder, milestoneController.updateMilestone);
router.delete('/milestones/:id', authenticateToken, isFounder, milestoneController.deleteMilestone);
router.patch('/milestones/:id/status', authenticateToken, milestoneController.updateMilestoneStatus);

// ===============================
// PAYMENT ROUTES
// ===============================
router.post('/payments/initialize', authenticateToken, isInvestor, paymentController.initializePayment);
router.get('/payments/verify/:reference', authenticateToken, paymentController.verifyPayment);
router.get('/payments/history', authenticateToken, paymentController.getUserPayments);
router.get('/payments/campaign/:campaignId', authenticateToken, paymentController.getCampaignPayments);
router.get('/payments/stats/:campaignId', paymentController.getCampaignFundingStats);
router.get('/payments/:id', authenticateToken, paymentController.getPaymentDetails);

// ===============================
// MEDIA ROUTES
// ===============================
router.post('/media/campaign-image', 
    authenticateToken, 
    upload.single('image'), 
    handleUploadError, 
    mediaController.uploadCampaignImage
);
router.post('/media/profile-image', 
    authenticateToken, 
    upload.single('image'), 
    handleUploadError, 
    mediaController.uploadProfileImage
);
router.post('/media/document', 
    authenticateToken, 
    upload.single('document'), 
    handleUploadError, 
    mediaController.uploadDocument
);
router.post('/media/base64', authenticateToken, mediaController.processBase64Image);
router.get('/media/file/:filename', mediaController.getFileInfo);

module.exports = router;