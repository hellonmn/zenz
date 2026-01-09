import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    color: '#10b981',
  });

  const iconOptions = [
    { value: '🏔️', label: 'Mountain' },
    { value: '🏖️', label: 'Beach' },
    { value: '🏛️', label: 'Heritage' },
    { value: '🦁', label: 'Wildlife' },
    { value: '🕉️', label: 'Pilgrimage' },
    { value: '⛰️', label: 'Hill Station' },
    { value: '🏜️', label: 'Desert' },
    { value: '🌲', label: 'Forest' },
    { value: '🏕️', label: 'Camping' },
    { value: '🚣', label: 'Water Sports' },
    { value: '🎿', label: 'Snow' },
    { value: '🏰', label: 'Castle' },
  ];

  const colorOptions = [
    { value: '#10b981', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#ec4899', label: 'Pink' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use default categories as fallback
      const defaultCategories = [
        { _id: '1', name: 'Adventure', icon: '🏔️', description: 'Exciting outdoor activities', color: '#10b981', tripCount: 0 },
        { _id: '2', name: 'Beach', icon: '🏖️', description: 'Coastal destinations', color: '#3b82f6', tripCount: 0 },
        { _id: '3', name: 'Heritage', icon: '🏛️', description: 'Historical sites', color: '#8b5cf6', tripCount: 0 },
        { _id: '4', name: 'Wildlife', icon: '🦁', description: 'Safari and nature', color: '#f59e0b', tripCount: 0 },
        { _id: '5', name: 'Pilgrimage', icon: '🕉️', description: 'Spiritual journeys', color: '#ef4444', tripCount: 0 },
        { _id: '6', name: 'Hill Station', icon: '⛰️', description: 'Mountain retreats', color: '#06b6d4', tripCount: 0 },
      ];
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormData({
      name: '',
      icon: '🏔️',
      description: '',
      color: '#10b981',
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      icon: category.icon || '🏔️',
      description: category.description || '',
      color: category.color || '#10b981',
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (category?.tripCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.tripCount} trips. Please reassign or delete those trips first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        setCategories(categories.filter(c => c._id !== categoryId));
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (showEditModal) {
        await adminService.updateCategory(selectedCategory._id, formData);
        setCategories(categories.map(c =>
          c._id === selectedCategory._id ? { ...c, ...formData } : c
        ));
        alert('Category updated successfully!');
        setShowEditModal(false);
      } else {
        const response = await adminService.createCategory(formData);
        setCategories([...categories, response.data]);
        alert('Category created successfully!');
        setShowAddModal(false);
      }
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="space-y-3">
                <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
        <button
          onClick={handleAddCategory}
          className="px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 flex items-center gap-2 transition-colors"
        >
          <i className="fi fi-rr-plus"></i>
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Categories</p>
            <p className="text-3xl font-bold text-green-900">
              {categories.filter(c => c.tripCount > 0).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Empty Categories</p>
            <p className="text-3xl font-bold text-orange-900">
              {categories.filter(c => !c.tripCount || c.tripCount === 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-32 flex items-center justify-center"
              style={{ backgroundColor: category.color + '20' }}
            >
              <span className="text-6xl">{category.icon}</span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {category.tripCount || 0} trips
                </span>
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: category.color }}
                  title={`Color: ${category.color}`}
                />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"
                >
                  <i className="fi fi-rr-edit mr-2"></i>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                  disabled={category.tripCount > 0}
                >
                  <i className="fi fi-rr-trash mr-2"></i>
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {showEditModal ? 'Edit Category' : 'Add Category'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fi fi-rr-cross text-xl"></i>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="e.g., Adventure"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon *
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {iconOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={`p-3 text-3xl rounded-xl border-2 transition-colors ${
                            formData.icon === option.value
                              ? 'border-green-900 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={option.label}
                        >
                          {option.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color *
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: option.value })}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData.color === option.value
                              ? 'border-gray-900 scale-110'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: option.value }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                      placeholder="Brief description..."
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div
                        className="h-24 flex items-center justify-center"
                        style={{ backgroundColor: formData.color + '20' }}
                      >
                        <span className="text-5xl">{formData.icon}</span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900">{formData.name || 'Category Name'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{formData.description || 'Description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 transition-colors font-semibold"
                    >
                      {showEditModal ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
