// src/utils/imageOptimizer.js

/**
 * Utility for optimizing images before storage in Firestore or localStorage
 * Addresses the "Request payload size exceeds the limit" and "Storage quota exceeded" errors
 */

/**
 * Compresses and resizes an image to reduce its size
 * @param {File|Blob} imageFile - The original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1200)
 * @param {number} options.quality - JPEG quality from 0 to 1 (default: 0.7)
 * @param {string} options.type - Output format (default: 'image/jpeg')
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (imageFile, options = {}) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.7,
      type = 'image/jpeg'
    } = options;
  
    return new Promise((resolve, reject) => {
      // Create image from file
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      
      img.onload = () => {
        // Release object URL to prevent memory leaks
        URL.revokeObjectURL(img.src);
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF'; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new file with the original name but compressed data
              const newFile = new File(
                [blob], 
                imageFile.name || `compressed-image.${type.split('/')[1]}`,
                { type }
              );
              resolve(newFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          type,
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for compression'));
      };
    });
  };
  
  /**
   * Creates a thumbnail from an image file
   * @param {File|Blob} imageFile - The original image file
   * @param {number} size - Thumbnail size in pixels (default: 200)
   * @returns {Promise<Blob>} - Thumbnail blob
   */
  export const createThumbnail = (imageFile, size = 200) => {
    return compressImage(imageFile, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.6,
      type: 'image/jpeg'
    });
  };
  
  /**
   * Convert image to base64 data URL representation
   * @param {File|Blob} imageFile - The image file to convert
   * @returns {Promise<string>} - Base64 data URL
   */
  export const imageToDataUrl = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };
  
  /**
   * Process campaign images for optimal storage
   * @param {Object} campaignData - The campaign data to process
   * @returns {Promise<Object>} - Campaign data with optimized images
   */
  export const processCampaignImages = async (campaignData) => {
    try {
      const processedData = { ...campaignData };
      
      // Process main campaign images
      if (processedData.images && processedData.images.length > 0) {
        const optimizedImages = await Promise.all(
          processedData.images.map(async (image) => {
            if (image.file) {
              // Compress the image
              const compressedFile = await compressImage(image.file, {
                maxWidth: 1200,
                maxHeight: 800,
                quality: 0.7
              });
              
              // Generate a thumbnail
              const thumbnailFile = await createThumbnail(image.file, 300);
              
              // Convert to data URLs (only if needed - consider using Firebase Storage instead)
              const preview = await imageToDataUrl(thumbnailFile);
              
              return {
                ...image,
                file: compressedFile, // Keep the file reference for potential upload to storage
                preview,  // Thumbnail as data URL
                optimized: true
              };
            }
            return image;
          })
        );
        
        processedData.images = optimizedImages;
      }
      
      // Process pitch asset
      if (processedData.pitchAsset && processedData.pitchAsset.file) {
        if (processedData.pitchAsset.type === 'image') {
          const compressedFile = await compressImage(processedData.pitchAsset.file);
          const preview = await imageToDataUrl(compressedFile);
          
          processedData.pitchAsset = {
            ...processedData.pitchAsset,
            file: compressedFile,
            preview,
            optimized: true
          };
        }
        // For video assets, consider using a video hosting service instead of base64
      }
      
      // Process milestone images
      if (processedData.financials && processedData.financials.milestones) {
        processedData.financials.milestones = await Promise.all(
          processedData.financials.milestones.map(async (milestone) => {
            if (milestone.image && milestone.image.file) {
              const compressedFile = await compressImage(milestone.image.file);
              const preview = await imageToDataUrl(compressedFile);
              
              return {
                ...milestone,
                image: {
                  ...milestone.image,
                  file: compressedFile,
                  preview,
                  optimized: true
                }
              };
            }
            return milestone;
          })
        );
      }
      
      // Process team member images
      if (processedData.team && processedData.team.length > 0) {
        processedData.team = await Promise.all(
          processedData.team.map(async (member) => {
            if (member.image && member.image.file) {
              const compressedFile = await compressImage(member.image.file, {
                maxWidth: 300,
                maxHeight: 300,
                quality: 0.7
              });
              const preview = await imageToDataUrl(compressedFile);
              
              return {
                ...member,
                image: {
                  ...member.image,
                  file: compressedFile,
                  preview,
                  optimized: true
                }
              };
            }
            return member;
          })
        );
      }
      
      return processedData;
    } catch (error) {
      console.error('Error processing campaign images:', error);
      throw error;
    }
  };
  
  /**
   * Clean up localStorage by removing old campaigns to make space for new ones
   * @returns {boolean} - Whether cleanup was successful
   */
  export const cleanupLocalStorage = () => {
    try {
      // Get current campaigns
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      
      // If too many campaigns, keep only the most recent ones
      if (campaigns.length > 10) {
        const recentCampaigns = campaigns.slice(-10); // Keep only the 10 most recent
        localStorage.setItem('campaigns', JSON.stringify(recentCampaigns));
        console.log(`Cleaned up localStorage, keeping ${recentCampaigns.length} campaigns`);
      }
      
      // Clean up other potential large items
      const keysToCheck = ['viewedCampaigns', 'favoriteCampaigns'];
      keysToCheck.forEach(key => {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (items.length > 20) {
          localStorage.setItem(key, JSON.stringify(items.slice(-20)));
          console.log(`Cleaned up ${key}, keeping 20 items`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
      return false;
    }
  };
  
  /**
   * Calculate the approximate size of campaign data (in bytes)
   * @param {Object} campaignData - The campaign data
   * @returns {number} - Estimated size in bytes
   */
  export const estimateCampaignSize = (campaignData) => {
    // Convert to JSON string to get a better size estimate
    const campaignString = JSON.stringify(campaignData);
    return new Blob([campaignString]).size;
  };
  
  /**
   * Check if campaign data is too large for Firestore (limit is around 1MB per document)
   * @param {Object} campaignData - The campaign data
   * @returns {boolean} - Whether the campaign is too large
   */
  export const isCampaignTooLarge = (campaignData) => {
    const size = estimateCampaignSize(campaignData);
    const MAX_FIRESTORE_SIZE = 1000000; // 1MB in bytes
    return size > MAX_FIRESTORE_SIZE;
  };