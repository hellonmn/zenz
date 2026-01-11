const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String, default: "" },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  joinDate: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  tripCount: { type: Number, default: 0 },
  photoCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  // OAuth fields
  googleId: { type: String, sparse: true },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  savedTrips: [
    {
      id: Number,
      name: String,
      location: String,
      date: String,
      image: String
    }
  ],
  likedTrips: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    }
  ]
}, { timestamps: true });

// Hash password before saving (only for local auth)
UserSchema.pre('save', async function(next) {
  // Skip password hashing for OAuth users
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);