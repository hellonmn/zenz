const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventBookings,
  updateBookingStatus,
  getEventStats
} = require('../controllers/adminEventController');

// All routes require authentication
router.use(protect);

// Event CRUD
router.route('/')
  .get(getAllEventsAdmin)
  .post(createEvent);

router.route('/:id')
  .get(getEventById)
  .put(updateEvent)
  .delete(deleteEvent);

// Event bookings
router.get('/:id/bookings', getEventBookings);
router.get('/:id/stats', getEventStats);

// Booking management
router.patch('/bookings/:id/status', updateBookingStatus);

module.exports = router;
