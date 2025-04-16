-- src/database/migrations/001_initial_schema.sql

-- Drop tables if they exist to avoid errors during development
-- In production, you would use proper migrations instead of dropping tables
DROP TABLE IF EXISTS milestone_allocations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS campaign_views;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS campaign_images;
DROP TABLE IF EXISTS campaign_assets;
DROP TABLE IF EXISTS campaign_sections;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  user_type ENUM('founder', 'investor', 'admin') NOT NULL,
  company_name VARCHAR(255),
  bvn VARCHAR(11),
  phone_number VARCHAR(20),
  address TEXT,
  profile_image_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Campaigns Table
CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  stage VARCHAR(50) DEFAULT 'concept',
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  minimum_investment DECIMAL(15, 2) DEFAULT 0,
  creator_id INT NOT NULL,
  status ENUM('draft', 'active', 'closed', 'funded') DEFAULT 'draft',
  view_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Campaign Sections (for problem statement, solution, etc.)
CREATE TABLE campaign_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Campaign Assets (pitch deck, business plan, etc.)
CREATE TABLE campaign_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  asset_url VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Campaign Images
CREATE TABLE campaign_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  section_type VARCHAR(50) DEFAULT 'main',
  related_id INT,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Milestones Table
CREATE TABLE milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  deliverables TEXT,
  image_url VARCHAR(255),
  status ENUM('pending', 'in_progress', 'completed', 'verified') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Favorites Table
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, campaign_id)
);

-- Campaign Views Table
CREATE TABLE campaign_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  campaign_id INT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  payment_method VARCHAR(50) DEFAULT 'card',
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  email VARCHAR(255) NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Milestone Allocations Table
CREATE TABLE milestone_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  milestone_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
);

-- Insert a test admin user
INSERT INTO users (email, password, full_name, user_type, is_verified)
VALUES ('admin@example.com', '$2b$10$1YmBGqkMfUyF0JnWaXGvWO8Ql.nwoJj/YQwJnpOL4pqjH6NVraMum', 'Admin User', 'admin', TRUE);
-- Password is 'password123' (hashed with bcrypt)

-- Insert a test startup user
INSERT INTO users (email, password, full_name, user_type, company_name, bvn, phone_number, address, is_verified)
VALUES ('startup@example.com', '$2b$10$1YmBGqkMfUyF0JnWaXGvWO8Ql.nwoJj/YQwJnpOL4pqjH6NVraMum', 'Startup User', 'startup', 'Test Company', '12345678901', '08012345678', 'Test Address, Lagos, Nigeria', TRUE);

-- Insert a test investor user
INSERT INTO users (email, password, full_name, user_type, is_verified)
VALUES ('investor@example.com', '$2b$10$1YmBGqkMfUyF0JnWaXGvWO8Ql.nwoJj/YQwJnpOL4pqjH6NVraMum', 'Investor User', 'investor', TRUE);

-- Insert a test campaign
INSERT INTO campaigns (title, description, category, location, stage, target_amount, current_amount, minimum_investment, creator_id, status, end_date)
VALUES ('Test Campaign', 'This is a test campaign description', 'Technology', 'Lagos, Nigeria', 'concept', 1500000.00, 550000.00, 5000.00, 2, 'active', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY));

-- Insert campaign sections
INSERT INTO campaign_sections (campaign_id, section_type, content)
VALUES (1, 'problem_statement', 'This is a test problem statement content for the campaign.');

INSERT INTO campaign_sections (campaign_id, section_type, content)
VALUES (1, 'solution', 'This is a test solution content for the campaign.');

-- Insert campaign assets
INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type)
VALUES (1, 'pitch', 'https://example.com/test-pitch-image.jpg', 'image');

INSERT INTO campaign_assets (campaign_id, asset_type, asset_url, media_type)
VALUES (1, 'business_plan', 'https://example.com/test-business-plan.pdf', 'document');

-- Insert campaign images
INSERT INTO campaign_images (campaign_id, section_type, image_url)
VALUES (1, 'main', 'https://example.com/test-main-image.jpg');

INSERT INTO campaign_images (campaign_id, section_type, image_url)
VALUES (1, 'problem_statement', 'https://example.com/test-problem-image.jpg');

-- Insert milestones
INSERT INTO milestones (campaign_id, title, description, target_date, amount, deliverables)
VALUES (1, 'Prototype Development', 'Develop initial prototype', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 300000.00, 'Working prototype of the product');

INSERT INTO milestones (campaign_id, title, description, target_date, amount, deliverables)
VALUES (1, 'Production Setup', 'Set up production line', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 90 DAY), 700000.00, 'Manufacturing line setup and initial production run');

INSERT INTO milestones (campaign_id, title, description, target_date, amount, deliverables)
VALUES (1, 'Market Launch', 'Launch product to market', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY), 500000.00, 'Full market launch with sales and marketing');

-- Insert favorites
INSERT INTO favorites (user_id, campaign_id)
VALUES (3, 1);

-- Insert campaign views
INSERT INTO campaign_views (user_id, campaign_id, ip_address)
VALUES (3, 1, '127.0.0.1');

-- Insert a test payment
INSERT INTO payments (user_id, campaign_id, amount, reference, status, email)
VALUES (3, 1, 50000.00, 'TEST-REF-12345', 'completed', 'investor@example.com');

-- Insert milestone allocations
INSERT INTO milestone_allocations (payment_id, milestone_id, amount)
VALUES (1, 1, 50000.00);