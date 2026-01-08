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
};