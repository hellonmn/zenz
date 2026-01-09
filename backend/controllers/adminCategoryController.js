const Trip = require('../models/Trip');

// Predefined categories based on Trip model enum
const CATEGORIES = [
  { name: 'Historical', icon: '🏛️', description: 'Explore ancient monuments and heritage sites', color: '#8b5cf6' },
  { name: 'Cultural', icon: '🎭', description: 'Experience rich cultural traditions', color: '#ec4899' },
  { name: 'Modern', icon: '🏙️', description: 'Discover contemporary urban attractions', color: '#3b82f6' },
  { name: 'Beaches', icon: '🏖️', description: 'Relax on beautiful coastal destinations', color: '#06b6d4' },
  { name: 'Spiritual', icon: '🕉️', description: 'Journey to sacred and peaceful places', color: '#ef4444' },
  { name: 'Adventure', icon: '🏔️', description: 'Exciting outdoor activities and thrills', color: '#10b981' },
  { name: 'Nature', icon: '🌲', description: 'Explore pristine natural landscapes', color: '#f59e0b' }
];

// @desc    Get all categories with trip counts
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res) => {
  try {
    // Get trip counts for each category
    const categoriesWithCounts = await Promise.all(
      CATEGORIES.map(async (category) => {
        const tripCount = await Trip.countDocuments({
          category: category.name,
          isDeleted: false
        });

        return {
          _id: category.name.toLowerCase(),
          name: category.name,
          icon: category.icon,
          description: category.description,
          color: category.color,
          tripCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description, color } = req.body;

    // Validate required fields
    if (!name || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Name and icon are required'
      });
    }

    // Check if category already exists
    const existingCategory = CATEGORIES.find(
      cat => cat.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    // Note: Since categories are enum-based in the Trip model,
    // you would need to manually add the category to the CATEGORIES array
    // and update the Trip model's enum to actually persist this
    const newCategory = {
      _id: name.toLowerCase(),
      name,
      icon,
      description: description || '',
      color: color || '#10b981',
      tripCount: 0
    };

    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully. Note: You need to update the Trip model enum to persist this category.'
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, description, color } = req.body;
    const categoryId = req.params.id;

    // Find the category
    const categoryIndex = CATEGORIES.findIndex(
      cat => cat.name.toLowerCase() === categoryId
    );

    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Note: This updates the in-memory array, not persistent storage
    // You would need to implement a Category model for persistence
    const updatedCategory = {
      _id: categoryId,
      name: name || CATEGORIES[categoryIndex].name,
      icon: icon || CATEGORIES[categoryIndex].icon,
      description: description || CATEGORIES[categoryIndex].description,
      color: color || CATEGORIES[categoryIndex].color,
      tripCount: await Trip.countDocuments({
        category: CATEGORIES[categoryIndex].name,
        isDeleted: false
      })
    };

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully. Note: Changes are not persisted. Implement a Category model for persistence.'
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category
    const category = CATEGORIES.find(
      cat => cat.name.toLowerCase() === categoryId
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has trips
    const tripCount = await Trip.countDocuments({
      category: category.name,
      isDeleted: false
    });

    if (tripCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it has ${tripCount} trip(s). Please reassign or delete those trips first.`
      });
    }

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully. Note: You need to remove it from the CATEGORIES array and Trip model enum to persist this change.`
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/admin/categories/stats
// @access  Private/Admin
exports.getCategoryStats = async (req, res) => {
  try {
    const totalCategories = CATEGORIES.length;

    const categoriesWithTrips = await Promise.all(
      CATEGORIES.map(async (category) => {
        const tripCount = await Trip.countDocuments({
          category: category.name,
          isDeleted: false
        });
        return tripCount > 0 ? 1 : 0;
      })
    );

    const activeCategories = categoriesWithTrips.reduce((sum, val) => sum + val, 0);
    const emptyCategories = totalCategories - activeCategories;

    // Get most popular category
    const categoryTrips = await Promise.all(
      CATEGORIES.map(async (category) => ({
        name: category.name,
        count: await Trip.countDocuments({
          category: category.name,
          isDeleted: false
        })
      }))
    );

    const mostPopular = categoryTrips.reduce(
      (max, cat) => (cat.count > max.count ? cat : max),
      { name: '', count: 0 }
    );

    res.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        emptyCategories,
        mostPopularCategory: mostPopular.name,
        mostPopularCount: mostPopular.count
      }
    });
  } catch (error) {
    console.error('Error in getCategoryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
};
