# Darb Crowdfunding Platform - Backend

This repository contains the backend API server for Darb, a P2P lending and crowdfunding platform designed specifically for Nigerian startups and investors.

## Features

- User authentication (JWT-based)
- Campaign management (create, edit, list, view)
- Milestone tracking
- Payment processing
- Media uploads
- User dashboards
- Favorites and campaign tracking
- Role-based access control

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers

## Project Structure

```
darb-backend/
├── src/
│   ├── app.js                # Main application entry point
│   ├── setupDb.js            # Database setup script
│   │
│   ├── config/               # Configuration files
│   │   ├── database.js       # MySQL connection setup
│   │   ├── config.js         # App configuration and environment variables
│   │   └── cors.js           # CORS configuration
│   │
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── campaignController.js
│   │   ├── paymentController.js
│   │   ├── userController.js
│   │   └── mediaController.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── validation.js     # Request data validation
│   │   ├── errorHandler.js   # Global error handling
│   │   └── upload.js         # File upload middleware
│   │
│   ├── models/               # Database models and queries
│   │   ├── userModel.js
│   │   ├── campaignModel.js
│   │   ├── milestoneModel.js
│   │   ├── paymentModel.js
│   │   └── favoriteModel.js
│   │
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── userRoutes.js
│   │   └── mediaRoutes.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── tokenHelper.js    # JWT token generation/verification
│   │   ├── passwordHelper.js # Password hashing/verification
│   │   ├── fileHelper.js     # File manipulation utilities
│   │   └── responseFormatter.js # Standard API response format
│   │
│   └── database/             # Database setup and migration
│       ├── migrations/       # Database structure changes
│       │   ├── 001_initial_schema.sql
│       │   └── 002_models_schema.sql
│       │
│       └── seeders/          # Sample data for development
│           ├── users.js
│           └── campaigns.js
│
├── uploads/                  # File upload directory (git ignored)
├── .env                      # Environment variables (git ignored)
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore configuration
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v14+ recommended)
- MySQL (v5.7+ or v8.0+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/darb-backend.git
   cd darb-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to match your environment settings.

4. Create the MySQL database:
   ```
   CREATE DATABASE darb_crowdfunding;
   ```

5. Set up the database schema:
   ```
   npm run setup-db
   ```

### Running the Application

#### Development Mode
```
npm run dev
```

#### Production Mode
```
npm start
```

## API Documentation

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Campaigns

- `GET /api/campaigns` - List all campaigns (with filtering)
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create a new campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Delete a campaign
- `GET /api/campaigns/user/my-campaigns` - Get user's created campaigns

### Milestones

- `GET /api/campaigns/:campaignId/milestones` - Get milestones for a campaign
- `POST /api/campaigns/:campaignId/milestones` - Create a milestone
- `PUT /api/milestones/:id` - Update a milestone
- `DELETE /api/milestones/:id` - Delete a milestone
- `PATCH /api/milestones/:id/status` - Update milestone status

### Payments

- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/campaign/:campaignId` - Get campaign payments

### Media

- `POST /api/media/campaign-image` - Upload campaign image
- `POST /api/media/profile-image` - Upload profile image
- `POST /api/media/document` - Upload document
- `POST /api/media/base64` - Process base64 image

## Testing

To run the API tests:
```
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

- Project Maintainer: Your Name - youremail@example.com
- Project Link: https://github.com/yourusername/darb-backend