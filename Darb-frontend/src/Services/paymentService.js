// src/services/paymentService.js
/**
 * Payment service for handling payment operations
 * Manages payment initialization, verification and history
 */
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

class PaymentService {
  /**
   * Initialize a payment
   * @param {Object} data - Payment data (amount, email, campaignId, etc.)
   * @returns {Promise<Object>} - The payment initialization result
   */
  static async initializePayment(data) {
    try {
      return await ApiService.post(API_ENDPOINTS.PAYMENTS.INITIALIZE, data);
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw new Error(error.message || 'Failed to initialize payment');
    }
  }

  /**
   * Verify a payment
   * @param {string} reference - The payment reference
   * @returns {Promise<Object>} - The verification result
   */
  static async verifyPayment(reference) {
    try {
      return await ApiService.get(API_ENDPOINTS.PAYMENTS.VERIFY(reference));
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  }

  /**
   * Get payment history for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - The payment history
   */
  static async getPaymentHistory(userId) {
    try {
      return await ApiService.get(`${API_ENDPOINTS.PAYMENTS.HISTORY}?userId=${userId}`);
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new Error(error.message || 'Failed to get payment history');
    }
  }

  /**
   * Get payment details
   * @param {string} paymentId - The payment ID
   * @returns {Promise<Object>} - The payment details
   */
  static async getPaymentDetails(paymentId) {
    try {
      return await ApiService.get(`${API_ENDPOINTS.PAYMENTS.HISTORY}/${paymentId}`);
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error(error.message || 'Failed to get payment details');
    }
  }

  /**
   * Process payment with card
   * This is a simulated function for demonstration purposes
   * In a real application, this would integrate with Paystack or another payment processor
   * 
   * @param {Object} paymentData - Card payment data
   * @returns {Promise<Object>} - The payment processing result
   */
  static async processCardPayment(paymentData) {
    try {
      // This is a simulated payment processing function
      // In a real application, this would call a payment gateway API
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For simulation purposes, always succeed
      return {
        success: true,
        transactionId: `trans_${Date.now()}`,
        amount: paymentData.amount,
        currency: 'NGN',
        paymentMethod: 'card',
        status: 'completed',
        date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing card payment:', error);
      throw new Error('Payment processing failed. Please try again.');
    }
  }
}

export default PaymentService;