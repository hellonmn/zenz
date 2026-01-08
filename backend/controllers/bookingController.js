const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (logged in users only)
exports.createBooking = async (req, res) => {
  try {
    const { 
      tripId, 
      numberOfPeople, 
      customerDetails, 
      participants,
      paymentMethod,
      tripStartDate 
    } = req.body;
    
    // Validate trip
    const trip = await Trip.findById(tripId);
    
    if (!trip || trip.isDeleted) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.status !== 'active') {
      return res.status(400).json({ message: 'Trip is not available for booking' });
    }
    
    // Check availability
    if (trip.availableSlots < numberOfPeople) {
      return res.status(400).json({ 
        message: `Only ${trip.availableSlots} slots available` 
      });
    }
    
    // Calculate total price
    const totalPrice = trip.price * numberOfPeople;

    // Generate booking reference
    const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create booking
    const booking = await Booking.create({
      trip: tripId,
      user: req.user._id,
      numberOfPeople,
      totalPrice,
      tripStartDate: tripStartDate || trip.startDate,
      bookingReference,
      customerDetails: {
        name: customerDetails.name || req.user.name,
        email: customerDetails.email || req.user.email,
        phone: customerDetails.phone || '',
        emergencyContact: customerDetails.emergencyContact,
        specialRequests: customerDetails.specialRequests
      },
      participants: participants || [],
      payment: {
        method: paymentMethod,
        status: 'pending'
      }
    });
    
    // Update trip available slots
    trip.availableSlots -= numberOfPeople;
    if (trip.availableSlots === 0) {
      trip.status = 'full';
    }
    await trip.save();
    
    // Populate trip details
    await booking.populate('trip', 'placeName city country images price duration');
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, sortBy = 'newest' } = req.query;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    let sort = {};
    if (sortBy === 'newest') sort.createdAt = -1;
    else if (sortBy === 'oldest') sort.createdAt = 1;
    else if (sortBy === 'upcoming') sort.tripStartDate = 1;
    else sort.createdAt = -1;
    
    const bookings = await Booking.find(query)
      .populate('trip', 'placeName city country images price duration category')
      .sort(sort);
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trip')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PATCH /api/bookings/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId, paidAmount } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    booking.payment.status = paymentStatus;
    booking.payment.transactionId = transactionId;
    booking.payment.paidAmount = paidAmount || booking.totalPrice;
    booking.payment.paymentDate = Date.now();
    
    if (paymentStatus === 'completed') {
      booking.status = 'confirmed';
    }
    
    await booking.save();
    
    res.json({
      success: true,
      message: 'Payment status updated',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id).populate('trip');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }
    
    // Calculate refund based on cancellation policy (simplified)
    const daysUntilTrip = Math.ceil((new Date(booking.tripStartDate) - new Date()) / (1000 * 60 * 60 * 24));
    let refundAmount = 0;
    
    if (daysUntilTrip > 7) {
      refundAmount = booking.totalPrice * 0.9; // 90% refund
    } else if (daysUntilTrip > 3) {
      refundAmount = booking.totalPrice * 0.5; // 50% refund
    } // No refund if less than 3 days
    
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelled: true,
      cancelledAt: Date.now(),
      cancelledBy: req.user._id,
      reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'rejected'
    };
    
    await booking.save();
    
    // Restore available slots
    const trip = await Trip.findById(booking.trip._id);
    if (trip) {
      trip.availableSlots += booking.numberOfPeople;
      if (trip.status === 'full') {
        trip.status = 'active';
      }
      await trip.save();
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking statistics for user
// @route   GET /api/bookings/stats
// @access  Private
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ user: req.user._id });
    const confirmedBookings = await Booking.countDocuments({ 
      user: req.user._id, 
      status: 'confirmed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      user: req.user._id, 
      status: 'pending' 
    });
    const cancelledBookings = await Booking.countDocuments({ 
      user: req.user._id, 
      status: 'cancelled' 
    });
    const completedBookings = await Booking.countDocuments({ 
      user: req.user._id, 
      status: 'completed' 
    });
    
    const spendingData = await Booking.aggregate([
      { $match: { user: req.user._id, 'payment.status': 'completed' } },
      { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
    ]);
    
    const totalSpent = spendingData.length > 0 ? spendingData[0].totalSpent : 0;
    
    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        spending: {
          total: totalSpent,
          currency: 'USD'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};