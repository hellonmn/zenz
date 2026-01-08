// src/services/authService.js
import apiRequest from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return data;
  },

  // Register
  signup: async (name, email, password) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return data;
  },

  // Get Profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Update Profile
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Upload Profile Image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/auth/profile/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    return await response.json();
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};