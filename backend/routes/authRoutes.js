const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { signup, login, getProfile, updateProfile, uploadProfileImage, saveTrip, unsaveTrip, likeTrip, unlikeTrip, getLikedTrips } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// Local auth routes
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }
);

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/upload', protect, upload.single('profileImage'), uploadProfileImage);
router.post('/save-trip', protect, saveTrip);
router.post('/unsave-trip', protect, unsaveTrip);

// Like/Unlike routes
router.post('/like-trip/:tripId', protect, likeTrip);
router.delete('/like-trip/:tripId', protect, unlikeTrip);
router.get('/liked-trips', protect, getLikedTrips);

module.exports = router;
