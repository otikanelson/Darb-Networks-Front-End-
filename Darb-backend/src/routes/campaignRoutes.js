
const express = require('express');
const router = express.Router();
const { 
  createCampaign,
  getCampaigns,
  getMyCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getMostViewedCampaigns  // Add this new controller method
} = require('../controllers/campaignController');
const { authenticateToken, isFounder } = require('../middleware/auth');

// Public routes
router.get('/', getCampaigns);
router.get('/most-viewed', getMostViewedCampaigns);  // Add new route for most viewed campaigns
router.get('/:id', getCampaign);

// Protected routes
router.use(authenticateToken);
router.get('/user/my-campaigns', getMyCampaigns);

// Founder-only routes
router.post('/', isFounder, createCampaign);
router.put('/:id', isFounder, updateCampaign);
router.delete('/:id', isFounder, deleteCampaign);

module.exports = router;