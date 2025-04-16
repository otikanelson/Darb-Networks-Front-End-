// src/routes/draftCampaignRoutes.js
const express = require('express');
const router = express.Router();
const draftCampaignController = require('../controllers/draftCampaignController');
const { authenticateToken } = require('../middleware/auth');

// All draft routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/drafts/debug
 * @desc Get all draft campaigns with detailed info (for debugging)
 * @access Private 
 */
router.get('/debug', draftCampaignController.debugDrafts);

/**
 * @route GET /api/drafts
 * @desc Get all draft campaigns for the current user
 * @access Private
 */
router.get('/', draftCampaignController.getUserDrafts);

/**
 * @route GET /api/drafts/:id
 * @desc Get a draft campaign by ID
 * @access Private
 */
router.get('/:id', draftCampaignController.getDraft);

/**
 * @route POST /api/drafts
 * @desc Create a new draft campaign
 * @access Private
 */
router.post('/', draftCampaignController.createDraft);

/**
 * @route PUT /api/drafts/:id
 * @desc Update a draft campaign
 * @access Private
 */
router.put('/:id', draftCampaignController.updateDraft);

/**
 * @route DELETE /api/drafts/:id
 * @desc Delete a draft campaign
 * @access Private
 */
router.delete('/:id', draftCampaignController.deleteDraft);

/**
 * @route POST /api/drafts/:id/publish
 * @desc Publish a draft campaign (convert to active campaign)
 * @access Private
 */
router.post('/:id/publish', draftCampaignController.publishDraft);

module.exports = router;