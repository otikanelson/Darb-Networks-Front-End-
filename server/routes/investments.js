const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql } = require('../config/db');

// Create investment
router.post('/', auth, async (req, res) => {
  if (req.user.userType !== 'Investor') {
    return res.status(403).json({ msg: 'Only investors can make investments' });
  }

  const { campaignId, amount } = req.body;

  try {
    const pool = await sql.connect();
    
    // Verify campaign exists and is active
    const campaignCheck = await pool.request()
      .input('campaignId', sql.Int, campaignId)
      .query(`
        SELECT * FROM Campaigns 
        WHERE CampaignID = @campaignId 
        AND Status = 'Active'
        AND CurrentAmount + @amount <= TargetAmount
      `);

    if (campaignCheck.recordset.length === 0) {
      return res.status(400).json({ msg: 'Invalid campaign or investment amount' });
    }

    // Create investment using stored procedure
    const result = await pool.request()
      .input('CampaignID', sql.Int, campaignId)
      .input('InvestorID', sql.Int, req.user.id)
      .input('Amount', sql.Decimal, amount)
      .execute('sp_CreateInvestment');

    res.status(201).json({ 
      investmentId: result.recordset[0].InvestmentID,
      msg: 'Investment created successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get investor's investments
router.get('/my-investments', auth, async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('investorId', sql.Int, req.user.id)
      .execute('sp_GetInvestorPortfolio');

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Process repayment
router.post('/:id/repay', auth, async (req, res) => {
  const { amount, paymentReference } = req.body;

  try {
    const pool = await sql.connect();
    await pool.request()
      .input('InvestmentID', sql.Int, req.params.id)
      .input('Amount', sql.Decimal, amount)
      .input('PaymentReference', sql.VarChar, paymentReference)
      .execute('sp_ProcessRepayment');

    res.json({ msg: 'Repayment processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});