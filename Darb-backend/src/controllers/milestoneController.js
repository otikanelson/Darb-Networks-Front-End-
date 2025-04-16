// src/controllers/milestoneController.js
const Milestone = require('../models/milestoneModel');
const Campaign = require('../models/campaignModel');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Milestone Controller - Handles milestone-related operations
 */
const milestoneController = {
  /**
   * Create a new milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createMilestone(req, res) {
    try {
      const { campaignId } = req.params;
      const milestoneData = req.body;
      
      // Validate campaign exists and user owns it
      const campaign = await Campaign.getById(campaignId);
      
      if (!campaign) {
        return formatResponse(res, 404, 'Campaign not found');
      }
      
      if (campaign.creator_id !== req.user.id) {
        return formatResponse(res, 403, 'You do not have permission to add milestones to this campaign');
      }
      
      // Create milestone
      const milestone = await Milestone.create({
        ...milestoneData,
        campaignId
      });
      
      formatResponse(res, 201, 'Milestone created successfully', { milestone });
    } catch (error) {
      console.error('Error creating milestone:', error);
      formatResponse(res, 500, 'Failed to create milestone');
    }
  },

  /**
   * Get milestones for a campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCampaignMilestones(req, res) {
    try {
      const { campaignId } = req.params;
      
      // Validate campaign exists
      const campaign = await Campaign.getById(campaignId);
      
      if (!campaign) {
        return formatResponse(res, 404, 'Campaign not found');
      }
      
      // Get milestones
      const milestones = await Milestone.getByCampaignId(campaignId);
      
      formatResponse(res, 200, 'Milestones retrieved successfully', { milestones });
    } catch (error) {
      console.error('Error getting milestones:', error);
      formatResponse(res, 500, 'Failed to retrieve milestones');
    }
  },

  /**
   * Get a milestone by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMilestone(req, res) {
    try {
      const { id } = req.params;
      
      const milestone = await Milestone.getById(id);
      
      if (!milestone) {
        return formatResponse(res, 404, 'Milestone not found');
      }
      
      formatResponse(res, 200, 'Milestone retrieved successfully', { milestone });
    } catch (error) {
      console.error('Error getting milestone:', error);
      formatResponse(res, 500, 'Failed to retrieve milestone');
    }
  },

  /**
   * Update a milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateMilestone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get milestone and campaign
      const milestone = await Milestone.getById(id);
      
      if (!milestone) {
        return formatResponse(res, 404, 'Milestone not found');
      }
      
      // Check if user owns the campaign
      const campaign = await Campaign.getById(milestone.campaign_id);
      
      if (campaign.creator_id !== req.user.id) {
        return formatResponse(res, 403, 'You do not have permission to update this milestone');
      }
      
      // Update milestone
      const success = await Milestone.update(id, updateData);
      
      if (!success) {
        return formatResponse(res, 400, 'No valid fields to update');
      }
      
      // Get updated milestone
      const updatedMilestone = await Milestone.getById(id);
      
      formatResponse(res, 200, 'Milestone updated successfully', { milestone: updatedMilestone });
    } catch (error) {
      console.error('Error updating milestone:', error);
      formatResponse(res, 500, 'Failed to update milestone');
    }
  },

  /**
   * Delete a milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteMilestone(req, res) {
    try {
      const { id } = req.params;
      
      // Get milestone and campaign
      const milestone = await Milestone.getById(id);
      
      if (!milestone) {
        return formatResponse(res, 404, 'Milestone not found');
      }
      
      // Check if user owns the campaign
      const campaign = await Campaign.getById(milestone.campaign_id);
      
      if (campaign.creator_id !== req.user.id) {
        return formatResponse(res, 403, 'You do not have permission to delete this milestone');
      }
      
      // Delete milestone
      const success = await Milestone.delete(id);
      
      if (!success) {
        return formatResponse(res, 400, 'Failed to delete milestone');
      }
      
      formatResponse(res, 200, 'Milestone deleted successfully');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      formatResponse(res, 500, 'Failed to delete milestone');
    }
  },

  /**
   * Update milestone status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateMilestoneStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'in_progress', 'completed', 'verified'].includes(status)) {
        return formatResponse(res, 400, 'Invalid status. Must be one of: pending, in_progress, completed, verified');
      }
      
      // Get milestone and campaign
      const milestone = await Milestone.getById(id);
      
      if (!milestone) {
        return formatResponse(res, 404, 'Milestone not found');
      }
      
      // Check if user owns the campaign (for most status changes)
      // or is an admin (for verification)
      const campaign = await Campaign.getById(milestone.campaign_id);
      
      if (status === 'verified') {
        // Only admins can verify milestones
        if (!req.user.isAdmin) {
          return formatResponse(res, 403, 'Only administrators can verify milestones');
        }
      } else {
        // For other status changes, user must own the campaign
        if (campaign.creator_id !== req.user.id) {
          return formatResponse(res, 403, 'You do not have permission to update this milestone');
        }
      }
      
      // Update milestone status
      const success = await Milestone.updateStatus(id, status);
      
      if (!success) {
        return formatResponse(res, 400, 'Failed to update milestone status');
      }
      
      // Get updated milestone
      const updatedMilestone = await Milestone.getById(id);
      
      formatResponse(res, 200, 'Milestone status updated successfully', { milestone: updatedMilestone });
    } catch (error) {
      console.error('Error updating milestone status:', error);
      formatResponse(res, 500, 'Failed to update milestone status');
    }
  }
};

module.exports = milestoneController;