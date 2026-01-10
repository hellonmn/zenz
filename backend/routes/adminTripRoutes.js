const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createTrip,
  updateTrip,
  deleteTrip,
  getAllTripsAdmin,
  updateTripStatus,
  toggleFeatured,
  togglePopular,
  getTripStats
} = require('../controllers/adminTripController');

// All routes require authentication and admin authorization
router.use(protect);
// Uncomment the line below if you have role-based authorization
// router.use(authorize('admin'));

// Trip CRUD
router.route('/')
  .get(getAllTripsAdmin)
  .post(createTrip);

router.route('/:id')
  .put(updateTrip)
  .delete(deleteTrip);

// Trip management
router.patch('/:id/status', updateTripStatus);
router.patch('/:id/featured', toggleFeatured);
router.patch('/:id/popular', togglePopular);
router.get('/:id/stats', getTripStats);

module.exports = router;
