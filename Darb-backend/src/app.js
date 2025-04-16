const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');

// Initialize Express app
const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testRoutes = require('./routes/testRoutes');
const draftCampaignRoutes = require('./routes/draftCampaignRoutes'); // Add this line

// Middleware
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', testRoutes);
app.use('/api/drafts', draftCampaignRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Darb Crowdfunding API' });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler.errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
