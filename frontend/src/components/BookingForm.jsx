// components/BookingForm.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ trip, onSuccess, onClose }) {
  const navigate = useNavigate();
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  // Get user data from profile and auto-fill
  const currentUser = authService.getCurrentUser();
  const [customerDetails, setCustomerDetails] = useState({
    name: currentUser?.user?.name || currentUser?.name || '',
    email: currentUser?.user?.email || currentUser?.email || '',
    phone: currentUser?.user?.phone || currentUser?.phone || '',
    emergencyContact: '',
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (customerDetails.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(customerDetails.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone (optional if not in profile, but validate format if provided)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (customerDetails.phone && customerDetails.phone.trim()) {
      if (!phoneRegex.test(customerDetails.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Phone number must be 10-15 digits';
      }
    }

    // Validate number of people
    if (numberOfPeople < 1) {
      newErrors.numberOfPeople = 'At least 1 person required';
    } else if (numberOfPeople > trip.availableSlots) {
      newErrors.numberOfPeople = `Only ${trip.availableSlots} slots available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!authService.isAuthenticated()) {
      if (window.confirm('Please login to book a trip. Redirect to login page?')) {
        navigate('/login');
      }
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        tripId: trip._id,
        numberOfPeople: parseInt(numberOfPeople),
        customerDetails,
        paymentMethod: 'card',
        tripStartDate: trip.startDate,
      };

      const response = await bookingService.createBooking(bookingData);

      onSuccess(response.data);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (trip.price || 0) * numberOfPeople;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Book Your Trip</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <i className="fi fi-rr-cross text-gray-600"></i>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Trip</span>
            <span className="font-semibold text-gray-900">{trip.placeName || trip.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price per person</span>
            <span className="font-semibold text-gray-900">${trip.price}</span>
          </div>
        </div>

        {/* Number of People */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of People
          </label>
          <input
            type="number"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(e.target.value)}
            min="1"
            max={trip.availableSlots}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {errors.numberOfPeople && (
            <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Available slots: {trip.availableSlots}
          </p>
        </div>

        {/* Only show contact fields if user is NOT logged in or data is missing */}
        {(!currentUser || !customerDetails.name || !customerDetails.email) && (
          <>
            {/* Contact Information Header */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="fi fi-rr-user text-gray-500"></i>
                Contact Information
              </h3>
            </div>

            {/* Full Name */}
            {!customerDetails.name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email */}
            {!customerDetails.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone */}
            {!customerDetails.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Show confirmation message if data is auto-filled */}
        {currentUser && customerDetails.name && customerDetails.email && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="fi fi-rr-check-circle text-green-600 text-xl mt-0.5"></i>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Contact information loaded from your profile
                </p>
                <p className="text-xs text-green-700">
                  Booking as: {customerDetails.name} ({customerDetails.email})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact (Optional)
          </label>
          <input
            type="tel"
            value={customerDetails.emergencyContact}
            onChange={(e) => setCustomerDetails({ ...customerDetails, emergencyContact: e.target.value })}
            placeholder="+1 234 567 8900"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={customerDetails.specialRequests}
            onChange={(e) => setCustomerDetails({ ...customerDetails, specialRequests: e.target.value })}
            placeholder="Any special requirements or requests..."
            rows="3"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Total Price */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Price</span>
            <span className="text-2xl font-bold text-green-700">${totalPrice}</span>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1f3121' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Confirm Booking - $${totalPrice}`
          )}
        </button>
      </form>
    </motion.div>
  );
}