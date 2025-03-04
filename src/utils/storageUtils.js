// src/utils/storageUtils.js - Updated storage utilities

/**
 * Check available localStorage space and usage
 * @returns {Object} Object containing total used bytes and percentage of limit
 */
export const checkStorageSpace = () => {
  try {
    let total = 0;
    const items = { ...localStorage };
    
    // Calculate total bytes used
    for (let key in items) {
      if (localStorage.hasOwnProperty(key)) {
        // Get the size of this item in bytes
        const itemSize = new Blob([localStorage[key]]).size;
        total += itemSize;
      }
    }
    
    // Most browsers have ~5MB limit for localStorage
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const percentUsed = (total / maxSize) * 100;
    
    return {
      totalBytes: total,
      bytesFormatted: formatBytes(total),
      percentUsed: percentUsed.toFixed(2),
      isNearLimit: percentUsed > 80, // Flag if we're close to the limit
      isCritical: percentUsed > 90, // Flag if we're in critical territory
      details: Object.keys(items).map(key => ({
        key,
        size: new Blob([localStorage[key]]).size,
        sizeFormatted: formatBytes(new Blob([localStorage[key]]).size)
      })).sort((a, b) => b.size - a.size) // Sort biggest first
    };
  } catch (error) {
    console.error('Error checking storage space:', error);
    return { 
      totalBytes: 0, 
      bytesFormatted: '0 B', 
      percentUsed: 0,
      isNearLimit: false,
      isCritical: false,
      details: []
    };
  }
};

/**
 * Format bytes into human-readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Decimal places to show (default: 2)
 * @returns {string} Formatted string
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Clean up campaigns in localStorage to conserve space
 * @param {number} keepCount - Number of campaigns to keep (default: 10)
 * @returns {boolean} Success status
 */
export const cleanupCampaigns = (keepCount = 10) => {
  try {
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    
    if (campaigns.length <= keepCount) {
      return true; // No cleanup needed
    }
    
    // Sort by creation date (newest first) and keep only the most recent ones
    const sortedCampaigns = campaigns.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    const campaignsToKeep = sortedCampaigns.slice(0, keepCount);
    localStorage.setItem('campaigns', JSON.stringify(campaignsToKeep));
    
    console.log(`Cleaned up campaigns, kept ${campaignsToKeep.length} of ${campaigns.length}`);
    return true;
  } catch (error) {
    console.error('Error cleaning up campaigns:', error);
    return false;
  }
};

/**
 * Clean up all campaign-related items in localStorage
 * @returns {Object} Results of cleanup
 */
export const performFullCleanup = () => {
  const results = {
    campaignsCleaned: false,
    viewedCleaned: false,
    favoritesCleaned: false,
    totalSpaceFreed: 0
  };
  
  try {
    // Get storage space before cleanup
    const beforeCleanup = checkStorageSpace().totalBytes;
    
    // Clean up campaigns
    results.campaignsCleaned = cleanupCampaigns(5); // Keep only 5 most recent
    
    // Clean viewed campaigns (global and per-user)
    const viewedGlobal = JSON.parse(localStorage.getItem('viewedCampaigns') || '[]');
    if (viewedGlobal.length > 10) {
      localStorage.setItem('viewedCampaigns', JSON.stringify(viewedGlobal.slice(-10)));
      results.viewedCleaned = true;
    }
    
    // Clean all user-specific viewed campaigns
    const userViewedKeys = Object.keys(localStorage).filter(key => key.includes('_viewedCampaigns'));
    userViewedKeys.forEach(key => {
      const viewed = JSON.parse(localStorage.getItem(key) || '[]');
      if (viewed.length > 10) {
        localStorage.setItem(key, JSON.stringify(viewed.slice(-10)));
        results.viewedCleaned = true;
      }
    });
    
    // Clean all user-specific favorites
    const userFavoriteKeys = Object.keys(localStorage).filter(key => key.includes('_favoriteCampaigns'));
    userFavoriteKeys.forEach(key => {
      const favorites = JSON.parse(localStorage.getItem(key) || '[]');
      if (favorites.length > 20) {
        localStorage.setItem(key, JSON.stringify(favorites.slice(-20)));
        results.favoritesCleaned = true;
      }
    });
    
    // Calculate space freed
    const afterCleanup = checkStorageSpace().totalBytes;
    results.totalSpaceFreed = beforeCleanup - afterCleanup;
    
    return results;
  } catch (error) {
    console.error('Error during full cleanup:', error);
    return results;
  }
};

/**
 * Compress large base64 image data URLs
 * @param {Object} dataObj - Object containing image data URLs
 * @returns {Object} Compressed object
 */
export const compressStoredImages = async (dataObj) => {
  if (!dataObj || typeof dataObj !== 'object') {
    return dataObj;
  }
  
  const compressImage = async (dataUrl, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      // Skip if not a data URL for images
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
        resolve(dataUrl);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if needed
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get as JPEG with quality setting
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => resolve(dataUrl); // Return original on error
      img.src = dataUrl;
    });
  };
  
  // Deep clone to avoid mutating the original
  const result = JSON.parse(JSON.stringify(dataObj));
  
  // Process campaign images
  if (result.images && Array.isArray(result.images)) {
    for (let i = 0; i < result.images.length; i++) {
      if (result.images[i] && result.images[i].preview) {
        result.images[i].preview = await compressImage(result.images[i].preview);
      }
    }
  }
  
  // Process team member images
  if (result.team && Array.isArray(result.team)) {
    for (let i = 0; i < result.team.length; i++) {
      if (result.team[i].image && result.team[i].image.preview) {
        result.team[i].image.preview = await compressImage(result.team[i].image.preview, 400, 0.6);
      }
    }
  }
  
  // Process milestone images
  if (result.financials && result.financials.milestones && Array.isArray(result.financials.milestones)) {
    for (let i = 0; i < result.financials.milestones.length; i++) {
      const milestone = result.financials.milestones[i];
      if (milestone.image && milestone.image.preview) {
        result.financials.milestones[i].image.preview = await compressImage(milestone.image.preview, 600, 0.6);
      }
    }
  }
  
  // Process pitch asset if it's an image
  if (result.pitchAsset && result.pitchAsset.type === 'image' && result.pitchAsset.preview) {
    result.pitchAsset.preview = await compressImage(result.pitchAsset.preview, 1000, 0.8);
  }
  
  return result;
};

/**
 * Check and clean up localStorage if needed before a critical operation
 * @returns {boolean} Whether cleanup was successful
 */
export const checkAndCleanBeforeOperation = async () => {
  const storageStatus = checkStorageSpace();
  
  if (storageStatus.isCritical) {
    // Critical - perform full cleanup
    console.log('Critical storage situation detected, performing full cleanup...');
    const cleanupResults = performFullCleanup();
    console.log('Cleanup results:', cleanupResults);
    
    // If we're still critical after cleanup, try to remove the oldest campaigns
    if (checkStorageSpace().isCritical) {
      cleanupCampaigns(3); // Keep only 3 most recent if still critical
    }
    
    return !checkStorageSpace().isCritical;
  } else if (storageStatus.isNearLimit) {
    // Near limit - perform standard cleanup
    console.log('Storage nearly full, performing standard cleanup...');
    cleanupCampaigns(10);
    return true;
  }
  
  // No cleanup needed
  return true;
};