const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  trip: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Booking details
  numberOfPeople: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  tripStartDate: { type: Date, required: true },
  
  // Customer details
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    emergencyContact: String,
    specialRequests: String
  },
  
  // Participants info (if booking for multiple people)
  participants: [{
    name: String,
    age: Number,
    idNumber: String
  }],
  
  // Payment info
  payment: {
    method: { 
      type: String, 
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: Number,
    paymentDate: Date
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  
  // Cancellation
  cancellation: {
    cancelled: { type: Boolean, default: false },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    refundAmount: Number,
    refundStatus: { 
      type: String, 
      enum: ['pending', 'processed', 'rejected'] 
    }
  },
  
  // Reference number
  bookingReference: { type: String },

  // Notes (admin only)
  adminNotes: String
}, { timestamps: true });

// Generate booking reference before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    this.bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Index for queries
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ trip: 1, status: 1 });
BookingSchema.index({ bookingReference: 1 }, { unique: true });
BookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);