// server.js 
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDatabase } = require('./config/database');

connectDatabase();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  // Start keep-alive in production
  if (process.env.NODE_ENV === 'production') {
    startKeepAlive();
  }
});

// Keep-alive function to prevent Render from spinning down
const startKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  
  setInterval(async () => {
    try {
      const response = await fetch(`${url}/health`);
      const data = await response.json();
      console.log(`✅ Keep-alive ping successful: ${data.status} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Keep-alive ping failed:', error.message);
    }
  }, 14 * 60 * 1000); // Ping every 14 minutes
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing server gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});