const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

// @desc    Create new trip
// @route   POST /api/admin/trips
// @access  Private/Admin
exports.createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    // Set availableSlots equal to maxParticipants initially
    if (!tripData.availableSlots && tripData.maxParticipants) {
      tripData.availableSlots = tripData.maxParticipants;
    }
    
    const trip = await Trip.create(tripData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Trip created successfully',
      data: trip 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update trip
// @route   PUT /api/admin/trips/:id
// @access  Private/Admin
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Prevent updating availableSlots directly if there are bookings
    if (req.body.availableSlots !== undefined) {
      const bookingCount = await Booking.countDocuments({
        trip: trip._id,
        status: { $in: ['confirmed', 'pending'] }
      });
      
      if (bookingCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot update available slots directly when bookings exist. Cancel bookings first or adjust maxParticipants.' 
        });
      }
    }
    
    Object.assign(trip, req.body);
    await trip.save();
    
    res.json({ 
      success: true, 
      message: 'Trip updated successfully',
      data: trip 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete trip (soft delete)
// @route   DELETE /api/admin/trips/:id
// @access  Private/Admin
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      trip: trip._id,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: `Cannot delete trip with ${activeBookings} active booking(s). Cancel bookings first.` 
      });
    }
    
    trip.isDeleted = true;
    trip.status = 'cancelled';
    await trip.save();
    
    res.json({ 
      success: true, 
      message: 'Trip deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trips (including deleted) - Admin view
// @route   GET /api/admin/trips
// @access  Private/Admin
exports.getAllTripsAdmin = async (req, res) => {
  try {
    const { category, status, includeDeleted, search, sortBy, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (!includeDeleted || includeDeleted === 'false') {
      query.isDeleted = false;
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$text = { $search: search };
    }
    
    let sort = {};
    if (sortBy === 'price-low') sort.price = 1;
    else if (sortBy === 'price-high') sort.price = -1;
    else if (sortBy === 'rating') sort.rating = -1;
    else if (sortBy === 'newest') sort.createdAt = -1;
    else sort.createdAt = -1;
    
    const skip = (page - 1) * limit;
    
    const trips = await Trip.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('createdBy', 'name email');
    
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

// @desc    Update trip status
// @route   PATCH /api/admin/trips/:id/status
// @access  Private/Admin
exports.updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'full', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    trip.status = status;
    await trip.save();
    
    res.json({ 
      success: true, 
      message: `Trip status updated to ${status}`,
      data: trip 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/trips/:id/featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    trip.featured = !trip.featured;
    await trip.save();
    
    res.json({ 
      success: true, 
      message: `Trip ${trip.featured ? 'featured' : 'unfeatured'}`,
      data: trip 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle popular status
// @route   PATCH /api/admin/trips/:id/popular
// @access  Private/Admin
exports.togglePopular = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    trip.popular = !trip.popular;
    await trip.save();
    
    res.json({ 
      success: true, 
      message: `Trip marked as ${trip.popular ? 'popular' : 'not popular'}`,
      data: trip 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trip statistics
// @route   GET /api/admin/trips/:id/stats
// @access  Private/Admin
exports.getTripStats = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const totalBookings = await Booking.countDocuments({ trip: trip._id });
    const confirmedBookings = await Booking.countDocuments({ 
      trip: trip._id, 
      status: 'confirmed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      trip: trip._id, 
      status: 'pending' 
    });
    const cancelledBookings = await Booking.countDocuments({ 
      trip: trip._id, 
      status: 'cancelled' 
    });
    
    const revenueData = await Booking.aggregate([
      { $match: { trip: trip._id, 'payment.status': 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    const bookedSlots = trip.maxParticipants - trip.availableSlots;
    const occupancyRate = trip.maxParticipants > 0 
      ? ((bookedSlots / trip.maxParticipants) * 100).toFixed(2) 
      : 0;
    
    res.json({
      success: true,
      data: {
        tripInfo: {
          name: trip.placeName,
          status: trip.status,
          maxParticipants: trip.maxParticipants,
          availableSlots: trip.availableSlots,
          bookedSlots,
          occupancyRate: `${occupancyRate}%`
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings
        },
        revenue: {
          total: totalRevenue,
          currency: trip.currency
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};