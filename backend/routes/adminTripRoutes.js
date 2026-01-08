const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updatePaymentStatus,
  cancelBooking,
  getBookingStats
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);
router.patch('/:id/payment', updatePaymentStatus);
router.post('/:id/cancel', cancelBooking);

module.exports = router;