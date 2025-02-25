// src/services/campaignService.js
import api from '../utils/api';

export const campaignService = {
  // Get all campaigns with optional filters
  getCampaigns: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/campaigns?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  },

  // Get a single campaign by ID
  getCampaignById: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign');
    }
  },

  // Create a new campaign
  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create campaign');
    }
  },

  // Update an existing campaign
  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update campaign');
    }
  },

  // Delete a campaign
  deleteCampaign: async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete campaign');
    }
  },

  // Get campaign statistics
  getCampaignStats: async (id) => {
    try {
      const response = await api.get(`/campaigns/${id}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign statistics');
    }
  },

  // Contribute to a campaign
  contributeToCampaign: async (id, amount) => {
    try {
      const response = await api.post(`/campaigns/${id}/contribute`, { amount });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process contribution');
    }
  }
};