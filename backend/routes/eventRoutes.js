const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllEvents,
  getEventBySlug,
  createEventBooking,
  getBookingByReference
} = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);
router.get('/bookings/:reference', getBookingByReference);
router.get('/:slug', getEventBySlug);

// Protected routes
router.post('/:slug/book', createEventBooking);

module.exports = router;
