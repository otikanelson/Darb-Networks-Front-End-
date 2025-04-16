// src/services/authService.js
/**
 * Authentication service for managing user authentication
 * Updated to match the backend authController.js implementation
 */
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

class AuthService {
  /**
   * Store auth token in localStorage
   * @param {string} token - JWT token
   */
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Remove auth token from localStorage
   */
  static removeToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Store current user data in localStorage
   * @param {Object} user - User data
   */
  static setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null if not found
   */
  static getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user && user !== 'null' ? JSON.parse(user) : null;
  }

  /**
   * Remove current user data from localStorage
   */
  static removeCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data (email, password, fullName, userType, etc.)
   * @returns {Promise<Object>} Promise resolving to the new user data with token
   */
  static async register(userData) {
    try {
      // Convert camelCase to snake_case for backend compatibility
      const backendData = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        userType: userData.userType,
        companyName: userData.companyName || null,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
        bvn: userData.bvn || null
      };
      
      const response = await ApiService.post(API_ENDPOINTS.AUTH.REGISTER, backendData);
      
      if (response && response.token) {
        this.setToken(response.token);
        
        // Convert response to a consistent format for frontend use
        const user = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          userType: response.userType,
          companyName: response.companyName
        };
        
        this.setCurrentUser(user);
        return user;
      }
      
      throw new Error('Registration response missing token');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials (email & password)
   * @returns {Promise<Object>} Promise resolving to the user data with token
   */
  static async login(credentials) {
    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response && response.token) {
        this.setToken(response.token);
        
        // Convert response to a consistent format for frontend use
        const user = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          userType: response.userType,
          companyName: response.companyName
        };
        
        this.setCurrentUser(user);
        return user;
      }
      
      throw new Error('Login response missing token');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  static logout() {
    // Clear local storage
    this.removeToken();
    this.removeCurrentUser();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a token
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get the authentication token
   * @returns {string|null} The auth token or null if not found
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Verify token and get current user profile
   * @returns {Promise<Object>} Promise resolving to the user profile
   */
  static async verifyToken() {
    try {
      if (!this.getToken()) {
        return false;
      }
      
      // Use the profile endpoint to verify token and get user data
      const response = await ApiService.get(API_ENDPOINTS.AUTH.PROFILE);
      
      // Update stored user data if successful
      if (response) {
        const user = {
          id: response.id,
          email: response.email,
          fullName: response.full_name,
          userType: response.user_type,
          companyName: response.company_name,
          phoneNumber: response.phone_number,
          address: response.address,
          profileImageUrl: response.profile_image_url
        };
        
        this.setCurrentUser(user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear user data on verification failure
      this.logout();
      return false;
    }
  }
}

export default AuthService;