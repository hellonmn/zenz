const path = require('path');
const fs = require('fs').promises;

// @desc    Upload images
// @route   POST /api/admin/upload
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Get the uploaded file URLs
    const urls = req.files.map(file => {
      // Return relative URL path
      return `/uploads/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      message: `${urls.length} image(s) uploaded successfully`,
      data: {
        urls,
        count: urls.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// @desc    Delete uploaded image
// @route   DELETE /api/admin/upload/:filename
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
