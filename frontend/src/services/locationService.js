// src/services/locationService.js

const LOCATION_STORAGE_KEY = 'user_location';

export const locationService = {
  // Get current location using browser geolocation API
  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode to get location details
            const locationData = await locationService.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  // Reverse geocode coordinates to location
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || data.address.state_district || data.address.state || 'Unknown';
      const state = data.address.state || '';

      return {
        city: city,
        state: state,
        country: data.address.country || 'India',
        countryCode: data.address.country_code?.toUpperCase() || 'IN',
        displayName: city,
        latitude: lat,
        longitude: lon
      };
    } catch (error) {
      throw new Error('Failed to get location details');
    }
  },

  // Save location to localStorage
  saveLocation: (location) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  },

  // Get saved location from localStorage
  getSavedLocation: () => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  // Clear saved location
  clearLocation: () => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  },

  // Get location by IP (fallback)
  getLocationByIP: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      return {
        city: data.city || 'Delhi',
        state: data.region || '',
        country: data.country_name || 'India',
        countryCode: data.country_code || 'IN',
        displayName: data.city || 'Delhi',
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      // Default fallback to Delhi
      return {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        countryCode: 'IN',
        displayName: 'Delhi',
        latitude: 28.7041,
        longitude: 77.1025
      };
    }
  },

  // Popular Indian cities for travel
  getPopularCities: () => [
    { name: 'Delhi', state: 'Delhi', icon: '🏛️' },
    { name: 'Mumbai', state: 'Maharashtra', icon: '🌆' },
    { name: 'Bangalore', state: 'Karnataka', icon: '🌳' },
    { name: 'Jaipur', state: 'Rajasthan', icon: '🏰' },
    { name: 'Goa', state: 'Goa', icon: '🏖️' },
    { name: 'Udaipur', state: 'Rajasthan', icon: '🏰' },
    { name: 'Agra', state: 'Uttar Pradesh', icon: '🕌' },
    { name: 'Varanasi', state: 'Uttar Pradesh', icon: '🛕' },
    { name: 'Rishikesh', state: 'Uttarakhand', icon: '🏔️' },
    { name: 'Manali', state: 'Himachal Pradesh', icon: '⛰️' },
    { name: 'Shimla', state: 'Himachal Pradesh', icon: '🏔️' },
    { name: 'Darjeeling', state: 'West Bengal', icon: '🍵' },
    { name: 'Kolkata', state: 'West Bengal', icon: '🏛️' },
    { name: 'Chennai', state: 'Tamil Nadu', icon: '🏛️' },
    { name: 'Hyderabad', state: 'Telangana', icon: '🏰' },
    { name: 'Pune', state: 'Maharashtra', icon: '🌆' },
    { name: 'Ahmedabad', state: 'Gujarat', icon: '🏛️' },
    { name: 'Kochi', state: 'Kerala', icon: '🌴' },
    { name: 'Munnar', state: 'Kerala', icon: '🌄' },
    { name: 'Ooty', state: 'Tamil Nadu', icon: '🌲' },
    { name: 'Amritsar', state: 'Punjab', icon: '🛕' },
    { name: 'Srinagar', state: 'Jammu & Kashmir', icon: '🏔️' },
    { name: 'Leh', state: 'Ladakh', icon: '⛰️' },
    { name: 'Mysore', state: 'Karnataka', icon: '🏰' },
    { name: 'Jodhpur', state: 'Rajasthan', icon: '🏰' },
  ]
};

export default locationService;
