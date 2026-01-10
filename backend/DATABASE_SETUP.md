# Database Configuration Guide

This application supports both **MongoDB** and **MySQL** databases with easy switching between them.

## 🎯 Quick Start

### Switching Between Databases

Simply change the `DB_TYPE` environment variable in your `.env` file:

```env
# For MongoDB
DB_TYPE=mongodb

# For MySQL
DB_TYPE=mysql
```

That's it! The application will automatically use the appropriate database and models.

## 📋 Database Configuration

### MongoDB Setup

1. **Install MongoDB** (if not already installed):
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Configure in `.env`**:
```env
DB_TYPE=mongodb
MONGO_URI=mongodb://localhost:27017/zenz-awara
# Or for Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zenz-awara
```

3. **Start the server**:
```bash
npm run dev
```

MongoDB will automatically create collections as needed.

### MySQL Setup

1. **Your MySQL Database Credentials** (already provided):
```env
DB_TYPE=mysql
MYSQL_HOST=srv1743.hstgr.io
MYSQL_PORT=3306
MYSQL_DATABASE=u287046787_zenz
MYSQL_USERNAME=u287046787_zenz
MYSQL_PASSWORD=0xIDaUNGg1n|
```

2. **Start the server**:
```bash
npm run dev
```

The application will automatically:
- Connect to MySQL database
- Create all tables with proper relationships
- Sync the schema

## 🏗️ Architecture

### File Structure

```
backend/
├── config/
│   ├── database.js          # Database connection manager
│   └── db.js               # Old MongoDB config (deprecated)
├── models/
│   ├── User.js             # MongoDB User model
│   ├── Trip.js             # MongoDB Trip model
│   ├── Event.js            # MongoDB Event model
│   ├── Booking.js          # MongoDB Booking model
│   ├── EventBooking.js     # MongoDB EventBooking model
│   └── mysql/              # MySQL models directory
│       ├── index.js        # Model initialization
│       ├── User.js         # Sequelize User model
│       ├── Trip.js         # Sequelize Trip model
│       ├── Event.js        # Sequelize Event model
│       ├── Booking.js      # Sequelize Booking model
│       └── EventBooking.js # Sequelize EventBooking model
└── adapters/
    └── dbAdapter.js        # Database abstraction layer
```

### How It Works

1. **Database Connection** (`config/database.js`):
   - Checks `DB_TYPE` environment variable
   - Connects to the appropriate database
   - Initializes models

2. **Database Adapter** (`adapters/dbAdapter.js`):
   - Provides a unified API for both databases
   - Translates MongoDB queries to MySQL (Sequelize) and vice versa
   - Controllers use the adapter instead of models directly

3. **Models**:
   - MongoDB models use Mongoose
   - MySQL models use Sequelize
   - Both provide the same data structure

## 🔄 Migrating Data Between Databases

### From MongoDB to MySQL

```javascript
// Create a migration script: scripts/migrate-mongo-to-mysql.js
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// 1. Connect to both databases
// 2. Read from MongoDB
// 3. Write to MySQL
// 4. Verify data
```

### From MySQL to MongoDB

```javascript
// Create a migration script: scripts/migrate-mysql-to-mongo.js
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// 1. Connect to both databases
// 2. Read from MySQL
// 3. Write to MongoDB
// 4. Verify data
```

## 📊 Database Schema

### Users Table/Collection
- id/\_id
- name
- email (unique)
- password (hashed)
- phone
- role (user/admin)
- profilePicture
- dateOfBirth
- address
- isVerified
- timestamps

### Trips Table/Collection
- id/\_id
- title
- slug (unique)
- description
- destination
- duration
- price
- discountedPrice
- maxGroupSize
- difficulty
- startDate
- endDate
- images (JSON/Array)
- coverImage
- inclusions (JSON/Array)
- exclusions (JSON/Array)
- itinerary (JSON/Array)
- category
- tags (JSON/Array)
- isFeatured
- isActive
- timestamps

### Events Table/Collection
- id/\_id
- title
- slug (unique)
- tagline
- description
- edition
- bannerImage
- brochureUrl
- startDate
- endDate
- venue (JSON)
- ticketPrice
- schedule (JSON/Array)
- highlights (JSON/Array)
- contactInfo (JSON/Array)
- stallsAvailable
- stallInfo (JSON)
- status
- featured
- autoApproveBookings
- timestamps

### Bookings Table/Collection
- id/\_id
- bookingReference (unique)
- tripId/trip (foreign key)
- userId/user (foreign key)
- guestInfo (JSON)
- numberOfTravelers
- travelerDetails (JSON/Array)
- totalAmount
- status
- paymentStatus
- specialRequests
- timestamps

### Event Bookings Table/Collection
- id/\_id
- bookingReference (unique)
- eventId/event (foreign key)
- userId/user (foreign key)
- bookingType
- guestInfo (JSON)
- numberOfTickets
- stallDetails (JSON)
- totalAmount
- status
- timestamps

## 🛠️ Using the Database Adapter in Controllers

Instead of directly using models, use the DBAdapter:

```javascript
const DBAdapter = require('../adapters/dbAdapter');

// Create adapter instance
const User = new DBAdapter('User');

// Use unified methods
const users = await User.find({ role: 'admin' });
const user = await User.findById(id);
const newUser = await User.create(userData);
const updated = await User.findByIdAndUpdate(id, updateData);
await User.findByIdAndDelete(id);
```

## ⚠️ Important Notes

1. **JSON Fields**: MySQL stores JSON data as JSON type, while MongoDB stores as native objects
2. **IDs**: MongoDB uses ObjectId, MySQL uses auto-increment integers
3. **Relationships**: Sequelize handles relationships automatically, Mongoose requires manual population
4. **Transactions**: Available in both but syntax differs slightly
5. **Indexes**: Configure separately for each database for optimal performance

## 🧪 Testing

Test with both databases to ensure compatibility:

```bash
# Test with MongoDB
DB_TYPE=mongodb npm run dev

# Test with MySQL
DB_TYPE=mysql npm run dev
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Then edit `.env` with your database credentials.

## 🐛 Troubleshooting

### MySQL Connection Issues
- Verify host, port, username, and password
- Check if MySQL server is running
- Ensure database exists
- Check firewall settings

### MongoDB Connection Issues
- Verify MongoDB is running: `mongod --version`
- Check connection string format
- For Atlas, ensure IP whitelist is configured
- Verify network connectivity

### Model/Schema Issues
- Delete and recreate tables/collections if schema changes
- For MySQL: Tables auto-sync on startup
- For MongoDB: Collections auto-create on first insert

## 🚀 Performance Tips

### MongoDB
- Create indexes on frequently queried fields
- Use projection to limit returned fields
- Use aggregation pipeline for complex queries

### MySQL
- Define indexes in model definitions
- Use `attributes` to select specific columns
- Use eager loading (`include`) wisely to avoid N+1 queries

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
