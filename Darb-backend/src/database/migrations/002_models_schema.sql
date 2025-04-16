-- src/database/migrations/002_models_schema.sql

-- This migration adds additional tables and schema modifications needed for new features

-- Create table for team members
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  bio TEXT,
  email VARCHAR(255),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create table for risks
CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  impact ENUM('low', 'medium', 'high') DEFAULT 'medium',
  likelihood ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create table for contributions (for tracking individual milestone-specific investments)
CREATE TABLE IF NOT EXISTS contributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  campaign_id INT NOT NULL,
  milestone_id INT,
  investor_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create table for notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id VARCHAR(36),
  related_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create table for contracts (for funded campaigns)
CREATE TABLE IF NOT EXISTS contracts (
  id VARCHAR(36) PRIMARY KEY,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  repayment_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  status ENUM('pending', 'active', 'completed', 'defaulted') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create table for repayments
CREATE TABLE IF NOT EXISTS repayments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status ENUM('scheduled', 'paid', 'overdue', 'defaulted') DEFAULT 'scheduled',
  reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Create table for investor repayments (distribution of repayments to investors)
CREATE TABLE IF NOT EXISTS investor_repayments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repayment_id INT NOT NULL,
  investor_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repayment_id) REFERENCES repayments(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add session_id column to campaign_views for anonymous users
ALTER TABLE campaign_views 
ADD COLUMN session_id VARCHAR(255) NULL AFTER user_id;

-- Add index to campaign_views to optimize lookups by session_id
CREATE INDEX idx_campaign_views_session ON campaign_views(session_id);

-- Add token column to users table for email verification and password reset
ALTER TABLE users
ADD COLUMN verification_token VARCHAR(255) NULL,
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN token_expires_at TIMESTAMP NULL;

-- Add bank account information for users
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add settings table for user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  notification_app BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data for the new tables
INSERT INTO team_members (id, campaign_id, name, role, bio, email, linkedin, twitter, created_at, updated_at)
VALUES 
  (UUID(), 1, 'John Smith', 'CEO', 'Experienced entrepreneur with 10 years in tech.', 'john@example.com', 'linkedin.com/john', 'twitter.com/john', NOW(), NOW()),
  (UUID(), 1, 'Sarah Johnson', 'CTO', 'Technical expert with background in renewable energy.', 'sarah@example.com', 'linkedin.com/sarah', 'twitter.com/sarah', NOW(), NOW());

INSERT INTO risks (id, campaign_id, category, description, mitigation, impact, likelihood, created_at, updated_at)
VALUES 
  (UUID(), 1, 'Technical', 'Possible delays in manufacturing process.', 'Working with multiple suppliers and creating buffer timelines.', 'medium', 'low', NOW(), NOW()),
  (UUID(), 1, 'Market', 'Competitive products may emerge.', 'Focus on unique value proposition and building strong brand loyalty.', 'high', 'medium', NOW(), NOW());

-- Create a contract for the first campaign (assuming it's fully funded)
INSERT INTO contracts (id, campaign_id, title, content, start_date, end_date, repayment_amount, interest_rate, status, created_at, updated_at)
VALUES 
  (UUID(), 1, 'EcoCharge Investment Contract', 'This contract outlines the investment terms and repayment schedule for the EcoCharge campaign.', 
   CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 1800000.00, 12.5, 'active', NOW(), NOW());

-- Create scheduled repayments for the contract
INSERT INTO repayments (contract_id, amount, payment_date, status, created_at, updated_at)
VALUES 
  ((SELECT id FROM contracts WHERE campaign_id = 1), 225000.00, DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'scheduled', NOW(), NOW()),
  ((SELECT id FROM contracts WHERE campaign_id = 1), 225000.00, DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'scheduled', NOW(), NOW()),
  ((SELECT id FROM contracts WHERE campaign_id = 1), 225000.00, DATE_ADD(CURDATE(), INTERVAL 18 MONTH), 'scheduled', NOW(), NOW()),
  ((SELECT id FROM contracts WHERE campaign_id = 1), 225000.00, DATE_ADD(CURDATE(), INTERVAL 24 MONTH), 'scheduled', NOW(), NOW());

-- Create bank accounts for users
INSERT INTO bank_accounts (user_id, account_name, account_number, bank_name, is_default, created_at, updated_at)
VALUES
  (2, 'Tech Innovators Ltd', '0123456789', 'First Bank', TRUE, NOW(), NOW()),
  (3, 'Angel Investor', '9876543210', 'GTBank', TRUE, NOW(), NOW());

-- Create user settings
INSERT INTO user_settings (user_id, notification_email, notification_sms, notification_app, language, created_at, updated_at)
VALUES
  (1, TRUE, TRUE, TRUE, 'en', NOW(), NOW()),
  (2, TRUE, FALSE, TRUE, 'en', NOW(), NOW()),
  (3, TRUE, FALSE, TRUE, 'en', NOW(), NOW()),
  (4, TRUE, FALSE, FALSE, 'en', NOW(), NOW());