// src/config/apiConfig.js (for frontend use)

/**
 * API base URL - Change this to your backend API URL in production
 * Using window.env for environment variables in the browser
 */
export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * API Endpoints for all backend services
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PASSWORD: `${API_BASE_URL}/users/password`,
    SETTINGS: `${API_BASE_URL}/users/settings`,
    BANK_ACCOUNTS: `${API_BASE_URL}/users/bank-accounts`
  },
  
  // Campaign endpoints
  CAMPAIGNS: {
    BASE: `${API_BASE_URL}/campaigns`,
    BY_ID: (id) => `${API_BASE_URL}/campaigns/${id}`,
    MY_CAMPAIGNS: `${API_BASE_URL}/campaigns/user/my-campaigns`,
    FEATURED: `${API_BASE_URL}/campaigns/featured`,
    RECENT: `${API_BASE_URL}/campaigns/recent`,
    SEARCH: `${API_BASE_URL}/campaigns/search`,
    FAVORITES: `${API_BASE_URL}/campaigns/favorites`,
    TOGGLE_FAVORITE: (id) => `${API_BASE_URL}/campaigns/${id}/favorite`,
    TRACK_VIEW: (id) => `${API_BASE_URL}/campaigns/${id}/view`
  },
  
  // Milestone endpoints
  MILESTONES: {
    CAMPAIGN_MILESTONES: (campaignId) => `${API_BASE_URL}/campaigns/${campaignId}/milestones`,
    BY_ID: (id) => `${API_BASE_URL}/milestones/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/milestones/${id}/status`
  },
  
  // Payment endpoints
  PAYMENTS: {
    INITIALIZE: `${API_BASE_URL}/payments/initialize`,
    VERIFY: (reference) => `${API_BASE_URL}/payments/verify/${reference}`,
    HISTORY: `${API_BASE_URL}/payments/history`,
    BY_ID: (id) => `${API_BASE_URL}/payments/details/${id}`,
    CAMPAIGN_PAYMENTS: (campaignId) => `${API_BASE_URL}/payments/campaign/${campaignId}`,
    STATS: (campaignId) => `${API_BASE_URL}/payments/stats/campaign/${campaignId}`
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    SETTINGS: `${API_BASE_URL}/users/settings`,
    BANK_ACCOUNTS: `${API_BASE_URL}/users/bank-accounts`
  },

  DRAFTS: {
    BASE: `${API_BASE_URL}/drafts`,
    BY_ID: (id) => `${API_BASE_URL}/drafts/${id}`,
    PUBLISH: (id) => `${API_BASE_URL}/drafts/${id}/publish`,
  },
  
  // Media endpoints
  MEDIA: {
    UPLOAD: `${API_BASE_URL}/media`,
    CAMPAIGN_IMAGE: `${API_BASE_URL}/media/campaign-image`,
    PROFILE_IMAGE: `${API_BASE_URL}/media/profile-image`,
    DOCUMENT: `${API_BASE_URL}/media/document`,
    BASE64: `${API_BASE_URL}/media/base64`
  }
};

/**
 * Default request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Default request headers
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  DEFAULT_HEADERS
};