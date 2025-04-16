// src/setupDb.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupDatabase() {
  let connection;

  try {
    // Create connection without database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} ensured`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // Read and execute SQL from migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'database/migrations/001_initial_schema.sql'), 
      'utf8'
    );

    // Split SQL by semicolons to execute each statement separately
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('Executed SQL statement');
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupDatabase();