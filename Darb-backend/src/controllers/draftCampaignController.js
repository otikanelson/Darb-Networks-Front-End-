// src/controllers/draftCampaignController.js
const DraftCampaign = require('../models/draftCampaignModel');
const { formatResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Controller for managing draft campaigns
 */
const draftCampaignController = {
  /**
   * Create a new draft campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createDraft(req, res) {
    try {
      const campaignData = req.body;
      const userId = req.user.id;
      
      logger.info(`Creating draft campaign for user ${userId}`, { userId });
      
      if (!campaignData) {
        return formatResponse(res, 400, 'No campaign data provided');
      }
      
      // Log important fields for debugging
      logger.debug(`Draft campaign data`, { 
        title: campaignData.title, 
        category: campaignData.category,
        userId
      });
      
      const draft = await DraftCampaign.create(campaignData, userId);
      
      logger.info(`Draft created successfully with ID: ${draft.id}`, { draftId: draft.id, userId });
      return formatResponse(res, 201, 'Draft saved successfully', { draft });
    } catch (error) {
      logger.error('Error creating draft campaign:', error);
      return formatResponse(res, 500, `Failed to save draft campaign: ${error.message}`);
    }
  },
  
  /**
   * Get a draft campaign by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDraft(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      logger.info(`Getting draft ${id} for user ${userId}`, { draftId: id, userId });
      
      const draft = await DraftCampaign.getById(id);
      
      if (!draft) {
        logger.warn(`Draft ${id} not found`, { draftId: id });
        return formatResponse(res, 404, 'Draft not found');
      }
      
      // Check if user owns the draft
      if (draft.creator.id !== userId) {
        logger.warn(`User ${userId} attempted to access draft ${id} without permission`, { draftId: id, userId });
        return formatResponse(res, 403, 'You do not have permission to access this draft');
      }
      
      logger.info(`Draft ${id} retrieved successfully for user ${userId}`, { draftId: id, userId });
      return formatResponse(res, 200, 'Draft retrieved successfully', { draft });
    } catch (error) {
      logger.error('Error getting draft campaign:', error);
      return formatResponse(res, 500, `Failed to retrieve draft campaign: ${error.message}`);
    }
  },

  /**
 * Publish a draft campaign (convert to active campaign)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async publishDraft(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info(`Publishing draft ${id} for user ${userId}`, { draftId: id, userId });
    
    // Check if draft exists
    const existingDraft = await DraftCampaign.getById(id);
    
    if (!existingDraft) {
      logger.warn(`Draft ${id} not found for publishing`, { draftId: id });
      return formatResponse(res, 404, 'Draft not found');
    }
    
    // Check if user owns the draft
    if (existingDraft.creator.id !== userId) {
      logger.warn(`User ${userId} attempted to publish draft ${id} without permission`, { draftId: id, userId });
      return formatResponse(res, 403, 'You do not have permission to publish this draft');
    }
    
    try {
      // Publish the draft - this includes deletion in the model
      const campaign = await DraftCampaign.publish(id);
      
      logger.info(`Draft ${id} published successfully as campaign ${campaign.id} by user ${userId}`, { 
        draftId: id, 
        campaignId: campaign.id, 
        userId 
      });
      
      // Double-check that the draft was deleted
      try {
        const draftAfterPublish = await DraftCampaign.getById(id);
        if (draftAfterPublish) {
          logger.warn(`Draft ${id} was not deleted after publishing - manually deleting it now`, {
            draftId: id,
            campaignId: campaign.id
          });
          
          // Try to delete it again
          await DraftCampaign.delete(id);
        }
      } catch (checkError) {
        // This is actually good - it means the draft was already deleted
        logger.debug(`Draft ${id} was successfully deleted after publishing`, { draftId: id });
      }
      
      return formatResponse(res, 200, 'Campaign published successfully and pending admin approval', { campaign });
    } catch (error) {
      logger.error(`Error in draft publication process: ${error.message}`, { 
        draftId: id, 
        userId,
        error
      });
      
      // Try one more time to delete the draft, just to be sure
      try {
        await DraftCampaign.delete(id);
        logger.info(`Draft ${id} deleted after failed publish attempt`, { draftId: id });
      } catch (deleteError) {
        logger.error(`Failed to delete draft ${id} after failed publish attempt`, {
          draftId: id,
          error: deleteError
        });
      }
      
      return formatResponse(res, 500, `Failed to publish campaign: ${error.message}`);
    }
  } catch (error) {
    logger.error('Error publishing draft campaign:', error);
    return formatResponse(res, 500, `Failed to publish campaign: ${error.message}`);
  }
},
  
  /**
   * Get all draft campaigns for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserDrafts(req, res) {
    try {
      const userId = req.user.id;
      
      logger.info(`Getting all drafts for user ${userId}`, { userId });
      
      const drafts = await DraftCampaign.getByUserId(userId);
      
      logger.info(`Found ${drafts.length} drafts for user ${userId}`, { userId, draftCount: drafts.length });
      
      // Log the first draft for debugging if available
      if (drafts.length > 0) {
        logger.debug(`First draft details`, { 
          draftId: drafts[0].id, 
          title: drafts[0].title,
          userId
        });
      }
      
      return formatResponse(res, 200, 'Drafts retrieved successfully', { drafts });
    } catch (error) {
      logger.error('Error getting user drafts:', error);
      return formatResponse(res, 500, `Failed to retrieve drafts: ${error.message}`);
    }
  },
  
  /**
   * Update a draft campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateDraft(req, res) {
    try {
      const { id } = req.params;
      const campaignData = req.body;
      const userId = req.user.id;
      
      logger.info(`Updating draft ${id} for user ${userId}`, { draftId: id, userId });
      
      // Check if draft exists
      const existingDraft = await DraftCampaign.getById(id);
      
      if (!existingDraft) {
        logger.warn(`Draft ${id} not found for update`, { draftId: id });
        return formatResponse(res, 404, 'Draft not found');
      }
      
      // Check if user owns the draft
      if (existingDraft.creator.id !== userId) {
        logger.warn(`User ${userId} attempted to modify draft ${id} without permission`, { draftId: id, userId });
        return formatResponse(res, 403, 'You do not have permission to modify this draft');
      }
      
      // Update the draft
      const updatedDraft = await DraftCampaign.update(id, campaignData);
      
      logger.info(`Draft ${id} updated successfully by user ${userId}`, { draftId: id, userId });
      return formatResponse(res, 200, 'Draft updated successfully', { draft: updatedDraft });
    } catch (error) {
      logger.error('Error updating draft campaign:', error);
      return formatResponse(res, 500, `Failed to update draft campaign: ${error.message}`);
    }
  },
  
  /**
   * Delete a draft campaign
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteDraft(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      logger.info(`Deleting draft ${id} for user ${userId}`, { draftId: id, userId });
      
      // Check if draft exists
      const existingDraft = await DraftCampaign.getById(id);
      
      if (!existingDraft) {
        logger.warn(`Draft ${id} not found for deletion`, { draftId: id });
        return formatResponse(res, 404, 'Draft not found');
      }
      
      // Check if user owns the draft
      if (existingDraft.creator.id !== userId) {
        logger.warn(`User ${userId} attempted to delete draft ${id} without permission`, { draftId: id, userId });
        return formatResponse(res, 403, 'You do not have permission to delete this draft');
      }
      
      // Delete the draft
      await DraftCampaign.delete(id);
      
      logger.info(`Draft ${id} deleted successfully by user ${userId}`, { draftId: id, userId });
      return formatResponse(res, 200, 'Draft deleted successfully');
    } catch (error) {
      logger.error('Error deleting draft campaign:', error);
      return formatResponse(res, 500, `Failed to delete draft campaign: ${error.message}`);
    }
  },
  
  /**
   * Publish a draft campaign (convert to active campaign)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async publishDraft(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      logger.info(`Publishing draft ${id} for user ${userId}`, { draftId: id, userId });
      
      // Check if draft exists
      const existingDraft = await DraftCampaign.getById(id);
      
      if (!existingDraft) {
        logger.warn(`Draft ${id} not found for publishing`, { draftId: id });
        return formatResponse(res, 404, 'Draft not found');
      }
      
      // Check if user owns the draft
      if (existingDraft.creator.id !== userId) {
        logger.warn(`User ${userId} attempted to publish draft ${id} without permission`, { draftId: id, userId });
        return formatResponse(res, 403, 'You do not have permission to publish this draft');
      }
      
      // Publish the draft
      // The status will be set to 'pending_approval' in the draftCampaignModel.publish method
      const campaign = await DraftCampaign.publish(id);
      
      logger.info(`Draft ${id} published successfully as campaign ${campaign.id} by user ${userId}`, { 
        draftId: id, 
        campaignId: campaign.id, 
        userId 
      });
      
      return formatResponse(res, 200, 'Campaign published successfully and pending admin approval', { campaign });
    } catch (error) {
      logger.error('Error publishing draft campaign:', error);
      return formatResponse(res, 500, `Failed to publish campaign: ${error.message}`);
    }
  },
  
  /**
   * Debug endpoint for checking draft campaign system
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async debugDrafts(req, res) {
    try {
      const userId = req.user.id;
      
      // Get all drafts for this user with detailed info
      const [drafts] = await db.query(
        'SELECT * FROM draft_campaigns WHERE creator_id = ?',
        [userId]
      );
      
      // Get table information
      const [tables] = await db.query('SHOW TABLES LIKE "draft_%"');
      
      // Check if the drafts table has any rows
      const [count] = await db.query('SELECT COUNT(*) as count FROM draft_campaigns');
      
      return res.json({
        message: 'Debug info for draft campaigns',
        user_id: userId,
        count: count[0].count,
        tables: tables.map(t => Object.values(t)[0]),
        drafts: drafts
      });
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }
};

module.exports = draftCampaignController;