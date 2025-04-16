// src/routes/milestoneRoutes.js
const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const authMiddleware = require('../middleware/auth');

// All milestone routes require authentication
router.use(authMiddleware);

// GET /api/campaigns/:campaignId/milestones - Get all milestones for a campaign
router.get('/campaigns/:campaignId/milestones', milestoneController.getCampaignMilestones);

// POST /api/campaigns/:campaignId/milestones - Create a new milestone
router.post('/campaigns/:campaignId/milestones', milestoneController.createMilestone);

// GET /api/milestones/:id - Get a milestone by ID
router.get('/milestones/:id', milestoneController.getMilestone);

// PUT /api/milestones/:id - Update a milestone
router.put('/milestones/:id', milestoneController.updateMilestone);

// DELETE /api/milestones/:id - Delete a milestone
router.delete('/milestones/:id', milestoneController.deleteMilestone);

// PATCH /api/milestones/:id/status - Update milestone status
router.patch('/milestones/:id/status', milestoneController.updateMilestoneStatus);

module.exports = router;