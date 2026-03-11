# Stock Trading Simulation Platform

A full-stack stock trading simulation platform that allows users to practice buying and selling stocks with virtual funds. Built using MongoDB, Express.js, React.js, and Node.js (MERN stack).

## Features

### Core Features
- **Virtual Trading**: Practice buying and selling stocks with $100,000 virtual funds
- **Real-time Stock Data**: Simulated stock prices with historical data
- **Portfolio Management**: Track holdings, performance, and diversification
- **Transaction History**: Complete record of all buy/sell transactions
- **Watchlist**: Add stocks to watchlist with price alerts
- **User Authentication**: Secure registration and login with JWT tokens

### Advanced Features
- **Admin Panel**: Complete administrative control over users and stocks
- **Analytics Dashboard**: Detailed portfolio analytics and market insights
- **Price Alerts**: Set custom price alerts for watchlist stocks
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live price updates and portfolio calculations

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### Frontend
- **React.js** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Toastify** - Notifications

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stock-trading-app
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-trading
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

### 4. Database Setup

#### Option A: Local MongoDB
- Install MongoDB locally
- Start MongoDB service
- The application will connect to `mongodb://localhost:27017/stock-trading`

#### Option B: MongoDB Atlas
- Create a free MongoDB Atlas account
- Create a new cluster
- Get your connection string and update `MONGODB_URI` in `.env`

### 5. Seed the Database

Run the seed script to populate the database with sample stocks and users:
```bash
node scripts/seed.js
```

This will create:
- 15 sample stocks with realistic data and price history
- Admin user: `admin@stocksim.com` / `admin123`
- Demo user: `demo@example.com` / `demo123`

### 6. Start the Application

#### Start Backend Server
```bash
npm run server
```
or
```bash
npm start
```

#### Start Frontend Development Server
Open a new terminal:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000

## Project Structure

```
stock-trading-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── package.json
├── models/                # MongoDB models
├── routes/                # Express routes
├── middleware/            # Custom middleware
├── controllers/           # Route controllers
├── utils/                 # Utility functions
├── scripts/               # Database scripts
├── server.js              # Express server
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Stocks
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get stock by ID
- `GET /api/stocks/symbol/:symbol` - Get stock by symbol
- `GET /api/stocks/trending/list` - Get trending stocks
- `GET /api/stocks/gainers/list` - Get top gainers
- `GET /api/stocks/losers/list` - Get top losers

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/holdings` - Get detailed holdings
- `GET /api/portfolio/performance` - Get performance data

### Transactions
- `POST /api/transactions/buy` - Execute buy transaction
- `POST /api/transactions/sell` - Execute sell transaction
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/summary/stats` - Get transaction summary

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist/add` - Add stock to watchlist
- `DELETE /api/watchlist/:stockId` - Remove from watchlist
- `PUT /api/watchlist/:stockId/alert` - Update price alert

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stocks` - Get all stocks (admin)
- `POST /api/admin/stocks` - Create new stock
- `PUT /api/admin/stocks/:id` - Update stock
- `DELETE /api/admin/stocks/:id` - Delete stock

## Usage

### For Users
1. **Register/Login**: Create an account or use demo credentials
2. **Browse Stocks**: View available stocks with real-time prices
3. **Trade Stocks**: Buy and sell stocks with virtual funds
4. **Manage Portfolio**: Track your holdings and performance
5. **Set Watchlist**: Add stocks to track with price alerts
6. **View History**: Check your transaction history

### For Admins
1. **Admin Dashboard**: Monitor platform activity
2. **User Management**: Manage user accounts
3. **Stock Management**: Add/update/remove stocks
4. **Analytics**: View platform analytics and insights

## Development

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
npm start
```

### Environment Variables
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: Token expiration time (default: 7d)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Future Enhancements

- [ ] Real-time WebSocket integration
- [ ] Advanced charting tools
- [ ] Mobile app development
- [ ] Social trading features
- [ ] Advanced order types (limit, stop-loss)
- [ ] Portfolio rebalancing suggestions
- [ ] Educational resources and tutorials
- [ ] Paper trading competitions
- [ ] Integration with real market data APIs
- [ ] Multi-currency support
