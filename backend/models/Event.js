const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String }
});

const dayScheduleSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, required: true },
  scheduleItems: [scheduleItemSchema]
});

const highlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const eventSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  edition: {
    type: String,
    default: 'Edition 1'
  },
  tagline: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },

  // Images
  bannerImage: {
    type: String,
    required: true
  },
  brochureUrl: {
    type: String
  },
  galleryImages: [{
    type: String
  }],

  // Event Details
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    mapLink: { type: String }
  },

  // Pricing
  ticketPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Content Sections
  aboutEvent: {
    type: String,
    required: true
  },
  aboutOrganizers: {
    type: String
  },
  highlights: [highlightSchema],
  schedule: [dayScheduleSchema],

  // Organizers
  organizers: [{
    name: { type: String },
    logo: { type: String }
  }],

  // Celebrity/Guest Info
  celebrityGuests: [{
    name: { type: String },
    image: { type: String },
    description: { type: String }
  }],

  // Stall Booking Info
  stallsAvailable: {
    type: Boolean,
    default: false
  },
  stallInfo: {
    totalStalls: { type: Number, default: 0 },
    bookedStalls: { type: Number, default: 0 },
    stallTypes: [{
      name: { type: String },
      size: { type: String },
      price: { type: Number },
      description: { type: String }
    }]
  },

  // Contact Info
  contactInfo: [{
    name: { type: String },
    role: { type: String },
    phone: { type: String },
    email: { type: String }
  }],

  // Rules & Guidelines
  rulesGuidelines: [{
    type: String
  }],

  // Payment Info
  paymentInfo: {
    accountHolder: { type: String },
    upiId: { type: String },
    qrCodeUrl: { type: String }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'cancelled'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  autoApproveBookings: {
    type: Boolean,
    default: false
  },

  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaDescription: {
    type: String
  },

  // Stats
  viewCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create slug from title before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', tagline: 'text' });
eventSchema.index({ slug: 1 });
eventSchema.index({ status: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
