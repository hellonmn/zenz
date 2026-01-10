const Event = require('../models/Event');
const EventBooking = require('../models/EventBooking');

// @desc    Get all events (admin)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEventsAdmin = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('createdBy', 'name email');

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event (admin)
// @route   GET /api/admin/events/:id
// @access  Private/Admin
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/admin/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check for active bookings
    const activeBookings = await EventBooking.countDocuments({
      event: event._id,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: `Cannot delete event with ${activeBookings} active booking(s)`
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event bookings
// @route   GET /api/admin/events/:id/bookings
// @access  Private/Admin
exports.getEventBookings = async (req, res) => {
  try {
    const { status, bookingType, page = 1, limit = 50 } = req.query;
    let query = { event: req.params.id };

    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;

    const skip = (page - 1) * limit;

    const bookings = await EventBooking.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email')
      .populate('event', 'title startDate');

    const total = await EventBooking.countDocuments(query);

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

// @desc    Update booking status
// @route   PATCH /api/admin/events/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;

    if (status === 'confirmed') {
      booking.confirmationDate = new Date();
      booking.confirmationSent = true;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event statistics
// @route   GET /api/admin/events/:id/stats
// @access  Private/Admin
exports.getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalBookings = await EventBooking.countDocuments({ event: event._id });
    const confirmedBookings = await EventBooking.countDocuments({
      event: event._id,
      status: 'confirmed'
    });
    const pendingBookings = await EventBooking.countDocuments({
      event: event._id,
      status: 'pending'
    });

    const ticketBookings = await EventBooking.countDocuments({
      event: event._id,
      bookingType: 'ticket'
    });
    const stallBookings = await EventBooking.countDocuments({
      event: event._id,
      bookingType: 'stall'
    });

    const revenueData = await EventBooking.aggregate([
      {
        $match: {
          event: event._id,
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        eventInfo: {
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          viewCount: event.viewCount
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          tickets: ticketBookings,
          stalls: stallBookings
        },
        stalls: {
          total: event.stallInfo?.totalStalls || 0,
          booked: event.stallInfo?.bookedStalls || 0,
          available: (event.stallInfo?.totalStalls || 0) - (event.stallInfo?.bookedStalls || 0)
        },
        revenue: {
          total: totalRevenue,
          currency: event.currency
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
