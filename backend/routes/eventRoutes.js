const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllEvents,
  getEventBySlug,
  createEventBooking,
  getBookingByReference,
  getUserBooking
} = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);
router.get('/bookings/:reference', getBookingByReference);

// Protected routes (must come before /:slug to match correctly)
router.get('/:slug/my-booking', protect, getUserBooking);
router.post('/:slug/book', createEventBooking);

// General slug route (must be last)
router.get('/:slug', getEventBySlug);

module.exports = router;
