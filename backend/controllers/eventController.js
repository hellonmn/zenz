const Event = require('../models/Event');
const EventBooking = require('../models/EventBooking');

// @desc    Get all published events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { featured, upcoming, search } = req.query;
    let query = { status: 'published' };

    if (featured === 'true') {
      query.featured = true;
    }

    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by slug
// @route   GET /api/events/:slug
// @access  Public
exports.getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    event.viewCount += 1;
    await event.save();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event booking
// @route   POST /api/events/:slug/book
// @access  Public
exports.createEventBooking = async (req, res) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const bookingData = {
      event: event._id,
      ...req.body,
      user: req.user?._id
    };

    const booking = await EventBooking.create(bookingData);

    // Update event booking count
    event.bookingCount += 1;
    if (req.body.bookingType === 'stall') {
      event.stallInfo.bookedStalls += 1;
    }
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by reference
// @route   GET /api/events/bookings/:reference
// @access  Public
exports.getBookingByReference = async (req, res) => {
  try {
    const booking = await EventBooking.findOne({
      bookingReference: req.params.reference
    }).populate('event', 'title startDate endDate venue');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
