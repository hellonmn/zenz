const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS Configuration - Allow all frontend URLs
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
// Event routes with error handling
try {
  const eventRoutes = require('./routes/eventRoutes');
  console.log('📍 Loading event routes, type:', typeof eventRoutes);
  app.use('/api/events', eventRoutes);
  console.log('✅ Event routes registered at /api/events');
} catch (error) {
  console.error('❌ Error loading event routes:', error.message);
  console.error(error.stack);
}
// Admin routes - upload must come BEFORE trips to avoid /:id matching "upload"
try {
  const uploadRoutes = require('./routes/uploadRoutes');
  console.log('✅ Upload routes module loaded, type:', typeof uploadRoutes);
  app.use('/api/admin/upload', uploadRoutes);
  console.log('✅ Upload routes registered at /api/admin/upload');
} catch (error) {
  console.error('❌ Error loading upload routes:', error.message);
}
app.use('/api/admin/events', require('./routes/adminEventRoutes'));
app.use('/api/admin/trips', require('./routes/adminTripRoutes'));
app.use('/api/admin/bookings', require('./routes/adminBookingRoutes'));
app.use('/api/admin/users', require('./routes/adminUserRoutes'));
app.use('/api/admin/categories', require('./routes/adminCategoryRoutes'));

// Health check
app.get('/health', (req, res) => {
  const { getDatabaseType } = require('./config/database');
  res.json({
    status: 'OK',
    message: 'Tourism API is running',
    database: getDatabaseType(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(require('./middlewares/authMiddleware').errorHandler);

module.exports = app;