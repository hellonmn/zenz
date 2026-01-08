const express = require('express');
const router = express.Router();
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

router.post('/signup', signup);
router.post('/login', login);
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
