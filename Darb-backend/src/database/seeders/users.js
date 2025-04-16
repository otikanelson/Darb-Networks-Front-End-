// src/database/seeders/users.js
/**
 * Sample user data for development and testing
 */
const bcrypt = require('bcrypt');

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Create sample users with hashed passwords
const createUsers = async () => {
  const defaultPassword = await hashPassword('password123');
  
  return [
    {
      id: 1,
      email: 'admin@darbng.com',
      password_hash: defaultPassword,
      full_name: 'Admin User',
      user_type: 'admin',
      company_name: 'Darb Nigeria',
      phone_number: '08012345678',
      address: 'Lagos, Nigeria',
      profile_image_url: '/uploads/profiles/admin.jpg',
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      email: 'startup@darbng.com',
      password_hash: defaultPassword,
      full_name: 'Startup Founder',
      user_type: 'startup',
      company_name: 'Tech Innovators Ltd',
      bvn: '12345678901',
      phone_number: '08023456789',
      address: 'Abuja, Nigeria',
      profile_image_url: '/uploads/profiles/startup.jpg',
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      email: 'investor@darbng.com',
      password_hash: defaultPassword,
      full_name: 'Angel Investor',
      user_type: 'investor',
      bvn: '12345678902',
      phone_number: '08034567890',
      address: 'Port Harcourt, Nigeria',
      profile_image_url: '/uploads/profiles/investor.jpg',
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      email: 'user@darbng.com',
      password_hash: defaultPassword,
      full_name: 'Regular User',
      user_type: 'investor',
      phone_number: '08045678901',
      address: 'Kano, Nigeria',
      is_verified: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
};

module.exports = { createUsers };