// src/utils/formatters.js

/**
 * Format currency amount with specified currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
    if (amount === null || amount === undefined) return '-';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${amount.toFixed(decimals)}`;
    }
  };
  
  /**
   * Format date string to a more readable format
   * @param {string|Date} dateString - Date to format
   * @param {boolean} includeTime - Whether to include time in the output
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      const options = includeTime
        ? { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }
        : { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          };
      
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  /**
   * Truncate a string to a specified length and add ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Get status badge color classes based on status
   * @param {string} status - Status value (approved, pending, rejected)
   * @returns {object} Object with background and text color classes
   */
  export const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800',
          icon: 'text-green-500'
        };
      case 'rejected':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800',
          icon: 'text-red-500'
        };
      case 'pending':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800',
          icon: 'text-yellow-500'
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          icon: 'text-gray-500'
        };
    }
  };
  
  /**
   * Get formatted status for display
   * @param {string} status - Raw status value
   * @returns {string} Capitalized and well-formatted status text
   */
  export const formatStatus = (status) => {
    if (!status) return '-';
    
    // Capitalize first letter and lowercase the rest
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };