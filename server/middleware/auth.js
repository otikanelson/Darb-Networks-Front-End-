const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../config/db');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName, userType } = req.body;

  try {
    const pool = await sql.connect();
    
    // Check if user exists
    const userCheck = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');
    
    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user using stored procedure
    await pool.request()
      .input('Email', sql.VarChar, email)
      .input('PasswordHash', sql.VarChar, passwordHash)
      .input('FullName', sql.VarChar, fullName)
      .input('UserType', sql.VarChar, userType)
      .execute('sp_CreateUser');

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await sql.connect();
    
    // Get user
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');
    
    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.UserID,
        userType: user.UserType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;