const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// Database type selection - change this to switch databases
const DB_TYPE = process.env.DB_TYPE || 'mongodb'; // 'mongodb' or 'mysql'

// MongoDB Configuration
const mongoConfig = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/zenz-awara',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

// MySQL Configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'srv1743.hstgr.io',
  database: process.env.MYSQL_DATABASE || 'u287046787_zenz',
  username: process.env.MYSQL_USERNAME || 'u287046787_zenz',
  password: process.env.MYSQL_PASSWORD || '0xIDaUNGg1n|',
  port: process.env.MYSQL_PORT || 3306,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Sequelize instance for MySQL
let sequelize = null;

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MySQL
const connectMySQL = async () => {
  try {
    sequelize = new Sequelize(
      mysqlConfig.database,
      mysqlConfig.username,
      mysqlConfig.password,
      {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        dialect: mysqlConfig.dialect,
        logging: mysqlConfig.logging,
        pool: mysqlConfig.pool
      }
    );

    await sequelize.authenticate();
    console.log('✓ MySQL connected successfully');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✓ MySQL tables synchronized');
  } catch (error) {
    console.error('✗ MySQL connection error:', error.message);
    process.exit(1);
  }
};

// Main connection function
const connectDatabase = async () => {
  console.log(`\n🔌 Connecting to ${DB_TYPE.toUpperCase()} database...`);

  if (DB_TYPE === 'mysql') {
    await connectMySQL();
  } else if (DB_TYPE === 'mongodb') {
    await connectMongoDB();
  } else {
    throw new Error(`Invalid DB_TYPE: ${DB_TYPE}. Must be 'mongodb' or 'mysql'`);
  }
};

// Get current database type
const getDatabaseType = () => DB_TYPE;

// Get Sequelize instance (for MySQL)
const getSequelize = () => {
  if (DB_TYPE !== 'mysql') {
    throw new Error('Sequelize is only available when using MySQL');
  }
  return sequelize;
};

module.exports = {
  connectDatabase,
  getDatabaseType,
  getSequelize,
  DB_TYPE
};
