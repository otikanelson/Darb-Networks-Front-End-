const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Admin middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.userType !== 'Admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  next();
};

// Verify user
router.post('/verify-user/:id', [auth, adminAuth], async (req, res) => {
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('userId', sql.Int, req.params.id)
      .execute('sp_VerifyUser');

    res.json({ msg: 'User verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve campaign
router.post('/approve-campaign/:id', [auth, adminAuth], async (req, res) => {
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('campaignId', sql.Int, req.params.id)
      .input('adminId', sql.Int, req.user.id)
      .execute('sp_ApproveCampaign');

    res.json({ msg: 'Campaign approved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get platform statistics
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users) as TotalUsers,
        (SELECT COUNT(*) FROM Campaigns) as TotalCampaigns,
        (SELECT COUNT(*) FROM Investments) as TotalInvestments,
        (SELECT SUM(Amount) FROM Investments) as TotalInvested,
        (SELECT COUNT(*) FROM Campaigns WHERE Status = 'Active') as ActiveCampaigns,
        (SELECT COUNT(*) FROM Users WHERE UserType = 'Investor') as TotalInvestors,
        (SELECT COUNT(*) FROM Users WHERE UserType = 'Founder') as TotalFounders
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});