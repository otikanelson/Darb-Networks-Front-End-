// src/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const mediaController = require('../controllers/mediaController');
const { authenticateToken } = require('../middleware/auth');

// Protect all media routes
router.use(authenticateToken);

// Upload campaign image
router.post(
  '/campaign-image',
  upload.single('image'),
  handleUploadError,
  mediaController.uploadCampaignImage
);

// Upload profile image
router.post(
  '/profile-image',
  upload.single('image'),
  handleUploadError,
  mediaController.uploadProfileImage
);

// Upload business document
router.post(
  '/document',
  upload.single('document'),
  handleUploadError,
  mediaController.uploadDocument
);

// Process base64 image
router.post(
  '/base64',
  mediaController.processBase64Image
);

router.get('/file/:filename', mediaController.getFileInfo);

module.exports = router;