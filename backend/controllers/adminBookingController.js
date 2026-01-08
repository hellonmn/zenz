const Booking = require('../models/Booking');
const Trip = require('../models/Trip');

// @desc    Get all bookings - Admin view
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, tripId, userId, search, sortBy, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (tripId) query.trip = tripId;
    if (userId) query.user = userId;
    
    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    let sort = {};
    if (sortBy === 'newest') sort.createdAt = -1;
    else if (sortBy === 'oldest') sort.createdAt = 1;
    else if (sortBy === 'upcoming') sort.tripStartDate = 1;
    else if (sortBy === 'price-high') sort.totalPrice = -1;
    else if (sortBy === 'price-low') sort.totalPrice = 1;
    else sort.createdAt = -1;
    
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(query)
      .populate('trip', 'placeName city country images price duration category')
      .populate('user', 'name email phone')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID - Admin
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trip')
      .populate('user', 'name email phone location')
      .populate('cancellation.cancelledBy', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const oldStatus = booking.status;
    booking.status = status;
    
    // If confirming, update payment status
    if (status === 'confirmed' && booking.payment.status === 'pending') {
      booking.payment.status = 'completed';
      booking.payment.paymentDate = Date.now();
    }
    
    // If cancelling by admin
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      booking.cancellation = {
        cancelled: true,
        cancelledAt: Date.now(),
        cancelledBy: req.user._id,
        reason: req.body.reason || 'Cancelled by admin',
        refundAmount: booking.totalPrice,
        refundStatus: 'pending'
      };
      
      // Restore slots
      const trip = await Trip.findById(booking.trip);
      if (trip) {
        trip.availableSlots += booking.numberOfPeople;
        if (trip.status === 'full') {
          trip.status = 'active';
        }
        await trip.save();
      }
    }
    
    await booking.save();
    
    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status - Admin
// @route   PATCH /api/admin/bookings/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId, paidAmount } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.payment.status = paymentStatus;
    if (transactionId) booking.payment.transactionId = transactionId;
    if (paidAmount) booking.payment.paidAmount = paidAmount;
    booking.payment.paymentDate = Date.now();
    
    if (paymentStatus === 'completed' && booking.status === 'pending') {
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

// @desc    Process refund
// @route   POST /api/admin/bookings/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { refundAmount, refundStatus } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (!booking.cancellation.cancelled) {
      return res.status(400).json({ message: 'Booking is not cancelled' });
    }
    
    booking.cancellation.refundAmount = refundAmount || booking.cancellation.refundAmount;
    booking.cancellation.refundStatus = refundStatus;
    
    await booking.save();
    
    res.json({
      success: true,
      message: 'Refund processed',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add admin notes
// @route   PATCH /api/admin/bookings/:id/notes
// @access  Private/Admin
exports.addAdminNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.adminNotes = notes;
    await booking.save();
    
    res.json({
      success: true,
      message: 'Admin notes updated',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking statistics - Admin
// @route   GET /api/admin/bookings/stats
// @access  Private/Admin
exports.getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }
    
    const totalBookings = await Booking.countDocuments(dateQuery);
    const confirmedBookings = await Booking.countDocuments({ ...dateQuery, status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ ...dateQuery, status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ ...dateQuery, status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ ...dateQuery, status: 'completed' });
    const noShowBookings = await Booking.countDocuments({ ...dateQuery, status: 'no-show' });
    
    const revenueData = await Booking.aggregate([
      { $match: { ...dateQuery, 'payment.status': 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    const refundData = await Booking.aggregate([
      { 
        $match: { 
          ...dateQuery, 
          'cancellation.cancelled': true,
          'cancellation.refundStatus': 'processed'
        } 
      },
      { $group: { _id: null, totalRefunded: { $sum: '$cancellation.refundAmount' } } }
    ]);
    
    const totalRefunded = refundData.length > 0 ? refundData[0].totalRefunded : 0;
    
    const topTrips = await Booking.aggregate([
      { $match: { ...dateQuery, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$trip', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate trip details
    await Booking.populate(topTrips, { path: '_id', select: 'placeName city country' });
    
    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          completed: completedBookings,
          noShow: noShowBookings
        },
        revenue: {
          total: totalRevenue,
          refunded: totalRefunded,
          net: totalRevenue - totalRefunded,
          currency: 'USD'
        },
        topTrips: topTrips.map(trip => ({
          trip: trip._id,
          bookings: trip.bookings,
          revenue: trip.revenue
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings by trip
// @route   GET /api/admin/bookings/trip/:tripId
// @access  Private/Admin
exports.getBookingsByTrip = async (req, res) => {
  try {
    const bookings = await Booking.find({ trip: req.params.tripId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};