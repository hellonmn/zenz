const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

// @desc    Get all trips (public)
// @route   GET /api/trips
// @access  Public
exports.getAllTrips = async (req, res) => {
  try {
    const { category, status, featured, popular, search, sortBy, limit = 50, page = 1 } = req.query;
    
    // Build query
    let query = { isDeleted: false };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (popular) query.popular = popular === 'true';
    
    // Search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sorting
    let sort = {};
    if (sortBy === 'price-low') sort.price = 1;
    else if (sortBy === 'price-high') sort.price = -1;
    else if (sortBy === 'rating') sort.rating = -1;
    else if (sortBy === 'newest') sort.createdAt = -1;
    else sort.createdAt = -1;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const trips = await Trip.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-isDeleted');
    
    const total = await Trip.countDocuments(query);
    
    res.json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: trips
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Public
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trips by category
// @route   GET /api/trips/category/:category
// @access  Public
exports.getTripsByCategory = async (req, res) => {
  try {
    const trips = await Trip.find({ 
      category: req.params.category,
      status: 'active',
      isDeleted: false
    }).sort({ rating: -1, createdAt: -1 });
    
    res.json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured/popular trips
// @route   GET /api/trips/featured
// @access  Public
exports.getFeaturedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ 
      featured: true,
      status: 'active',
      isDeleted: false
    }).limit(10).sort({ rating: -1 });
    
    res.json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular trips
// @route   GET /api/trips/popular
// @access  Public
exports.getPopularTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ 
      popular: true,
      status: 'active',
      isDeleted: false
    }).limit(10).sort({ rating: -1, reviews: -1 });
    
    res.json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check trip availability
// @route   GET /api/trips/:id/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const available = trip.status === 'active' && trip.availableSlots > 0;
    
    res.json({ 
      success: true, 
      available,
      availableSlots: trip.availableSlots,
      maxParticipants: trip.maxParticipants,
      status: trip.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};