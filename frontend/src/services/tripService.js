// src/services/tripService.js
import apiRequest from './api';

export const tripService = {
  // Get all trips
  getAllTrips: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/trips?${queryParams}`);
  },

  // Get trips by category
  getTripsByCategory: async (category) => {
    return await apiRequest(`/trips/category/${category}`);
  },

  // Get featured trips
  getFeaturedTrips: async () => {
    return await apiRequest('/trips/featured');
  },

  // Get popular trips
  getPopularTrips: async () => {
    return await apiRequest('/trips/popular');
  },

  // Get single trip
  getTripById: async (id) => {
    return await apiRequest(`/trips/${id}`);
  },

  // Check availability
  checkAvailability: async (id) => {
    return await apiRequest(`/trips/${id}/availability`);
  },
};