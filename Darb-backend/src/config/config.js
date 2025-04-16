// src/config/config.js
require('dotenv').config();

/**
 * Application configuration
 * Environment-specific settings are loaded from environment variables
 */
const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'Darb Crowdfunding',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'darb_crowdfunding',
    port: process.env.DB_PORT || 3306
  },
  
  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'darb-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10)
  },
  
  // File Upload
  upload: {
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '5', 10) * 1024 * 1024, // 5MB default
    maxDocumentSize: parseInt(process.env.MAX_DOCUMENT_SIZE || '10', 10) * 1024 * 1024, // 10MB default
    maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE || '50', 10) * 1024 * 1024, // 50MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  },
  
  // Email
  email: {
    fromEmail: process.env.EMAIL_FROM || 'noreply@darbng.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Darb Crowdfunding',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpSecure: process.env.SMTP_SECURE === 'true'
  },
  
  // Payment
  payment: {
    paystackSecret: process.env.PAYSTACK_SECRET_KEY,
    paystackPublic: process.env.PAYSTACK_PUBLIC_KEY,
    flutterwaveSecret: process.env.FLUTTERWAVE_SECRET_KEY,
    flutterwavePublic: process.env.FLUTTERWAVE_PUBLIC_KEY,
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET
  },
  
  // Security
  security: {
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000, // 15 minutes default
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window default
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production'
    }
  }
};

module.exports = config;