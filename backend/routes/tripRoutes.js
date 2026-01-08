const express = require('express');
const router = express.Router();
const {
  getAllTrips,
  getTripById,
  getTripsByCategory,
  getFeaturedTrips,
  getPopularTrips,
  checkAvailability
} = require('../controllers/tripController');

// Public routes
router.get('/', getAllTrips);
router.get('/featured', getFeaturedTrips);
router.get('/popular', getPopularTrips);
router.get('/category/:category', getTripsByCategory);
router.get('/:id', getTripById);
router.get('/:id/availability', checkAvailability);

module.exports = router;