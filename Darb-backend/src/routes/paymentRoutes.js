// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// All payment routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/payments/initialize
 * @desc Initialize a payment transaction
 * @access Private
 */
router.post('/initialize', paymentController.initializePayment);

/**
 * @route GET /api/payments/verify/:reference
 * @desc Verify a payment by reference
 * @access Private
 */
router.get('/verify/:reference', paymentController.verifyPayment);

/**
 * @route GET /api/payments/history
 * @desc Get user's payment history
 * @access Private
 */
router.get('/history', paymentController.getUserPayments);

/**
 * @route GET /api/payments/details/:id
 * @desc Get payment details by ID
 * @access Private
 */
router.get('/details/:id', paymentController.getPaymentDetails);

/**
 * @route GET /api/payments/campaign/:campaignId
 * @desc Get all payments for a campaign
 * @access Private (Campaign creator only)
 */
router.get('/campaign/:campaignId', paymentController.getCampaignPayments);

/**
 * @route GET /api/payments/stats/campaign/:campaignId
 * @desc Get funding statistics for a campaign
 * @access Private
 */
router.get('/stats/campaign/:campaignId', paymentController.getCampaignFundingStats);

module.exports = router;