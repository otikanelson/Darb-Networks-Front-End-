// src/services/index.js
/**
 * Services index file
 * Exports all services for easy importing
 */

import ApiService from './apiService';
import AuthService from './authService';
import campaignService from '../Services/CampaignService';
import PaymentService from './paymentService';
import UserService from './userService';
import MediaService from './mediaService';
import 'bootstrap/dist/css/bootstrap.min.css';

export {
  ApiService,
  AuthService,
  campaignService,
  PaymentService,
  UserService,
  MediaService
};

export default {
  ApiService,
  AuthService,
  campaignService,
  PaymentService,
  UserService,
  MediaService
};