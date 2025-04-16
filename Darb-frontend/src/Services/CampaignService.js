// src/services/CampaignService.js
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

// Fallback base URL if not defined in apiConfig
const API_BASE_URL = 'http://localhost:5000/api';

// Define endpoints
const ENDPOINTS = {
  CAMPAIGNS: `${API_BASE_URL}/campaigns`,
  DRAFTS: `${API_BASE_URL}/drafts`,
  VIEWS: `${API_BASE_URL}/campaigns/views`,
  FAVORITES: `${API_BASE_URL}/campaigns/favorites`
};

// In-memory cache for campaigns
let campaignCache = {
  all: null,
  viewed: {},
  favorites: {},
  created: {},
  funded: {},
  drafts: null,
  timestamp: null
};

class CampaignService {
  /**
   * Clear the campaign cache
   */
  static clearCache() {
    campaignCache = {
      all: null,
      viewed: {},
      favorites: {},
      created: {},
      funded: {},
      drafts: null,
      timestamp: null
    };
    return Promise.resolve();
  }

  /**
   * Get all campaigns with optional filters
   * @param {Object} filters - Optional filters (category, stage, search, etc.)
   * @returns {Promise<Array>} - List of campaigns
   */
  static async getCampaigns(filters = {}) {
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      // Use API service for authenticated request
      const response = await ApiService.get(`${ENDPOINTS.CAMPAIGNS}?${params.toString()}`);
      
      // Update cache
      campaignCache.all = response;
      campaignCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      
      // Try fallback to local storage for testing/development
      // In production, this would be removed
      const localCampaigns = localStorage.getItem('campaigns');
      if (localCampaigns) {
        return JSON.parse(localCampaigns);
      }
      
      return [];
    }
  }

  /**
   * Get a specific campaign by ID
   * @param {string} id - Campaign ID
   * @returns {Promise<Object>} - Campaign details
   */
  static async getCampaignById(id) {
    try {
      const response = await ApiService.get(`${ENDPOINTS.CAMPAIGNS}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Promise<Object>} - Created campaign
   */
  static async createCampaign(campaignData) {
    try {
      console.log('Creating campaign with data:', campaignData);
      
      const response = await ApiService.post(ENDPOINTS.CAMPAIGNS, campaignData);
      
      // Clear cache after creating a campaign
      this.clearCache();
      
      console.log('Campaign created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Update an existing campaign
   * @param {string} id - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} - Updated campaign
   */
  static async updateCampaign(id, campaignData) {
    try {
      console.log(`Updating campaign ${id} with data:`, campaignData);
      
      const response = await ApiService.put(`${ENDPOINTS.CAMPAIGNS}/${id}`, campaignData);
      
      // Clear cache after updating a campaign
      this.clearCache();
      
      console.log('Campaign updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   * @param {string} id - Campaign ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteCampaign(id) {
    try {
      await ApiService.delete(`${ENDPOINTS.CAMPAIGNS}/${id}`);
      
      // Clear cache after deleting a campaign
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track a campaign view
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - View tracking result
   */
  static async trackCampaignView(campaignId, userId) {
    try {
      const response = await ApiService.post(`${ENDPOINTS.CAMPAIGNS}/${campaignId}/view`, { userId });
      return response;
    } catch (error) {
      console.error(`Error tracking view for campaign ${campaignId}:`, error);
      // Don't throw, just log the error as this is not critical
      return null;
    }
  }

  /**
   * Toggle campaign favorite status
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - New favorite status
   */
  static async toggleFavoriteCampaign(campaignId, userId) {
    try {
      const response = await ApiService.post(`${ENDPOINTS.CAMPAIGNS}/${campaignId}/favorite`, { userId });
      
      // Clear favorites cache
      campaignCache.favorites[userId] = null;
      
      return response.isFavorited;
    } catch (error) {
      console.error(`Error toggling favorite for campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's viewed campaigns
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of viewed campaigns
   */
  static async getViewedCampaigns(userId) {
    try {
      // Check cache first
      if (campaignCache.viewed[userId] && campaignCache.timestamp && (Date.now() - campaignCache.timestamp < 60000)) {
        return campaignCache.viewed[userId];
      }
      
      const response = await ApiService.get(`${ENDPOINTS.VIEWS}?userId=${userId}`);
      
      // Update cache
      campaignCache.viewed[userId] = response;
      campaignCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error(`Error fetching viewed campaigns for user ${userId}:`, error);
      
      // Use localStorage as fallback (for development only)
      return this.getViewedCampaignsFromStorage();
    }
  }

  /**
   * Get user's favorite campaigns
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of favorite campaigns
   */
  static async getFavoriteCampaigns(userId) {
    try {
      // Check cache first
      if (campaignCache.favorites[userId] && campaignCache.timestamp && (Date.now() - campaignCache.timestamp < 60000)) {
        return campaignCache.favorites[userId];
      }
      
      const response = await ApiService.get(`${ENDPOINTS.FAVORITES}?userId=${userId}`);
      
      // Update cache
      campaignCache.favorites[userId] = response;
      campaignCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error(`Error fetching favorite campaigns for user ${userId}:`, error);
      
      // Use localStorage as fallback (for development only)
      return this.getFavoriteCampaignsFromStorage();
    }
  }

  /**
   * Get campaigns created by user
   * @param {string} userId - User ID
   * @param {boolean} forceRefresh - Force refresh from server
   * @returns {Promise<Array>} - List of created campaigns
   */
  static async getCreatedCampaigns(userId, forceRefresh = false) {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && campaignCache.created[userId] && campaignCache.timestamp && (Date.now() - campaignCache.timestamp < 60000)) {
        return campaignCache.created[userId];
      }
      
      const response = await ApiService.get(`${ENDPOINTS.CAMPAIGNS}/user/my-campaigns`);
      
      // Update cache
      campaignCache.created[userId] = response;
      campaignCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error(`Error fetching created campaigns for user ${userId}:`, error);
      
      // Fallback to localStorage for development
      return [];
    }
  }

  /**
   * Get campaigns funded by user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of funded campaigns
   */
  static async getFundedCampaigns(userId) {
    try {
      // Check cache first
      if (campaignCache.funded[userId] && campaignCache.timestamp && (Date.now() - campaignCache.timestamp < 60000)) {
        return campaignCache.funded[userId];
      }
      
      const response = await ApiService.get(`${ENDPOINTS.CAMPAIGNS}/funded`);
      
      // Update cache
      campaignCache.funded[userId] = response;
      campaignCache.timestamp = Date.now();
      
      return response;
    } catch (error) {
      console.error(`Error fetching funded campaigns for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get most viewed campaigns
   * @param {number} limit - Maximum number of campaigns to return
   * @returns {Promise<Array>} - List of most viewed campaigns
   */
  static async getMostViewedCampaigns(limit = 3) {
    try {
      const response = await ApiService.get(`${ENDPOINTS.CAMPAIGNS}/most-viewed?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching most viewed campaigns:', error);
      return [];
    }
  }

  // ============= DRAFT CAMPAIGN FUNCTIONS =============

  /**
   * Get all draft campaigns for current user
   * @returns {Promise<Array>} - List of draft campaigns
   */
  static async getDraftCampaigns() {
    try {
      console.log('Fetching draft campaigns from API');
      
      // Check cache first
      if (campaignCache.drafts && campaignCache.timestamp && (Date.now() - campaignCache.timestamp < 60000)) {
        return campaignCache.drafts;
      }
      
      const response = await ApiService.get(ENDPOINTS.DRAFTS);
      console.log('Draft campaigns response:', response);
      
      // Update cache
      if (response && response.drafts) {
        campaignCache.drafts = response.drafts;
        campaignCache.timestamp = Date.now();
        return response.drafts;
      }
      
      return response || [];
    } catch (error) {
      console.error('Error fetching draft campaigns:', error);
      
      // Fallback to localStorage for development
      return this.getDraftsFromStorage();
    }
  }

  /**
   * Get a draft campaign by ID
   * @param {string} id - Draft campaign ID
   * @returns {Promise<Object>} - Draft campaign
   */
  static async getDraftCampaign(id) {
    try {
      console.log(`Fetching draft campaign ${id} from API`);
      
      const response = await ApiService.get(`${ENDPOINTS.DRAFTS}/${id}`);
      console.log('Draft campaign response:', response);
      
      // The API might return {draft: {...}} or the draft directly
      return response.draft || response;
    } catch (error) {
      console.error(`Error fetching draft campaign ${id}:`, error);
      
      // Fallback to localStorage for development
      return this.getDraftFromStorage(id);
    }
  }

  /**
   * Create a new draft campaign
   * @param {Object} campaignData - Campaign data
   * @returns {Promise<Object>} - Created draft campaign
   */
  static async createDraftCampaign(campaignData) {
    try {
      console.log('Creating draft campaign with data:', campaignData);
      
      const response = await ApiService.post(ENDPOINTS.DRAFTS, campaignData);
      console.log('Draft created successfully:', response);
      
      // Clear cache
      campaignCache.drafts = null;
      
      return response;
    } catch (error) {
      console.error('Error creating draft campaign:', error);
      
      // Fallback to localStorage for development
      const draft = this.saveDraftToStorage(campaignData);
      return { draft };
    }
  }

  /**
   * Update a draft campaign
   * @param {string} id - Draft campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} - Updated draft campaign
   */
  static async updateDraftCampaign(id, campaignData) {
    try {
      console.log(`Updating draft campaign ${id} with data:`, campaignData);
      
      const response = await ApiService.put(`${ENDPOINTS.DRAFTS}/${id}`, campaignData);
      console.log('Draft updated successfully:', response);
      
      // Clear cache
      campaignCache.drafts = null;
      
      return response;
    } catch (error) {
      console.error(`Error updating draft campaign ${id}:`, error);
      
      // Fallback to localStorage for development
      const draft = this.updateDraftInStorage(id, campaignData);
      return { draft };
    }
  }

  /**
 * Update a draft campaign
 * @param {string} id - Draft campaign ID
 * @param {Object} campaignData - Updated campaign data
 * @returns {Promise<Object>} - Updated draft campaign
 */
static async updateDraftCampaign(id, campaignData) {
  try {
    console.log(`Updating draft campaign ${id} with data:`, campaignData);
    
    // Make sure we're sending proper data structure
    const dataToSend = {
      ...campaignData,
      // Fix common issues with nested objects
      problemStatement: campaignData.problemStatement || { content: '', images: [] },
      solution: campaignData.solution || { content: '', images: [] },
      images: campaignData.images || [],
      financials: campaignData.financials || { targetAmount: 0, minimumInvestment: 0, milestones: [] },
      team: campaignData.team || [],
      risks: campaignData.risks || { items: [] }
    };
    
    const response = await ApiService.put(`${ENDPOINTS.DRAFTS}/${id}`, dataToSend);
    console.log('Draft updated successfully:', response);
    
    // Clear cache
    campaignCache.drafts = null;
    
    // Return the updated draft data
    return response;
  } catch (error) {
    console.error(`Error updating draft campaign ${id}:`, error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    // Fallback to localStorage for development
    const draft = this.updateDraftInStorage(id, campaignData);
    return { draft };
  }
}

/**
 * Publish a draft campaign
 * @param {string} id - Draft campaign ID
 * @returns {Promise<Object>} - Published campaign
 */
static async publishDraftCampaign(id) {
  try {
    console.log(`Publishing draft campaign ${id}`);
    
    // Make explicit call to delete the draft after publishing
    const response = await ApiService.post(`${ENDPOINTS.DRAFTS}/${id}/publish`);
    console.log(`Draft ${id} published successfully:`, response);
    
    // Clear caches
    this.clearCache();
    
    // Also remove from localStorage if it exists there (as fallback)
    try {
      this.deleteDraftFromStorage(id);
    } catch (localStorageError) {
      console.error('Error cleaning localStorage draft:', localStorageError);
    }
    
    return response;
  } catch (error) {
    console.error(`Error publishing draft campaign ${id}:`, error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    
    throw error;
  }
}

  /**
   * Delete a draft campaign
   * @param {string} id - Draft campaign ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteDraftCampaign(id) {
    try {
      console.log(`Deleting draft campaign ${id}`);
      
      await ApiService.delete(`${ENDPOINTS.DRAFTS}/${id}`);
      console.log(`Draft ${id} deleted successfully`);
      
      // Clear cache
      campaignCache.drafts = null;
      
      return true;
    } catch (error) {
      console.error(`Error deleting draft campaign ${id}:`, error);
      
      // Fallback to localStorage for development
      this.deleteDraftFromStorage(id);
      return true;
    }
  }

  /**
   * Publish a draft campaign
   * @param {string} id - Draft campaign ID
   * @returns {Promise<Object>} - Published campaign
   */
  static async publishDraftCampaign(id) {
    try {
      console.log(`Publishing draft campaign ${id}`);
      
      const response = await ApiService.post(`${ENDPOINTS.DRAFTS}/${id}/publish`);
      console.log(`Draft ${id} published successfully:`, response);
      
      // Clear caches
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error(`Error publishing draft campaign ${id}:`, error);
      throw error;
    }
  }

  // ============= LOCAL STORAGE FALLBACK METHODS =============
  // These methods are used only for development when the API is not available

  static getDraftsFromStorage() {
    const drafts = localStorage.getItem('draftCampaigns');
    return drafts ? JSON.parse(drafts) : [];
  }

  static getDraftFromStorage(id) {
    const drafts = this.getDraftsFromStorage();
    return drafts.find(draft => draft.id === id);
  }

  static saveDraftToStorage(campaignData) {
    const drafts = this.getDraftsFromStorage();
    const now = new Date().toISOString();
    
    // Create new draft with ID and timestamps
    const newDraft = {
      ...campaignData,
      id: `draft-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    // Add to drafts array
    drafts.push(newDraft);
    localStorage.setItem('draftCampaigns', JSON.stringify(drafts));
    
    return newDraft;
  }

  static updateDraftInStorage(id, campaignData) {
    const drafts = this.getDraftsFromStorage();
    const draftIndex = drafts.findIndex(draft => draft.id === id);
    
    if (draftIndex === -1) {
      return this.saveDraftToStorage(campaignData);
    }
    
    // Update existing draft
    const updatedDraft = {
      ...drafts[draftIndex],
      ...campaignData,
      updatedAt: new Date().toISOString()
    };
    
    drafts[draftIndex] = updatedDraft;
    localStorage.setItem('draftCampaigns', JSON.stringify(drafts));
    
    return updatedDraft;
  }

  static deleteDraftFromStorage(id) {
    const drafts = this.getDraftsFromStorage();
    const filteredDrafts = drafts.filter(draft => draft.id !== id);
    localStorage.setItem('draftCampaigns', JSON.stringify(filteredDrafts));
  }

  static getViewedCampaignsFromStorage() {
    const viewed = localStorage.getItem('viewedCampaigns');
    return viewed ? JSON.parse(viewed) : [];
  }

  static getFavoriteCampaignsFromStorage() {
    const favorites = localStorage.getItem('favoriteCampaigns');
    return favorites ? JSON.parse(favorites) : [];
  }
}

export default CampaignService;

// Export additional methods for backward compatibility
export const getDraft = CampaignService.getDraftFromStorage;
export const getAllDrafts = CampaignService.getDraftsFromStorage;
export const saveDraft = CampaignService.saveDraftToStorage;
export const deleteDraft = CampaignService.deleteDraftFromStorage;
export const getViewedCampaignsFromStorage = CampaignService.getViewedCampaignsFromStorage;
export const getFavoriteCampaignsFromStorage = CampaignService.getFavoriteCampaignsFromStorage;