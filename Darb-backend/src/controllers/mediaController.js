// src/controllers/mediaController.js
const { formatResponse } = require('../utils/responseFormatter');
const fileHelper = require('../utils/fileHelper');
const db = require('../config/database');
const path = require('path'); // Add path module
const fs = require('fs'); // Add fs module

/**
 * Controller for media uploads and processing
 */
const mediaController = {
  /**
   * Upload campaign image
   */
  async uploadCampaignImage(req, res) {
    try {
      if (!req.file) {
        return formatResponse(res, 400, 'No image file provided');
      }
      
      // Calculate relative path for database storage
      const filePath = `/uploads/campaigns/${req.file.filename}`;
      
      formatResponse(res, 200, 'Image uploaded successfully', {
        imageUrl: filePath
      });
    } catch (error) {
      console.error('Error uploading campaign image:', error);
      formatResponse(res, 500, 'Failed to upload image');
    }
  },
  
  /**
   * Upload profile image
   */
  async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return formatResponse(res, 400, 'No image file provided');
      }
      
      // Calculate relative path for database storage
      const filePath = `/uploads/profiles/${req.file.filename}`;
      
      // Update user profile with new image URL
      await db.pool.query(
        'UPDATE users SET profile_image_url = ? WHERE id = ?',
        [filePath, req.user.id]
      );
      
      formatResponse(res, 200, 'Profile image updated successfully', {
        imageUrl: filePath
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      formatResponse(res, 500, 'Failed to update profile image');
    }
  },
  
  /**
   * Upload business document
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return formatResponse(res, 400, 'No document file provided');
      }
      
      // Calculate relative path for database storage
      const filePath = `/uploads/documents/${req.file.filename}`;
      
      formatResponse(res, 200, 'Document uploaded successfully', {
        documentUrl: filePath
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      formatResponse(res, 500, 'Failed to upload document');
    }
  },

  /**
   * Get file information
   */
  async getFileInfo(req, res) {
    try {
      const { filename } = req.params;
      
      // Prevent path traversal attacks
      if (filename.includes('..') || filename.includes('/')) {
        return formatResponse(res, 400, 'Invalid filename');
      }
      
      // Check if file exists in any of the upload directories
      const directories = ['campaigns', 'profiles', 'documents'];
      let filePath = null;
      
      for (const dir of directories) {
        const fullPath = path.join(fileHelper.UPLOAD_DIR, dir, filename);
        if (fs.existsSync(fullPath)) {
          filePath = `/uploads/${dir}/${filename}`;
          break;
        }
      }
      
      if (!filePath) {
        return formatResponse(res, 404, 'File not found');
      }
      
      // Return file info
      formatResponse(res, 200, 'File info retrieved', {
        url: filePath,
        filename: filename
      });
    } catch (error) {
      console.error('Error getting file info:', error);
      formatResponse(res, 500, 'Failed to get file info');
    }
  },
  
  /**
   * Process base64 image
   */
  async processBase64Image(req, res) {
    try {
      const { base64String, type = 'campaigns' } = req.body;
      
      if (!base64String) {
        return formatResponse(res, 400, 'No base64 string provided');
      }
      
      // Save base64 to file
      const filePath = await fileHelper.saveBase64Image(base64String, type);
      
      formatResponse(res, 200, 'Image processed successfully', {
        imageUrl: filePath
      });
    } catch (error) {
      console.error('Error processing base64 image:', error);
      formatResponse(res, 500, 'Failed to process image');
    }
  }
};

module.exports = mediaController;