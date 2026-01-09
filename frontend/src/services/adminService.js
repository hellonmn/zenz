// src/services/adminService.js
import apiRequest from './api';

export const adminService = {
  // ===== TRIPS =====
  
  // Get all trips (admin view)
  getAllTrips: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/trips?${queryParams}`);
  },

  // Create trip
  createTrip: async (tripData) => {
    return await apiRequest('/admin/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  // Update trip
  updateTrip: async (id, tripData) => {
    return await apiRequest(`/admin/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },

  // Delete trip
  deleteTrip: async (id) => {
    return await apiRequest(`/admin/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // Update trip status
  updateTripStatus: async (id, status) => {
    return await apiRequest(`/admin/trips/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Toggle featured
  toggleFeatured: async (id) => {
    return await apiRequest(`/admin/trips/${id}/featured`, {
      method: 'PATCH',
    });
  },

  // Toggle popular
  togglePopular: async (id) => {
    return await apiRequest(`/admin/trips/${id}/popular`, {
      method: 'PATCH',
    });
  },

  // Get trip stats
  getTripStats: async (id) => {
    return await apiRequest(`/admin/trips/${id}/stats`);
  },

  // ===== BOOKINGS =====
  
  // Get all bookings
  getAllBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/bookings?${queryParams}`);
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await apiRequest(`/admin/bookings/${id}`);
  },

  // Update booking status
  updateBookingStatus: async (id, status, reason = '') => {
    return await apiRequest(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  // Update payment status
  updatePaymentStatus: async (id, paymentData) => {
    return await apiRequest(`/admin/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  },

  // Process refund
  processRefund: async (id, refundData) => {
    return await apiRequest(`/admin/bookings/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  // Add admin notes
  addNotes: async (id, notes) => {
    return await apiRequest(`/admin/bookings/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  // Get booking stats
  getBookingStats: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/bookings/stats?${queryParams}`);
  },

  // Get bookings by trip
  getBookingsByTrip: async (tripId) => {
    return await apiRequest(`/admin/bookings/trip/${tripId}`);
  },

  // ===== USERS =====

  // Get all users
  getAllUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/users?${queryParams}`);
  },

  // Get user by ID
  getUserById: async (id) => {
    return await apiRequest(`/admin/users/${id}`);
  },

  // Update user role
  updateUserRole: async (id, role) => {
    return await apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // Toggle user status
  toggleUserStatus: async (id, isActive) => {
    return await apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  // Delete user
  deleteUser: async (id) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user stats
  getUserStats: async () => {
    return await apiRequest('/admin/users/stats');
  },

  // ===== CATEGORIES =====

  // Get all categories
  getAllCategories: async () => {
    return await apiRequest('/admin/categories');
  },

  // Create category
  createCategory: async (categoryData) => {
    return await apiRequest('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    return await apiRequest(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete category
  deleteCategory: async (id) => {
    return await apiRequest(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // ===== IMAGE UPLOAD =====

  // Upload trip images
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    // Remove Content-Type header to let browser set it with boundary
    return await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  // ===== ANALYTICS =====

  // Get dashboard stats
  getDashboardStats: async () => {
    return await apiRequest('/admin/analytics/dashboard');
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = '30days') => {
    return await apiRequest(`/admin/analytics/revenue?period=${period}`);
  },

  // Get booking trends
  getBookingTrends: async (period = '30days') => {
    return await apiRequest(`/admin/analytics/bookings?period=${period}`);
  },

  // Get popular trips
  getPopularTrips: async (limit = 10) => {
    return await apiRequest(`/admin/analytics/popular-trips?limit=${limit}`);
  },

  // Get user growth
  getUserGrowth: async (period = '30days') => {
    return await apiRequest(`/admin/analytics/users?period=${period}`);
  },

  // Get category performance
  getCategoryPerformance: async () => {
    return await apiRequest('/admin/analytics/categories');
  },
};