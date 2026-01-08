const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  processRefund,
  addAdminNotes,
  getBookingStats,
  getBookingsByTrip
} = require('../controllers/adminBookingController');

// All routes require authentication and admin role
router.use(protect, admin);

router.get('/', getAllBookings);
router.get('/stats', getBookingStats);
router.get('/trip/:tripId', getBookingsByTrip);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/payment', updatePaymentStatus);
router.post('/:id/refund', processRefund);
router.patch('/:id/notes', addAdminNotes);

module.exports = router;