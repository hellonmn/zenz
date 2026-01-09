// src/services/bookingService.js
import apiRequest from './api';

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user's bookings
  getMyBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/bookings/my-bookings?${queryParams}`);
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await apiRequest(`/bookings/${id}`);
  },

  // Update payment status
  updatePaymentStatus: async (id, paymentData) => {
    return await apiRequest(`/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    return await apiRequest(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Get booking stats
  getStats: async () => {
    return await apiRequest('/bookings/stats');
  },

  // Get all bookings (admin)
  getAllBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/bookings?${queryParams}`);
  },

  // Update booking status (admin)
  updateStatus: async (id, status, reason = '') => {
    return await apiRequest(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },
};