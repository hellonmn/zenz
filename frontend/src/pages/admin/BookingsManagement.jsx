import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to regular booking service if admin service fails
      try {
        const { bookingService } = await import('../../services/bookingService');
        const fallbackResponse = await bookingService.getMyBookings();
        setBookings(fallbackResponse.data || []);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      await adminService.updateBookingStatus(bookingId, 'approved');
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: 'approved' } : b
      ));
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: 'approved' });
      }
      alert('Booking approved successfully!');
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      setActionLoading(true);
      await adminService.updateBookingStatus(bookingId, 'rejected', reason);
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: 'rejected' } : b
      ));
      if (selectedBooking?._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: 'rejected' });
      }
      alert('Booking rejected successfully!');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.trip?.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' ||
      booking.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return badges[status?.toLowerCase()] || badges.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'fi-rr-clock',
      approved: 'fi-rr-check-circle',
      rejected: 'fi-rr-cross-circle',
      cancelled: 'fi-rr-ban',
    };
    return icons[status?.toLowerCase()] || icons.pending;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-24 h-10 bg-gray-200 rounded-xl"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by trip, customer, email, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status} value={status.toLowerCase()}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">
            {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700">Approved</p>
          <p className="text-2xl font-bold text-green-800">
            {bookings.filter(b => b.status?.toLowerCase() === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700">Rejected</p>
          <p className="text-2xl font-bold text-red-800">
            {bookings.filter(b => b.status?.toLowerCase() === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <i className="fi fi-rr-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Trip Image */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                      {booking.trip?.images?.[0] ? (
                        <img
                          src={booking.trip.images[0]}
                          alt={booking.trip.placeName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <i className="fi fi-rr-mountain text-2xl text-green-900 opacity-50"></i>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {booking.trip?.placeName || 'Unknown Trip'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Reference: <span className="font-mono">{booking.bookingReference}</span>
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusBadge(booking.status)}`}>
                          <i className={`fi ${getStatusIcon(booking.status)}`}></i>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.customerDetails?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.customerDetails?.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">People</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.numberOfPeople}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="text-sm font-bold text-green-900">
                            ${booking.totalPrice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                        <i className="fi fi-rr-calendar"></i>
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold"
                  >
                    View Details
                  </button>

                  {booking.status?.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveBooking(booking._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-800 transition-colors text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedBooking && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                    <p className="text-sm text-gray-600 font-mono">{selectedBooking.bookingReference}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fi fi-rr-cross text-xl"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <span className={`px-6 py-3 rounded-full text-lg font-semibold border flex items-center gap-2 ${getStatusBadge(selectedBooking.status)}`}>
                      <i className={`fi ${getStatusIcon(selectedBooking.status)}`}></i>
                      {selectedBooking.status}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Trip Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.trip?.placeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.trip?.duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.trip?.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.customerDetails?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.customerDetails?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.customerDetails?.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of People</span>
                        <span className="font-semibold text-gray-900">{selectedBooking.numberOfPeople}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Price per person</span>
                      <span className="font-semibold text-gray-900">${selectedBooking.trip?.price}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Number of people</span>
                      <span className="font-semibold text-gray-900">{selectedBooking.numberOfPeople}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-green-300">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-green-900">${selectedBooking.totalPrice}</span>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {selectedBooking.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <span>Booked: {new Date(selectedBooking.createdAt).toLocaleString()}</span>
                    {selectedBooking.updatedAt && (
                      <span>Updated: {new Date(selectedBooking.updatedAt).toLocaleString()}</span>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedBooking.status?.toLowerCase() === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleApproveBooking(selectedBooking._id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 transition-colors font-semibold disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve Booking'}
                      </button>
                      <button
                        onClick={() => handleRejectBooking(selectedBooking._id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                      >
                        Reject Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
