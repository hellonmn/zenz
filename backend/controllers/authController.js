const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      location: "",
      bio: "",
      joinDate: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      profileImage: "",
      coverImage: "",
      tripCount: 0,
      photoCount: 0,
      followerCount: 0,
      followingCount: 0,
      savedTrips: []
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      bio: user.bio,
      joinDate: user.joinDate,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      tripCount: user.tripCount,
      photoCount: user.photoCount,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      savedTrips: user.savedTrips,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        bio: user.bio,
        joinDate: user.joinDate,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        tripCount: user.tripCount,
        photoCount: user.photoCount,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        savedTrips: user.savedTrips,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    location: req.user.location,
    bio: req.user.bio,
    joinDate: req.user.joinDate,
    profileImage: req.user.profileImage,
    coverImage: req.user.coverImage,
    tripCount: req.user.tripCount,
    photoCount: req.user.photoCount,
    followerCount: req.user.followerCount,
    followingCount: req.user.followingCount,
    savedTrips: req.user.savedTrips
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.location = req.body.location || user.location;
    user.bio = req.body.bio || user.bio;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.coverImage = req.body.coverImage || user.coverImage;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Optional updates
    if (req.body.tripCount !== undefined) user.tripCount = req.body.tripCount;
    if (req.body.photoCount !== undefined) user.photoCount = req.body.photoCount;
    if (req.body.followerCount !== undefined) user.followerCount = req.body.followerCount;
    if (req.body.followingCount !== undefined) user.followingCount = req.body.followingCount;
    if (req.body.savedTrips !== undefined) user.savedTrips = req.body.savedTrips;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      bio: updatedUser.bio,
      joinDate: updatedUser.joinDate,
      profileImage: updatedUser.profileImage,
      coverImage: updatedUser.coverImage,
      tripCount: updatedUser.tripCount,
      photoCount: updatedUser.photoCount,
      followerCount: updatedUser.followerCount,
      followingCount: updatedUser.followingCount,
      savedTrips: updatedUser.savedTrips,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile image
// @route   POST /api/auth/profile/upload
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Save the file path as the profileImage
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({ profileImage: user.profileImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save trip to favorites
// @route   POST /api/auth/save-trip
// @access  Private
exports.saveTrip = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const trip = req.body;
    
    if (!trip || !trip.id) {
      return res.status(400).json({ message: 'Trip id required' });
    }
    
    // Check for duplicates
    const exists = user.savedTrips.some(t => t.id === trip.id);
    
    if (exists) {
      return res.status(200).json({ 
        savedTrips: user.savedTrips, 
        message: 'Already saved' 
      });
    }
    
    user.savedTrips.push(trip);
    await user.save();
    
    res.json({ savedTrips: user.savedTrips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove trip from favorites
// @route   POST /api/auth/unsave-trip
// @access  Private
exports.unsaveTrip = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Trip id required' });
    }

    user.savedTrips = user.savedTrips.filter(t => t.id !== id);
    await user.save();

    res.json({ savedTrips: user.savedTrips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a trip
// @route   POST /api/auth/like-trip/:tripId
// @access  Private
exports.likeTrip = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID required' });
    }

    // Check if already liked
    const alreadyLiked = user.likedTrips.some(id => id.toString() === tripId);

    if (alreadyLiked) {
      return res.status(200).json({
        likedTrips: user.likedTrips,
        message: 'Already liked'
      });
    }

    user.likedTrips.push(tripId);
    await user.save();

    res.json({ likedTrips: user.likedTrips, message: 'Trip liked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unlike a trip
// @route   DELETE /api/auth/like-trip/:tripId
// @access  Private
exports.unlikeTrip = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID required' });
    }

    user.likedTrips = user.likedTrips.filter(id => id.toString() !== tripId);
    await user.save();

    res.json({ likedTrips: user.likedTrips, message: 'Trip unliked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get liked trips
// @route   GET /api/auth/liked-trips
// @access  Private
exports.getLikedTrips = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedTrips');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: user.likedTrips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};