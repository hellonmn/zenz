import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminEventService } from '../../services/eventService';
import { Link } from 'react-router-dom';

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventBookings, setEventBookings] = useState([]);
  const [eventStats, setEventStats] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminEventService.getAllEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookings = async (event) => {
    try {
      setSelectedEvent(event);
      const [bookingsRes, statsRes] = await Promise.all([
        adminEventService.getEventBookings(event._id),
        adminEventService.getEventStats(event._id)
      ]);
      setEventBookings(bookingsRes.data || []);
      setEventStats(statsRes.data);
      setShowBookingsModal(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminEventService.deleteEvent(eventId);
        setEvents(events.filter(e => e._id !== eventId));
        alert('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(error.message || 'Failed to delete event');
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await adminEventService.updateBookingStatus(bookingId, status);
      // Refresh bookings
      const bookingsRes = await adminEventService.getEventBookings(selectedEvent._id);
      setEventBookings(bookingsRes.data || []);
      alert('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <Link
          to="/admin/events/create"
          className="px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 flex items-center gap-2 transition-colors"
        >
          <i className="fi fi-rr-plus"></i>
          Add New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700">Published</p>
          <p className="text-2xl font-bold text-green-900">
            {events.filter(e => e.status === 'published').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700">Upcoming</p>
          <p className="text-2xl font-bold text-blue-900">
            {events.filter(e => new Date(e.startDate) > new Date()).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-700">Completed</p>
          <p className="text-2xl font-bold text-purple-900">
            {events.filter(e => e.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <i className="fi fi-rr-calendar-exclamation text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new event</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onViewBookings={() => handleViewBookings(event)}
              onDelete={() => handleDeleteEvent(event._id)}
            />
          ))}
        </div>
      )}

      {/* Bookings Modal */}
      <BookingsModal
        show={showBookingsModal}
        event={selectedEvent}
        bookings={eventBookings}
        stats={eventStats}
        onClose={() => setShowBookingsModal(false)}
        onUpdateStatus={handleUpdateBookingStatus}
      />
    </div>
  );
}

// Event Card Component
function EventCard({ event, onViewBookings, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 bg-gray-200">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
            <i className="fi fi-rr-calendar text-6xl text-green-900 opacity-20"></i>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
          {event.featured && (
            <span className="px-3 py-1 bg-yellow-500 rounded-full text-xs font-semibold text-white">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
        </div>

        {event.edition && (
          <p className="text-sm text-green-600 font-semibold mb-2">{event.edition}</p>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.tagline}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fi fi-rr-calendar"></i>
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fi fi-rr-marker"></i>
            <span className="line-clamp-1">{event.venue?.name || 'TBA'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fi fi-rr-ticket"></i>
            <span>{event.bookingCount || 0} bookings</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Link
            to={`/admin/events/edit/${event._id}`}
            className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-semibold"
          >
            <i className="fi fi-rr-edit mr-2"></i>
            Edit
          </Link>
          <button
            onClick={onViewBookings}
            className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold"
          >
            <i className="fi fi-rr-users mr-2"></i>
            Bookings
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <i className="fi fi-rr-trash"></i>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Bookings Modal Component
function BookingsModal({ show, event, bookings, stats, onClose, onUpdateStatus }) {
  if (!show || !event) return null;

  const getBookingStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title} - Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage event bookings and registrations</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fi fi-rr-cross text-xl"></i>
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bookings?.total || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">Confirmed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.bookings?.confirmed || 0}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.bookings?.pending || 0}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">₹{stats.revenue?.total || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bookings List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fi fi-rr-inbox text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{booking.guestInfo?.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {booking.bookingType}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><i className="fi fi-rr-envelope mr-2"></i>{booking.guestInfo?.email}</p>
                          <p><i className="fi fi-rr-phone-call mr-2"></i>{booking.guestInfo?.phone}</p>
                          <p><i className="fi fi-rr-barcode mr-2"></i>{booking.bookingReference}</p>
                          <p><i className="fi fi-rr-indian-rupee-sign mr-2"></i>₹{booking.totalAmount}</p>
                        </div>
                        {booking.stallDetails && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                            <p className="font-semibold text-blue-900">Stall: {booking.stallDetails.stallNumber || 'Pending'}</p>
                            <p className="text-blue-700">{booking.stallDetails.businessType}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(booking._id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(booking._id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateStatus(booking._id, 'cancelled')}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
