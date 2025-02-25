// src/utils/storageUtils.js

// Check available storage space
export const checkStorageSpace = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  };
  
  // Clean up old campaigns
  export const cleanupOldCampaigns = () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      
      // Keep only the most recent 20 campaigns
      const recentCampaigns = campaigns.slice(-20);
      
      // Optimize images in remaining campaigns
      const optimizedCampaigns = recentCampaigns.map(campaign => ({
        ...campaign,
        images: campaign.images?.map(img => ({
          ...img,
          preview: optimizeImageUrl(img.preview)
        })) || [],
        team: campaign.team?.map(member => ({
          ...member,
          image: member.image ? {
            ...member.image,
            preview: optimizeImageUrl(member.image.preview)
          } : null
        }))
      }));
  
      localStorage.setItem('campaigns', JSON.stringify(optimizedCampaigns));
      return true;
    } catch (error) {
      console.error('Error cleaning up campaigns:', error);
      return false;
    }
  };
  
  // Optimize image URL by reducing quality/size
  const optimizeImageUrl = (dataUrl) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize if too large
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Reduce quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };
  
  // Check if storage cleanup is needed before saving
  export const checkAndCleanupStorage = async () => {
    const storageUsed = checkStorageSpace();
    const storageLimit = 4 * 1024 * 1024; // 4MB threshold
    
    if (storageUsed > storageLimit) {
      return cleanupOldCampaigns();
    }
    return true;
  };