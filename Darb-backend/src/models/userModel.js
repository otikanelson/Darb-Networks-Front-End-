// src/models/userModel.js
const db = require("../config/database");
const bcrypt = require("bcrypt");

// Create a new user
async function createUser(userData) {
  const {
    email,
    password,
    fullName,
    userType,
    companyName,
    phoneNumber,
    address,
    bvn,
  } = userData;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user into database
  const [result] = await db.pool.query(
    `INSERT INTO users 
     (email, password_hash, full_name, user_type, company_name, phone_number, address, bvn) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      email,
      hashedPassword,
      fullName,
      userType,
      companyName,
      phoneNumber,
      address,
      bvn,
    ]
  );

  return result.insertId;
}

// Find user by email
async function findUserByEmail(email) {
  const [rows] = await db.pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

// Find user by ID
async function findUserById(id) {
  const [rows] = await db.pool.query("SELECT * FROM users WHERE id = ?", [id]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

// Update user profile
async function updateUser(id, userData) {
  const { fullName, phoneNumber, address, companyName } = userData;

  const [result] = await db.pool.query(
    `UPDATE users 
     SET full_name = ?, phone_number = ?, address = ?, company_name = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [fullName, phoneNumber, address, companyName, id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
};
