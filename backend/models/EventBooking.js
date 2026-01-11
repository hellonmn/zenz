const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  // Event Reference
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // Booking Type
  bookingType: {
    type: String,
    enum: ['ticket', 'stall'],
    required: true
  },

  // User Info
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    organization: { type: String }
  },

  // Ticket Booking Details
  ticketDetails: {
    quantity: { type: Number, default: 1 },
    ticketType: { type: String }
  },

  // Stall Booking Details
  stallDetails: {
    stallNumber: { type: String },
    stallType: { type: String },
    stallSize: { type: String },
    businessType: { type: String },
    description: { type: String }
  },

  // Payment
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cash'],
      default: 'upi'
    },
    transactionId: String,
    paymentDate: Date,
    screenshot: String
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingReference: {
    type: String
  },

  // Additional Info
  specialRequests: String,
  notes: String,
  adminNotes: String,

  // Confirmation
  confirmationSent: {
    type: Boolean,
    default: false
  },
  confirmationDate: Date

}, {
  timestamps: true
});

// Generate booking reference before saving
eventBookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const prefix = this.bookingType === 'stall' ? 'STL' : 'TKT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingReference = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Indexes
eventBookingSchema.index({ event: 1, status: 1 });
eventBookingSchema.index({ bookingReference: 1 }, { unique: true });
eventBookingSchema.index({ 'guestInfo.email': 1 });
eventBookingSchema.index({ user: 1 });

const EventBooking = mongoose.model('EventBooking', eventBookingSchema);

module.exports = EventBooking;
