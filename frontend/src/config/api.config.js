// API Configuration
// Change this to your local backend URL when developing locally
// or to your production URL when deploying

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zenz-backend.onrender.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: `${API_BASE_URL}/api`,

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      PROFILE: '/auth/profile',
      PROFILE_UPLOAD: '/auth/profile/upload',
      SAVE_TRIP: '/auth/save-trip',
      UNSAVE_TRIP: '/auth/unsave-trip',
      LIKE_TRIP: '/auth/like-trip',
      LIKED_TRIPS: '/auth/liked-trips',
    },
    TRIPS: {
      GET_ALL: '/trips',
      GET_BY_ID: (id) => `/trips/${id}`,
      GET_FEATURED: '/trips/featured',
      GET_POPULAR: '/trips/popular',
      GET_BY_CATEGORY: (category) => `/trips/category/${category}`,
    },
    BOOKINGS: {
      CREATE: '/bookings',
      GET_MY_BOOKINGS: '/bookings/my-bookings',
      GET_BY_ID: (id) => `/bookings/${id}`,
      CANCEL: (id) => `/bookings/${id}/cancel`,
    },
  },

  // Helper to get full image URL
  getImageUrl: (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  },
};

export default API_CONFIG;
