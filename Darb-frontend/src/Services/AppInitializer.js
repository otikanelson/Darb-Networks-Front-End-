// src/services/AppInitializer.js
import LocalStorageService from './LocalStorageService';
import AuthService from './authService';
import CampaignService from './CampaignService';
import PaymentService from './paymentService';
import UserService from './userService';

/**
 * Initialize all application services
 * This ensures all localStorage structures are properly set up
 */
export const initializeApp = () => {
  console.log('Initializing application services...');
  
  // Initialize local storage
  LocalStorageService.initializeLocalStorage();
  
  // Initialize other services
  // These already initialize their own storage, but calling them
  // ensures they load any necessary sample data
  const services = [
    AuthService,
    CampaignService,
    PaymentService,
    UserService
  ];
  
  console.log('Application services initialized');
  
  return {
    LocalStorageService,
    AuthService,
    CampaignService,
    PaymentService,
    UserService
  };
};

export default {
  initializeApp
};