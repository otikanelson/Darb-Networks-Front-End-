// src/services/campaignService.js

// Get user's viewed campaigns
export const getViewedCampaigns = (userId) => {
    try {
      const viewedCampaigns = JSON.parse(localStorage.getItem('viewedCampaigns') || '{}');
      return viewedCampaigns[userId] || [];
    } catch (error) {
      console.error('Error getting viewed campaigns:', error);
      return [];
    }
  };
  
  // Track campaign view
  export const trackCampaignView = (campaignId, userId) => {
    try {
      const viewedCampaigns = JSON.parse(localStorage.getItem('viewedCampaigns') || '{}');
      const userViews = viewedCampaigns[userId] || [];
      
      // Add to viewed campaigns if not already viewed
      if (!userViews.includes(campaignId)) {
        viewedCampaigns[userId] = [campaignId, ...userViews];
        localStorage.setItem('viewedCampaigns', JSON.stringify(viewedCampaigns));
      }
    } catch (error) {
      console.error('Error tracking campaign view:', error);
    }
  };
  
  // Get user's favorite campaigns
  export const getFavoriteCampaigns = (userId) => {
    try {
      const favoriteCampaigns = JSON.parse(localStorage.getItem('favoriteCampaigns') || '{}');
      return favoriteCampaigns[userId] || [];
    } catch (error) {
      console.error('Error getting favorite campaigns:', error);
      return [];
    }
  };
  
  // Toggle campaign favorite
  export const toggleFavoriteCampaign = (campaignId, userId) => {
    try {
      const favoriteCampaigns = JSON.parse(localStorage.getItem('favoriteCampaigns') || '{}');
      const userFavorites = favoriteCampaigns[userId] || [];
      
      const isFavorited = userFavorites.includes(campaignId);
      if (isFavorited) {
        // Remove from favorites
        favoriteCampaigns[userId] = userFavorites.filter(id => id !== campaignId);
      } else {
        // Add to favorites
        favoriteCampaigns[userId] = [campaignId, ...userFavorites];
      }
      
      localStorage.setItem('favoriteCampaigns', JSON.stringify(favoriteCampaigns));
      return !isFavorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };
  
  // Get user's created campaigns (for founders)
  export const getCreatedCampaigns = (userId) => {
    try {
      const allCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      return allCampaigns.filter(campaign => campaign.creator_id === userId);
    } catch (error) {
      console.error('Error getting created campaigns:', error);
      return [];
    }
  };
  
  // Get user's funded campaigns (for investors)
  export const getFundedCampaigns = (userId) => {
    try {
      const investments = JSON.parse(localStorage.getItem('investments') || '[]');
      const userInvestments = investments.filter(inv => inv.investor_id === userId);
      
      const allCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      return allCampaigns.filter(campaign => 
        userInvestments.some(inv => inv.campaign_id === campaign.id)
      );
    } catch (error) {
      console.error('Error getting funded campaigns:', error);
      return [];
    }
  };