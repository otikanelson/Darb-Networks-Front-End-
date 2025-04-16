-- src/database/migrations/003_draft_campaigns_schema.sql

-- Add view_count column to campaigns table if not already exists
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- Create draft_campaigns table
CREATE TABLE IF NOT EXISTS draft_campaigns (
  id VARCHAR(36) PRIMARY KEY, -- UUID
  creator_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(100),
  stage VARCHAR(50) DEFAULT 'concept',
  target_amount DECIMAL(15, 2) DEFAULT 0,
  minimum_investment DECIMAL(15, 2) DEFAULT 0,
  problem_statement TEXT,
  solution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  data JSON, -- Store additional form data as JSON for flexibility
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create draft_campaign_images table
CREATE TABLE IF NOT EXISTS draft_campaign_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  section_type VARCHAR(50) DEFAULT 'main',
  related_id VARCHAR(36),
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create draft_campaign_assets table
CREATE TABLE IF NOT EXISTS draft_campaign_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  asset_url VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create draft_campaign_sections table
CREATE TABLE IF NOT EXISTS draft_campaign_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create draft_milestones table
CREATE TABLE IF NOT EXISTS draft_milestones (
  id VARCHAR(36) PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  deliverables TEXT,
  image_url VARCHAR(255),
  status ENUM('pending', 'in_progress', 'completed', 'verified') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create draft_team_members table
CREATE TABLE IF NOT EXISTS draft_team_members (
  id VARCHAR(36) PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  bio TEXT,
  email VARCHAR(255),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create draft_risks table
CREATE TABLE IF NOT EXISTS draft_risks (
  id VARCHAR(36) PRIMARY KEY,
  draft_id VARCHAR(36) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  impact ENUM('low', 'medium', 'high') DEFAULT 'medium',
  likelihood ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_id) REFERENCES draft_campaigns(id) ON DELETE CASCADE
);

-- Create index on creator_id for faster lookups
CREATE INDEX idx_draft_campaigns_creator ON draft_campaigns(creator_id);