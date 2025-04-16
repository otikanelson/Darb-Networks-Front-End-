// src/routes/userRoutes.js
const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Update user profile
router.put('/profile', updateProfile);

module.exports = router;