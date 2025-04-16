// src/utils/testDatabase.js
require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Test MySQL connection and configuration
 * This script tests the database connection and checks for common issues
 */
async function testDatabaseConnection() {
  console.log('🔍 Starting MySQL Connection Test');
  
  try {
    // Get connection parameters from environment
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'darb_crowdfunding';
    
    console.log(`\n📊 Connection Parameters:`);
    console.log(`  Host: ${host}`);
    console.log(`  User: ${user}`);
    console.log(`  Database: ${database}`);
    
    // Try to connect to MySQL server first (without database)
    console.log('\n🔄 Testing MySQL server connection...');
    let connection = await mysql.createConnection({
      host,
      user,
      password
    });
    
    console.log('✅ Successfully connected to MySQL server');
    
    // Check if database exists
    console.log(`\n🔄 Checking if database '${database}' exists...`);
    const [databases] = await connection.query('SHOW DATABASES');
    const databaseExists = databases.some(db => db.Database === database);
    
    if (databaseExists) {
      console.log(`✅ Database '${database}' exists`);
    } else {
      console.log(`❌ Database '${database}' does not exist`);
      console.log('🔄 Creating database...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
      console.log(`✅ Created database '${database}'`);
    }
    
    // Close the initial connection
    await connection.end();
    
    // Connect to the specific database
    console.log(`\n🔄 Connecting to database '${database}'...`);
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });
    
    console.log(`✅ Successfully connected to database '${database}'`);
    
    // Test a simple query
    console.log('\n🔄 Testing query execution...');
    const [result] = await connection.query('SELECT 1 + 1 AS sum');
    console.log(`✅ Query executed successfully. Result: ${result[0].sum}`);
    
    // Check for required tables
    console.log('\n🔄 Checking for required tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    const requiredTables = [
      'users', 
      'campaigns', 
      'milestones', 
      'campaign_images',
      'campaign_sections',
      'payments'
    ];
    
    const missingTables = requiredTables.filter(
      requiredTable => !tables.some(t => t[`Tables_in_${database}`] === requiredTable)
    );
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist');
    } else {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('⚠️ You should run the database initialization script');
    }
    
    // Check users table structure
    if (!missingTables.includes('users')) {
      console.log('\n🔄 Checking users table structure...');
      const [columns] = await connection.query('DESCRIBE users');
      
      // Check for user_type column to see if it's an ENUM
      const userTypeColumn = columns.find(column => column.Field === 'user_type');
      
      if (userTypeColumn) {
        console.log(`✅ users.user_type column exists with type: ${userTypeColumn.Type}`);
        
        // Check if it's an ENUM and the allowed values
        if (userTypeColumn.Type.startsWith('enum')) {
          const enumValues = userTypeColumn.Type.match(/'([^']+)'/g)
            .map(value => value.replace(/'/g, ''));
          
          console.log(`📋 Allowed user_type values: ${enumValues.join(', ')}`);
          
          // Check if 'startup' is among the allowed values
          if (enumValues.includes('startup')) {
            console.log('✅ user_type enum includes "startup" value');
          } else {
            console.log('❌ user_type enum does not include "startup" value');
            console.log('⚠️ This could cause data truncation errors during registration');
          }
        } else {
          console.log('⚠️ user_type is not an ENUM, which could cause issues');
        }
      } else {
        console.log('❌ user_type column not found in users table');
      }
    }
    
    // Check for test users
    if (!missingTables.includes('users')) {
      console.log('\n🔄 Checking for test users...');
      const [users] = await connection.query('SELECT id, email, user_type FROM users LIMIT 5');
      
      if (users.length > 0) {
        console.log(`✅ Found ${users.length} users in the database`);
        console.log('📋 Sample users:');
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}, Type: ${user.user_type}`);
        });
      } else {
        console.log('⚠️ No users found in the database');
        console.log('ℹ️ You might want to create some test users');
      }
    }
    
    // Test connection pool
    console.log('\n🔄 Testing connection pool...');
    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Execute 5 parallel queries to test pool
    console.log('🔄 Executing multiple parallel queries...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(pool.query('SELECT SLEEP(0.1) as delay'));
    }
    
    await Promise.all(promises);
    console.log('✅ Connection pool working correctly');
    
    // Close connections
    await pool.end();
    await connection.end();
    
    console.log('\n✅ Database connection test completed successfully');
    return true;
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error);
    
    // Provide helpful error diagnostics
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️ Authentication failed. Please check your username and password in .env file.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️ Could not connect to MySQL server. Please check if MySQL is running and the host is correct.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`\n⚠️ Database '${process.env.DB_NAME}' does not exist. Make sure to create it first.`);
    } else if (error.code === 'ER_DATA_TOO_LONG') {
      console.error('\n⚠️ Data truncation error. This might be due to ENUM field constraints.');
    }
    
    return false;
  }
}

// Run the test when this script is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };