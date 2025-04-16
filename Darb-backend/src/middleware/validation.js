// src/middleware/validation.js
const { formatResponse } = require('../utils/responseFormatter');

/**
 * Validate registration request
 */
const validateRegistration = (req, res, next) => {
  const { email, password, fullName, userType } = req.body;
  
  if (!email || !password || !fullName || !userType) {
    return formatResponse(res, 400, 'Missing required fields');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return formatResponse(res, 400, 'Invalid email format');
  }
  
  // Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return formatResponse(res, 400, 'Password must be at least 8 characters with uppercase, lowercase, and number');
  }
  
  // User type validation
  if (!['founder', 'investor', 'admin'].includes(userType)) {
    return formatResponse(res, 400, 'Invalid user type');
  }
  
  // Startup-specific validation
  if (userType === 'founder') {
    const { companyName } = req.body;
    if (!companyName) {
      return formatResponse(res, 400, 'Company name is required for startups');
    }
  }
  
  next();
};

/**
 * Validate campaign creation
 */
const validateCampaign = (req, res, next) => {
  const { title, description, category, location, targetAmount } = req.body;
  
  if (!title || !description || !category || !location || !targetAmount) {
    return formatResponse(res, 400, 'Missing required campaign fields');
  }
  
  // Title validation
  if (title.length < 5 || title.length > 100) {
    return formatResponse(res, 400, 'Title must be between 5 and 100 characters');
  }
  
  // Target amount validation
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return formatResponse(res, 400, 'Target amount must be a positive number');
  }
  
  next();
};

/**
 * Validate milestone creation
 */
const validateMilestone = (req, res, next) => {
  const { title, targetDate, amount } = req.body;
  
  if (!title || !targetDate || !amount) {
    return formatResponse(res, 400, 'Missing required milestone fields');
  }
  
  // Amount validation
  if (isNaN(amount) || amount <= 0) {
    return formatResponse(res, 400, 'Milestone amount must be a positive number');
  }
  
  // Date validation
  const date = new Date(targetDate);
  if (isNaN(date.getTime())) {
    return formatResponse(res, 400, 'Invalid target date format');
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateCampaign,
  validateMilestone
};