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

// Upload banner image
router.post('/banner', upload.single('banner'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No banner image provided' });
    }

    const bannerUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      message: 'Banner uploaded successfully',
      bannerUrl
    });
  } catch (error) {
    console.error('Banner upload error:', error);
    res.status(500).json({ message: 'Failed to upload banner', error: error.message });
  }
});

// Upload brochure PDF
router.post('/brochure', upload.single('brochure'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No brochure file provided' });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    const brochureUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      message: 'Brochure uploaded successfully',
      brochureUrl
    });
  } catch (error) {
    console.error('Brochure upload error:', error);
    res.status(500).json({ message: 'Failed to upload brochure', error: error.message });
  }
});

// Delete an image
router.delete('/:filename', deleteImage);

module.exports = router;
