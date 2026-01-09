const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/adminCategoryController');

// All routes require authentication and admin role
router.use(protect, admin);

router.get('/', getAllCategories);
router.get('/stats', getCategoryStats);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
