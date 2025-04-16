// src/controllers/paymentController.js
const Payment = require('../models/paymentModel');
const Campaign = require('../models/campaignModel');
const { formatResponse } = require('../utils/responseFormatter');
require('dotenv').config();
const db = require('../config/database');

/**
 * Payment Controller - Handles payment-related operations
 */
const paymentController = {
  /**
   * Initialize a payment (create payment record)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initializePayment(req, res) {
    try {
      const { campaignId, amount, milestoneIds, email } = req.body;
      
      // Validate campaign exists
      const campaign = await Campaign.getById(campaignId);
      
      if (!campaign) {
        return formatResponse(res, 404, 'Campaign not found');
      }
      
      // Validate milestone IDs if provided
      if (milestoneIds && milestoneIds.length > 0) {
        // Get campaign milestones
        const milestones = await Promise.all(
          milestoneIds.map(id => Campaign.getMilestone(campaignId, id))
        );
        
        // Check if any milestones were not found
        const invalidMilestones = milestones.filter(m => !m);
        if (invalidMilestones.length > 0) {
          return formatResponse(res, 400, 'One or more milestones not found');
        }
      }
      
      // Create payment record
      const payment = await Payment.initializePayment({
        userId: req.user.id,
        campaignId,
        amount,
        email: email || req.user.email
      });
      
      // If milestone IDs are provided, record allocations
      if (milestoneIds && milestoneIds.length > 0) {
        // For simplicity, divide amount equally among milestones
        // In a real implementation, you might want to specify amount per milestone
        const amountPerMilestone = amount / milestoneIds.length;
        
        for (const milestoneId of milestoneIds) {
          await Payment.allocateToMilestone(payment.id, milestoneId, amountPerMilestone);
        }
      }
      
      formatResponse(res, 201, 'Payment initialized successfully', { 
        payment: {
          id: payment.id,
          reference: payment.reference,
          amount: payment.amount,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      formatResponse(res, 500, 'Failed to initialize payment');
    }
  },

  /**
   * Verify payment status (simulated for mock integration)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyPayment(req, res) {
    try {
      const { reference } = req.params;
      
      // Get payment by reference
      const payment = await Payment.verifyByReference(reference);
      
      if (!payment) {
        return formatResponse(res, 404, 'Payment not found');
      }
      
      // In a real implementation, you would verify with a payment gateway
      // For demonstration, we'll simulate successful payment
      
      // Update payment status
      await Payment.updateStatus(payment.id, 'completed', {
        transactionId: `txn_${Date.now()}`,
        verifiedAt: new Date().toISOString()
      });
      
      // Update campaign funding
      await Campaign.updateFunding(payment.campaign_id, payment.amount);
      
      // Get updated payment
      const updatedPayment = await Payment.getById(payment.id);
      
      formatResponse(res, 200, 'Payment verified successfully', { 
        payment: updatedPayment
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      formatResponse(res, 500, 'Failed to verify payment');
    }
  },

  /**
   * Get payment details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPaymentDetails(req, res) {
    try {
      const { id } = req.params;
      
      const payment = await Payment.getById(id);
      
      if (!payment) {
        return formatResponse(res, 404, 'Payment not found');
      }
      
      // Check if user is authorized to view this payment
      // User must be the payer or the campaign owner
      const campaign = await Campaign.getById(payment.campaign_id);
      
      if (payment.user_id !== req.user.id && campaign.creator_id !== req.user.id) {
        return formatResponse(res, 403, 'You do not have permission to view this payment');
      }
      
      // Get milestone allocations if any
      const allocations = await Payment.getMilestoneAllocations(id);
      
      formatResponse(res, 200, 'Payment details retrieved successfully', { 
        payment,
        allocations,
        campaign: {
          id: campaign.id,
          title: campaign.title,
          imageUrl: campaign.imageUrl || campaign.images?.[0]?.url
        }
      });
    } catch (error) {
      console.error('Error getting payment details:', error);
      formatResponse(res, 500, 'Failed to retrieve payment details');
    }
  },

  /**
   * Get payments for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserPayments(req, res) {
    try {
      const payments = await Payment.getByUserId(req.user.id);
      
      formatResponse(res, 200, 'User payments retrieved successfully', { payments });
    } catch (error) {
      console.error('Error getting user payments:', error);
      formatResponse(res, 500, 'Failed to retrieve user payments');
    }
  },

  /**
   * Get payments for a campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCampaignPayments(req, res) {
    try {
      const { campaignId } = req.params;
      
      // Validate campaign exists
      const campaign = await Campaign.getById(campaignId);
      
      if (!campaign) {
        return formatResponse(res, 404, 'Campaign not found');
      }
      
      // Check if user is authorized to view campaign payments
      // Only campaign owner can see all payments
      if (campaign.creator_id !== req.user.id) {
        return formatResponse(res, 403, 'You do not have permission to view all payments for this campaign');
      }
      
      const payments = await Payment.getByCampaignId(campaignId);
      
      formatResponse(res, 200, 'Campaign payments retrieved successfully', { payments });
    } catch (error) {
      console.error('Error getting campaign payments:', error);
      formatResponse(res, 500, 'Failed to retrieve campaign payments');
    }
  },

  /**
   * Get campaign funding statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCampaignFundingStats(req, res) {
    try {
      const { campaignId } = req.params;
      
      // Validate campaign exists
      const campaign = await Campaign.getById(campaignId);
      
      if (!campaign) {
        return formatResponse(res, 404, 'Campaign not found');
      }
      
      // Get total investments
      const totalInvestments = await Payment.getCampaignTotalInvestments(campaignId);
      
      // Calculate funding percentage
      const fundingPercentage = campaign.targetAmount > 0 
        ? Math.round((totalInvestments / campaign.targetAmount) * 100) 
        : 0;
      
      // Get total contributors (unique investors)
      const [uniqueContributors] = await db.query(
        'SELECT COUNT(DISTINCT user_id) as count FROM payments WHERE campaign_id = ? AND status = "completed"',
        [campaignId]
      );
      
      formatResponse(res, 200, 'Campaign funding statistics retrieved successfully', {
        campaignId,
        targetAmount: campaign.targetAmount,
        currentAmount: totalInvestments,
        fundingPercentage,
        contributorCount: uniqueContributors[0].count
      });
    } catch (error) {
      console.error('Error getting campaign funding stats:', error);
      formatResponse(res, 500, 'Failed to retrieve campaign funding statistics');
    }
  }
};

module.exports = paymentController;