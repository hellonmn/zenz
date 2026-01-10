// pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '../services/bookingService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(null);
  const [selectedNav, setSelectedNav] = useState('My Bookings');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await bookingService.getMyBookings(filters);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId, 'User requested cancellation');
      setShowCancelModal(null);
      fetchBookings();
    } catch (error) {
      console.error(error.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'fi-rr-check-circle';
      case 'pending':
        return 'fi-rr-clock';
      case 'cancelled':
        return 'fi-rr-cross-circle';
      case 'completed':
        return 'fi-rr-badge-check';
      default:
        return 'fi-rr-info';
    }
  };

  const filterButtons = [
    { value: 'all', label: 'All', icon: 'fi-rr-apps' },
    { value: 'confirmed', label: 'Confirmed', icon: 'fi-rr-check-circle' },
    { value: 'pending', label: 'Pending', icon: 'fi-rr-clock' },
    { value: 'cancelled', label: 'Cancelled', icon: 'fi-rr-cross-circle' },
  ];

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 pb-20">


        {/* Page Header */}
        <div className="px-6 pt-6 pb-4" style={{ backgroundColor: '#1f3121' }}>
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-300 text-sm">Track and manage your trips</p>
        </div>

      {/* Filter Tabs */}
      <div className="px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                filter === btn.value
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`fi ${btn.icon} text-base`}></i>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-calendar-lines text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : `No ${filter} bookings`}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: '#1f3121' }}
            >
              <i className="fi fi-rr-search"></i>
              Explore Trips
            </a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-sm overflow-hidden"
              >
                <div
                  className="relative h-48 cursor-pointer"
                  onClick={() => setShowTripDetails(booking)}
                >
                  <img
                    src={booking.trip?.images?.[0] || booking.trip?.image || '/historic_place.png'}
                    alt={booking.trip?.placeName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/historic_place.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${getStatusColor(booking.status)}`}>
                      <i className={`fi ${getStatusIcon(booking.status)} text-sm`}></i>
                      <span className="text-xs font-semibold capitalize">{booking.status}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {booking.trip?.placeName || 'Trip'}
                    </h3>
                    <p className="text-sm text-gray-200 flex items-center gap-1">
                      <i className="fi fi-rr-marker"></i>
                      {booking.trip?.city}, {booking.trip?.country}
                    </p>
                  </div>

                  {/* Click to view indicator */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <i className="fi fi-rr-eye"></i>
                      Tap to view trip
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
                      <p className="font-mono font-bold text-gray-900">{booking.bookingReference}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Booked On</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-users text-gray-600"></i>
                        <span className="text-xs text-gray-600">Travelers</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{booking.numberOfPeople}</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-dollar text-green-700"></i>
                        <span className="text-xs text-green-700">Total Price</span>
                      </div>
                      <p className="text-lg font-bold text-green-700">${booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBooking(selectedBooking === booking._id ? null : booking._id)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className={`fi ${selectedBooking === booking._id ? 'fi-rr-angle-up' : 'fi-rr-angle-down'}`}></i>
                      {selectedBooking === booking._id ? 'Hide' : 'View'} Details
                    </button>

                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => setShowCancelModal(booking._id)}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                      >
                        <i className="fi fi-rr-cross-circle"></i>
                        Cancel
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedBooking === booking._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                            <p className="font-semibold text-gray-900">{booking.customerDetails?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="font-semibold text-gray-900">{booking.customerDetails?.email}</p>
                          </div>
                          {booking.customerDetails?.phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="font-semibold text-gray-900">{booking.customerDetails.phone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Trip Start Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.tripStartDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {booking.customerDetails?.specialRequests && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                                {booking.customerDetails.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

        {/* Bottom Navigation */}
        <BottomNav selected={selectedNav} onSelect={setSelectedNav} />
      </div>

      {/* Modals - Outside main container to prevent bottom nav showing */}
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCancelModal(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fi fi-rr-exclamation text-3xl text-red-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(null)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => handleCancelBooking(showCancelModal)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Details Modal */}
      <AnimatePresence>
        {showTripDetails && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTripDetails(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Trip Images */}
              <div className="relative h-64">
                <img
                  src={showTripDetails.trip?.images?.[0] || showTripDetails.trip?.image || '/historic_place.png'}
                  alt={showTripDetails.trip?.placeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/historic_place.png';
                  }}
                />
                <button
                  onClick={() => setShowTripDetails(null)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
                >
                  <i className="fi fi-rr-cross text-gray-700"></i>
                </button>
              </div>

              {/* Trip Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {showTripDetails.trip?.placeName || 'Trip'}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-marker"></i>
                  {showTripDetails.trip?.city}, {showTripDetails.trip?.country}
                </p>

                {/* Trip Info */}
                {showTripDetails.trip?.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600">{showTripDetails.trip.description}</p>
                  </div>
                )}

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {showTripDetails.trip?.duration && (
                    <div className="bg-blue-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-calendar text-blue-700"></i>
                        <span className="text-xs text-blue-700">Duration</span>
                      </div>
                      <p className="text-sm font-bold text-blue-900">{showTripDetails.trip.duration}</p>
                    </div>
                  )}
                  {showTripDetails.trip?.price && (
                    <div className="bg-green-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-dollar text-green-700"></i>
                        <span className="text-xs text-green-700">Price</span>
                      </div>
                      <p className="text-sm font-bold text-green-900">${showTripDetails.trip.price}</p>
                    </div>
                  )}
                  {showTripDetails.trip?.category && (
                    <div className="bg-purple-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-apps text-purple-700"></i>
                        <span className="text-xs text-purple-700">Category</span>
                      </div>
                      <p className="text-sm font-bold text-purple-900">{showTripDetails.trip.category}</p>
                    </div>
                  )}
                  {showTripDetails.trip?.availableSlots !== undefined && (
                    <div className="bg-orange-50 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fi fi-rr-users text-orange-700"></i>
                        <span className="text-xs text-orange-700">Available</span>
                      </div>
                      <p className="text-sm font-bold text-orange-900">
                        {showTripDetails.trip.availableSlots} / {showTripDetails.trip.maxParticipants}
                      </p>
                    </div>
                  )}
                </div>

                {/* Highlights */}
                {showTripDetails.trip?.highlights && showTripDetails.trip.highlights.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Highlights</h3>
                    <ul className="space-y-2">
                      {showTripDetails.trip.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <i className="fi fi-rr-check text-green-600 mt-1"></i>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Booking Info Section */}
                <div className="bg-gray-50 rounded-2xl p-4 mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-ticket"></i>
                    Your Booking Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Reference</span>
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {showTripDetails.bookingReference}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Status</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(showTripDetails.status)}`}>
                        {showTripDetails.status}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Travelers</span>
                      <span className="font-semibold text-sm text-gray-900">
                        {showTripDetails.numberOfPeople} {showTripDetails.numberOfPeople === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Paid</span>
                      <span className="font-bold text-sm text-green-700">${showTripDetails.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowTripDetails(null)}
                  className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}