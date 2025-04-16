// src/test.js
require('dotenv').config();
const db = require('./config/database');
const { hashPassword } = require('./utils/passwordHelper');

async function testDatabase() {
  console.log('\n--- Database Connection Test ---');
  try {
    const connected = await db.testConnection();
    if (connected) {
      console.log('✅ Database connection successful');
      
      // Test query
      const [result] = await db.pool.query('SELECT 1 + 1 as sum');
      console.log(`✅ Query test result: ${result[0].sum === 2 ? 'Passed' : 'Failed'}`);
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.error('❌ Database test error:', error);
  }
}

async function testPasswordHashing() {
  console.log('\n--- Password Hashing Test ---');
  try {
    const password = 'TestPassword123';
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashing works');
    
    const { comparePassword } = require('./utils/passwordHelper');
    const match = await comparePassword(password, hashedPassword);
    console.log(`✅ Password verification: ${match ? 'Passed' : 'Failed'}`);
  } catch (error) {
    console.error('❌ Password test error:', error);
  }
}

async function testFileSystem() {
  console.log('\n--- File System Test ---');
  try {
    const fileHelper = require('./utils/fileHelper');
    await fileHelper.ensureDirectories();
    console.log('✅ Directory creation successful');
  } catch (error) {
    console.error('❌ File system test error:', error);
  }
}

async function testJWT() {
  console.log('\n--- JWT Test ---');
  try {
    const { generateToken, verifyToken } = require('./utils/tokenHelper');
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    console.log('✅ Token generation successful');
    
    const decoded = verifyToken(token);
    console.log(`✅ Token verification: ${decoded && decoded.id === payload.id ? 'Passed' : 'Failed'}`);
  } catch (error) {
    console.error('❌ JWT test error:', error);
  }
}

async function runAllTests() {
  console.log('🔍 Starting Backend Tests');
  
  await testDatabase();
  await testPasswordHashing();
  await testFileSystem();
  await testJWT();
  
  console.log('\n✨ All tests completed');
  process.exit(0);
}

runAllTests();