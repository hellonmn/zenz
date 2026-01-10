import apiRequest from './api';

export const eventService = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/events?${queryParams}`);
  },

  // Get event by slug
  getEventBySlug: async (slug) => {
    return await apiRequest(`/events/${slug}`);
  },

  // Create event booking
  createBooking: async (slug, bookingData) => {
    return await apiRequest(`/events/${slug}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get booking by reference
  getBookingByReference: async (reference) => {
    return await apiRequest(`/events/bookings/${reference}`);
  },

  // Get user's booking for an event
  getUserBooking: async (slug) => {
    return await apiRequest(`/events/${slug}/my-booking`);
  },
};

export const adminEventService = {
  // Get all events (admin)
  getAllEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/events?${queryParams}`);
  },

  // Get event by ID
  getEventById: async (id) => {
    return await apiRequest(`/admin/events/${id}`);
  },

  // Create event
  createEvent: async (eventData) => {
    return await apiRequest('/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update event
  updateEvent: async (id, eventData) => {
    return await apiRequest(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Delete event
  deleteEvent: async (id) => {
    return await apiRequest(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Get event bookings
  getEventBookings: async (id, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/admin/events/${id}/bookings?${queryParams}`);
  },

  // Update booking status
  updateBookingStatus: async (id, status, adminNotes) => {
    return await apiRequest(`/admin/events/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  // Get event stats
  getEventStats: async (id) => {
    return await apiRequest(`/admin/events/${id}/stats`);
  },
};
