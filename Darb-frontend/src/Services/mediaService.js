// src/services/mediaService.js
/**
 * Media service for handling file uploads and media operations
 * Updated to match the backend mediaController.js implementation
 */
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

class MediaService {
  /**
   * Upload a campaign image
   * @param {File} imageFile - The image file
   * @returns {Promise<Object>} - Upload result with image URL
   */
  static async uploadCampaignImage(imageFile) {
    try {
      const response = await ApiService.uploadFiles(
        API_ENDPOINTS.MEDIA.CAMPAIGN_IMAGE,
        { image: imageFile }
      );
      
      return response;
    } catch (error) {
      console.error("Error uploading campaign image:", error);
      throw new Error('Failed to upload campaign image');
    }
  }

  /**
   * Upload a profile image
   * @param {File} imageFile - The image file
   * @returns {Promise<Object>} - Upload result with image URL
   */
  static async uploadProfileImage(imageFile) {
    try {
      const response = await ApiService.uploadFiles(
        API_ENDPOINTS.MEDIA.PROFILE_IMAGE,
        { image: imageFile }
      );
      
      return response;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error('Failed to upload profile image');
    }
  }

  /**
   * Upload a document
   * @param {File} documentFile - The document file
   * @returns {Promise<Object>} - Upload result with document URL
   */
  static async uploadDocument(documentFile) {
    try {
      const response = await ApiService.uploadFiles(
        API_ENDPOINTS.MEDIA.DOCUMENT,
        { document: documentFile }
      );
      
      return response;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw new Error('Failed to upload document');
    }
  }
  
  /**
   * Process base64 image
   * @param {string} base64String - Base64 encoded image
   * @param {string} type - Type of image (campaigns, profiles)
   * @returns {Promise<Object>} - Result with image URL
   */
  static async processBase64Image(base64String, type = 'campaigns') {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.MEDIA.BASE64,
        { base64String, type }
      );
      
      return response;
    } catch (error) {
      console.error("Error processing base64 image:", error);
      throw new Error('Failed to process base64 image');
    }
  }
  
  /**
   * Convert a file to base64 string
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 string
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  
  /**
   * Get file size in readable format
   * @param {File} file - The file to check
   * @returns {string} - Human-readable file size
   */
  static getReadableFileSize(file) {
    const bytes = file.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }
  
  /**
   * Validate file size
   * @param {File} file - The file to validate
   * @param {number} maxSizeInMB - Maximum size in megabytes (default 5MB matching backend limit)
   * @returns {boolean} - Whether the file size is valid
   */
  static validateFileSize(file, maxSizeInMB = 5) {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
  
  /**
   * Validate file type
   * @param {File} file - The file to validate
   * @param {Array<string>} allowedTypes - Allowed MIME types
   * @returns {boolean} - Whether the file type is valid
   */
  static validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }
}

export default MediaService;