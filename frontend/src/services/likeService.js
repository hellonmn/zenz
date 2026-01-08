// src/services/likeService.js
import apiRequest from './api';

export const likeService = {
  // Like a trip
  likeTrip: async (tripId) => {
    return await apiRequest(`/auth/like-trip/${tripId}`, {
      method: 'POST',
    });
  },

  // Unlike a trip
  unlikeTrip: async (tripId) => {
    return await apiRequest(`/auth/like-trip/${tripId}`, {
      method: 'DELETE',
    });
  },

  // Get all liked trips
  getLikedTrips: async () => {
    return await apiRequest('/auth/liked-trips');
  },

  // Check if trip is liked
  isLiked: (tripId, likedTrips = []) => {
    return likedTrips.some(id => id === tripId || id._id === tripId);
  }
};
