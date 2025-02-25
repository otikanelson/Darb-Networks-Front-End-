// server/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql } = require('../config/db');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`
        SELECT 
          u.*,
          CASE 
            WHEN u.UserType = 'Founder' THEN (
              SELECT * FROM FounderProfiles WHERE UserID = u.UserID FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
            WHEN u.UserType = 'Investor' THEN (
              SELECT * FROM InvestorProfiles WHERE UserID = u.UserID FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
            ELSE NULL
          END as TypeProfile
        FROM Users u
        WHERE u.UserID = @userId
      `);

    if (!result.recordset[0]) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const { fullName, phoneNumber, address, bankName, accountNumber, ...profileData } = req.body;

  try {
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();
    try {
      // Update basic user info
      await transaction.request()
        .input('userId', sql.Int, req.user.id)
        .input('fullName', sql.VarChar, fullName)
        .input('phoneNumber', sql.VarChar, phoneNumber)
        .input('address', sql.Text, address)
        .input('bankName', sql.VarChar, bankName)
        .input('accountNumber', sql.VarChar, accountNumber)
        .query(`
          UPDATE Users 
          SET FullName = @fullName,
              PhoneNumber = @phoneNumber,
              Address = @address,
              BankName = @bankName,
              AccountNumber = @accountNumber
          WHERE UserID = @userId
        `);

      // Update type-specific profile
      if (req.user.userType === 'Founder') {
        await transaction.request()
          .input('userId', sql.Int, req.user.id)
          .input('companyName', sql.VarChar, profileData.companyName)
          .input('cacNumber', sql.VarChar, profileData.cacNumber)
          .input('industry', sql.VarChar, profileData.industry)
          .query(`
            UPDATE FounderProfiles
            SET CompanyName = @companyName,
                CACNumber = @cacNumber,
                Industry = @industry
            WHERE UserID = @userId
          `);
      } else if (req.user.userType === 'Investor') {
        await transaction.request()
          .input('userId', sql.Int, req.user.id)
          .input('minAmount', sql.Decimal, profileData.minInvestmentAmount)
          .input('maxAmount', sql.Decimal, profileData.maxInvestmentAmount)
          .input('sectors', sql.VarChar, JSON.stringify(profileData.preferredSectors))
          .query(`
            UPDATE InvestorProfiles
            SET MinInvestmentAmount = @minAmount,
                MaxInvestmentAmount = @maxAmount,
                PreferredSectors = @sectors
            WHERE UserID = @userId
          `);
      }

      await transaction.commit();
      res.json({ msg: 'Profile updated successfully' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});