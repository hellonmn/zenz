const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  placeName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  flag: { type: String, default: "🇮🇳" },
  category: { 
    type: String, 
    enum: ['Historical', 'Cultural', 'Modern', 'Beaches', 'Spiritual', 'Adventure', 'Nature'],
    required: true 
  },
  description: { type: String, required: true },
  artImg: { type: String, default: "" },
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  
  // Trip details
  duration: { type: String, required: true }, // e.g., "8 days"
  startDate: { type: Date },
  endDate: { type: Date },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  
  // Availability
  maxParticipants: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'full', 'cancelled'],
    default: 'active'
  },
  
  // Inclusions
  inclusions: [{
    icon: String,
    label: String,
    included: { type: Boolean, default: true }
  }],
  
  // Weather info
  weather: {
    icon: String,
    label: String,
    temp: Number,
    time: String
  },
  
  // Itinerary
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String]
  }],
  
  // Additional info
  highlights: [String],
  whatToExpect: String,
  importantInfo: [String],
  cancellationPolicy: String,
  
  // Meta
  featured: { type: Boolean, default: false },
  popular: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index for search and filtering
TripSchema.index({ placeName: 'text', city: 'text', description: 'text' });
TripSchema.index({ category: 1, status: 1 });
TripSchema.index({ popular: -1, featured: -1 });

module.exports = mongoose.model('Trip', TripSchema);