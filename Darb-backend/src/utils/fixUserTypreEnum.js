// src/utils/fixUserTypeEnum.js
require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Script to fix the user_type enum issue in the database
 * This addresses the "Data truncated for column 'user_type'" error
 */
async function fixUserTypeEnum() {
  let connection;
  try {
    console.log('🔧 Starting user_type enum fix...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'darb_crowdfunding'
    });
    
    console.log('✅ Connected to database');
    
    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('❌ Users table does not exist. Please run the initial database setup first.');
      return false;
    }
    
    console.log('✅ Users table exists');
    
    // Check current user_type column definition
    const [columns] = await connection.query('DESCRIBE users user_type');
    
    if (columns.length === 0) {
      console.log('❌ user_type column not found in users table');
      return false;
    }
    
    const currentType = columns[0].Type;
    console.log(`ℹ️ Current user_type definition: ${currentType}`);
    
    // Check if it's already correctly defined
    if (currentType.toLowerCase() === "enum('startup','investor','admin')") {
      console.log('✅ user_type enum is already correctly defined');
      
      // Verify user data
      await checkUserData(connection);
      
      return true;
    }
    
    // Create backup of users table
    console.log('🔄 Creating backup of users table...');
    await connection.query('CREATE TABLE users_backup LIKE users');
    await connection.query('INSERT INTO users_backup SELECT * FROM users');
    console.log('✅ Backup created (users_backup)');
    
    // Modify the column to correct definition
    console.log('🔄 Altering user_type column...');
    await connection.query("ALTER TABLE users MODIFY COLUMN user_type ENUM('startup','investor','admin') NOT NULL");
    console.log('✅ Column definition updated successfully');
    
    // Verify user data
    await checkUserData(connection);
    
    console.log('\n✅ Fix completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error fixing user_type enum:', error);
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      console.error('\n⚠️ Data truncation error occurred during fix. This means some user_type values are not valid.');
      console.error('Recommendations:');
      console.error('1. Check existing values: SELECT DISTINCT user_type FROM users;');
      console.error('2. Update invalid values: UPDATE users SET user_type = "investor" WHERE user_type NOT IN ("startup", "investor", "admin");');
      console.error('3. Then run this fix script again');
    }
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('📊 Database connection closed');
    }
  }
}

/**
 * Check existing user data for any issues
 * @param {Object} connection - MySQL connection
 */
async function checkUserData(connection) {
  try {
    console.log('\n🔄 Checking user data...');
    
    // Check for invalid user types
    const [invalidTypes] = await connection.query(`
      SELECT id, email, user_type 
      FROM users 
      WHERE user_type NOT IN ('startup', 'investor', 'admin')
    `);
    
    if (invalidTypes.length > 0) {
      console.log(`⚠️ Found ${invalidTypes.length} users with invalid user_type values:`);
      invalidTypes.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Type: "${user.user_type}"`);
      });
      
      console.log('\n🔄 Fixing invalid user_type values (setting to "investor")...');
      await connection.query(`
        UPDATE users 
        SET user_type = 'investor' 
        WHERE user_type NOT IN ('startup', 'investor', 'admin')
      `);
      console.log('✅ Invalid user_type values fixed');
    } else {
      console.log('✅ All user_type values are valid');
    }
    
    // Display user type distribution
    const [distribution] = await connection.query(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type
    `);
    
    console.log('\n📊 User type distribution:');
    distribution.forEach(type => {
      console.log(`  - ${type.user_type}: ${type.count} users`);
    });
  } catch (error) {
    console.error('❌ Error checking user data:', error);
    throw error;
  }
}

// Run the fix when this script is executed directly
if (require.main === module) {
  fixUserTypeEnum()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = { fixUserTypeEnum };