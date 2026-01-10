const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');
const { uploadImages, deleteImage } = require('../controllers/uploadController');

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Upload route is working!' });
});

// All routes require authentication
router.use(protect);

// Upload multiple images
router.post('/', upload.array('images', 10), uploadImages);

// Delete an image
router.delete('/:filename', deleteImage);

module.exports = router;
