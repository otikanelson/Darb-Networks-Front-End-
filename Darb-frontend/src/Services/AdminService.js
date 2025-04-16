// src/services/AdminService.js
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

// Fallback base URL if not defined in apiConfig
const API_BASE_URL = 'http://localhost:5000/api';

// Define endpoints
const ADMIN_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/admin/register`,
  FOUNDERS: `${API_BASE_URL}/admin/founders`,
  CAMPAIGNS: `${API_BASE_URL}/admin/campaigns`
};

class AdminService {
  /**
   * Register a new admin account (requires keycode)
   * @param {Object} adminData - Admin registration data
   * @returns {Promise<Object>} - The registered admin data with token
   */
  static async registerAdmin(adminData) {
    try {
      const response = await ApiService.post(ADMIN_ENDPOINTS.REGISTER, adminData);
      
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        
        const admin = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          userType: 'admin'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(admin));
        return admin;
      }
      
      throw new Error('Admin registration response missing token');
    } catch (error) {
      console.error('Admin registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Get all founder approval requests
   * @returns {Promise<Array>} - List of founder requests
   */
  static async getFounderRequests() {
    try {
      const response = await ApiService.get(ADMIN_ENDPOINTS.FOUNDERS);
      return response.requests || [];
    } catch (error) {
      console.error('Error fetching founder requests:', error);
      
      // For development/demo purposes, return mock data if API fails
      return this.getMockFounderRequests();
    }
  }
  
  /**
   * Get details of a specific founder
   * @param {string} founderId - Founder ID
   * @returns {Promise<Object>} - Founder details
   */
  static async getFounderRequestById(founderId) {
    try {
      const response = await ApiService.get(`${ADMIN_ENDPOINTS.FOUNDERS}/${founderId}`);
      return response.founder;
    } catch (error) {
      console.error(`Error fetching founder request ${founderId}:`, error);
      
      // For development/demo purposes, return mock data if API fails
      return this.getMockFounderDetails(founderId);
    }
  }
  
  /**
   * Approve a founder
   * @param {string} founderId - Founder ID to approve
   * @returns {Promise<Object>} - Response message
   */
  static async approveFounder(founderId) {
    try {
      const response = await ApiService.post(`${ADMIN_ENDPOINTS.FOUNDERS}/${founderId}/approve`);
      return response;
    } catch (error) {
      console.error(`Error approving founder ${founderId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reject a founder
   * @param {string} founderId - Founder ID to reject
   * @returns {Promise<Object>} - Response message
   */
  static async rejectFounder(founderId) {
    try {
      const response = await ApiService.post(`${ADMIN_ENDPOINTS.FOUNDERS}/${founderId}/reject`);
      return response;
    } catch (error) {
      console.error(`Error rejecting founder ${founderId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all campaign approval requests
   * @returns {Promise<Array>} - List of campaign requests
   */
  static async getCampaignRequests() {
    try {
      const response = await ApiService.get(ADMIN_ENDPOINTS.CAMPAIGNS);
      return response.requests || [];
    } catch (error) {
      console.error('Error fetching campaign requests:', error);
      
      // For development/demo purposes, return mock data if API fails
      return this.getMockCampaignRequests();
    }
  }
  
  /**
   * Get details of a specific campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Object>} - Campaign details
   */
  static async getCampaignRequestById(campaignId) {
    try {
      const response = await ApiService.get(`${ADMIN_ENDPOINTS.CAMPAIGNS}/${campaignId}`);
      return response.campaign;
    } catch (error) {
      console.error(`Error fetching campaign request ${campaignId}:`, error);
      
      // For development/demo purposes, return mock data if API fails
      return this.getMockCampaignDetails(campaignId);
    }
  }
  
  /**
   * Approve a campaign
   * @param {string} campaignId - Campaign ID to approve
   * @returns {Promise<Object>} - Response message
   */
  static async approveCampaign(campaignId) {
    try {
      const response = await ApiService.post(`${ADMIN_ENDPOINTS.CAMPAIGNS}/${campaignId}/approve`);
      return response;
    } catch (error) {
      console.error(`Error approving campaign ${campaignId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reject a campaign
   * @param {string} campaignId - Campaign ID to reject
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} - Response message
   */
  static async rejectCampaign(campaignId, reason = '') {
    try {
      const response = await ApiService.post(
        `${ADMIN_ENDPOINTS.CAMPAIGNS}/${campaignId}/reject`, 
        { reason }
      );
      return response;
    } catch (error) {
      console.error(`Error rejecting campaign ${campaignId}:`, error);
      throw error;
    }
  }
  
  // Mock data methods for development/demo
  
  static getMockFounderRequests() {
    return [
      { 
        id: 1, 
        name: 'John Smith', 
        email: 'john@example.com', 
        companyName: 'Tech Innovations', 
        requestDate: 'March 10, 2025, 14:22 p.m.',
        status: 'pending'
      },
      { 
        id: 2, 
        name: 'Sarah Johnson', 
        email: 'sarah@example.com', 
        companyName: 'Green Solutions', 
        requestDate: 'March 9, 2025, 10:15 a.m.',
        status: 'pending'
      },
      { 
        id: 3, 
        name: 'Michael Brown', 
        email: 'michael@example.com', 
        companyName: 'Finance Tech', 
        requestDate: 'March 8, 2025, 09:30 a.m.',
        status: 'pending'
      }
    ];
  }
  
  static getMockFounderDetails(id) {
    return {
      id: Number(id),
      name: 'John Smith',
      email: 'john@example.com',
      companyName: 'Tech Innovations',
      phoneNumber: '+234 701 234 5678',
      address: '123 Business Avenue, Lagos, Nigeria',
      registrationNumber: 'RC123456',
      bvn: '1234567890',
      businessSector: 'Technology / Fintech',
      yearsInBusiness: 2,
      requestDate: 'March 10, 2025, 14:22 p.m.',
      status: 'pending',
      documents: [
        { name: 'Business Registration Certificate', type: 'pdf', size: '2.4MB' },
        { name: 'Business Plan', type: 'pdf', size: '3.8MB' },
        { name: 'Financial Statements', type: 'pdf', size: '1.7MB' },
        { name: 'ID Document', type: 'pdf', size: '0.9MB' }
      ],
      previousFunding: [
        {
          round: 'Seed Round',
          amount: 50000,
          date: 'June 2023',
          description: 'Initial funding to develop prototype',
          investors: 'Angel Investors'
        }
      ]
    };
  }
  
  static getMockCampaignRequests() {
    return [
      { 
        id: 1, 
        title: 'EcoInvest', 
        founder: 'David Wilson', 
        goalAmount: 50000.00, 
        category: 'Green Energy',
        submittedDate: 'March 11, 2025, 11:45 a.m.',
        status: 'pending'
      },
      { 
        id: 2, 
        title: 'HealthTech Pro', 
        founder: 'Lisa Chen', 
        goalAmount: 75000.00, 
        category: 'Healthcare',
        submittedDate: 'March 10, 2025, 15:20 p.m.',
        status: 'pending'
      },
      { 
        id: 3, 
        title: 'EduLearn Platform', 
        founder: 'Robert Jones', 
        goalAmount: 35000.00, 
        category: 'Education',
        submittedDate: 'March 9, 2025, 14:10 p.m.',
        status: 'pending'
      }
    ];
  }
  
  static getMockCampaignDetails(id) {
    return {
      id: Number(id),
      title: 'EcoInvest',
      founder: 'David Wilson',
      goalAmount: 50000.00,
      minimumInvestment: 1000.00,
      category: 'Green Energy',
      description: 'A revolutionary green energy solution that helps households reduce their carbon footprint while saving on electricity bills.',
      startDate: 'March 15, 2025',
      endDate: 'June 15, 2025',
      duration: '90 days',
      submittedDate: 'March 11, 2025, 11:45 a.m.',
      status: 'pending',
      milestones: [
        {
          title: 'Initial Development',
          amount: 15000.00,
          dueDate: 'April 15, 2025',
          description: 'Set up development environment and create prototype'
        },
        {
          title: 'MVP Release',
          amount: 20000.00,
          dueDate: 'May 15, 2025',
          description: 'Develop and release minimum viable product'
        },
        {
          title: 'Market Launch',
          amount: 15000.00,
          dueDate: 'June 15, 2025',
          description: 'Final development and market launch'
        }
      ],
      team: [
        {
          name: 'John Doe',
          role: 'CEO & Founder',
          email: 'john.doe@example.com'
        },
        {
          name: 'Jane Smith',
          role: 'CTO',
          email: 'jane.smith@example.com'
        }
      ],
      risks: [
        {
          category: 'Market Risk',
          description: 'Potential challenges with market adoption and competition.',
          impact: 'medium'
        },
        {
          category: 'Technical Risk',
          description: 'Challenges related to development timeline and technical implementation.',
          impact: 'low'
        }
      ]
    };
  }
}

export default AdminService;