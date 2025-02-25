const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql } = require('../config/db');

// Create campaign
router.post('/', auth, async (req, res) => {
  if (req.user.userType !== 'Founder') {
    return res.status(403).json({ msg: 'Only founders can create campaigns' });
  }

  const {
    title,
    description,
    category,
    targetAmount,
    minimumInvestment,
    startDate,
    endDate,
    interestRate,
    milestones
  } = req.body;

  try {
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();
    try {
      // Create campaign
      const campaignResult = await transaction.request()
        .input('FounderID', sql.Int, req.user.id)
        .input('Title', sql.VarChar, title)
        .input('Description', sql.Text, description)
        .input('Category', sql.VarChar, category)
        .input('TargetAmount', sql.Decimal, targetAmount)
        .input('MinimumInvestment', sql.Decimal, minimumInvestment)
        .input('StartDate', sql.DateTime, startDate)
        .input('EndDate', sql.DateTime, endDate)
        .input('InterestRate', sql.Decimal, interestRate)
        .execute('sp_CreateCampaign');

      const campaignId = campaignResult.recordset[0].CampaignID;

      // Add milestones
      if (milestones && milestones.length > 0) {
        for (const milestone of milestones) {
          await transaction.request()
            .input('CampaignID', sql.Int, campaignId)
            .input('Title', sql.VarChar, milestone.title)
            .input('Description', sql.Text, milestone.description)
            .input('Amount', sql.Decimal, milestone.amount)
            .input('DueDate', sql.DateTime, milestone.dueDate)
            .query(`
              INSERT INTO CampaignMilestones (CampaignID, Title, Description, Amount, DueDate)
              VALUES (@CampaignID, @Title, @Description, @Amount, @DueDate)
            `);
        }
      }

      await transaction.commit();
      res.status(201).json({ campaignId });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all campaigns with filters
router.get('/', async (req, res) => {
  const { category, status, minAmount, maxAmount, search } = req.query;

  try {
    const pool = await sql.connect();
    let query = `
      SELECT 
        c.*,
        u.FullName as FounderName,
        f.CompanyName as CompanyName,
        (
          SELECT COUNT(*) 
          FROM Investments 
          WHERE CampaignID = c.CampaignID
        ) as InvestorCount
      FROM Campaigns c
      JOIN Users u ON c.FounderID = u.UserID
      JOIN FounderProfiles f ON u.UserID = f.UserID
      WHERE 1=1
    `;

    if (category) {
      query += ` AND c.Category = '${category}'`;
    }
    if (status) {
      query += ` AND c.Status = '${status}'`;
    }
    if (minAmount) {
      query += ` AND c.TargetAmount >= ${minAmount}`;
    }
    if (maxAmount) {
      query += ` AND c.TargetAmount <= ${maxAmount}`;
    }
    if (search) {
      query += ` AND (c.Title LIKE '%${search}%' OR c.Description LIKE '%${search}%')`;
    }

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});