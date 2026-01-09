import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tripService } from '../../services/tripService';

export default function TripsManagement() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formData, setFormData] = useState({
    placeName: '',
    description: '',
    price: '',
    category: 'Adventure',
    city: '',
    state: '',
    duration: '',
    maxPeople: '',
    images: [],
    itinerary: [],
    highlights: [],
    included: [],
    excluded: [],
  });

  const categories = ['All', 'Adventure', 'Beach', 'Heritage', 'Wildlife', 'Pilgrimage', 'Hill Station'];
  const cities = ['All', 'Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa', 'Kolkata', 'Chennai'];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAllTrips();
      setTrips(response.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = () => {
    setFormData({
      placeName: '',
      description: '',
      price: '',
      category: 'Adventure',
      city: '',
      state: '',
      duration: '',
      maxPeople: '',
      images: [],
      itinerary: [],
      highlights: [],
      included: [],
      excluded: [],
    });
    setShowAddModal(true);
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setFormData({
      placeName: trip.placeName || '',
      description: trip.description || '',
      price: trip.price || '',
      category: trip.category || 'Adventure',
      city: trip.city || '',
      state: trip.state || '',
      duration: trip.duration || '',
      maxPeople: trip.maxPeople || '',
      images: trip.images || [],
      itinerary: trip.itinerary || [],
      highlights: trip.highlights || [],
      included: trip.included || [],
      excluded: trip.excluded || [],
    });
    setShowEditModal(true);
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        // await tripService.deleteTrip(tripId);
        setTrips(trips.filter(trip => trip._id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        // await tripService.updateTrip(selectedTrip._id, formData);
        setTrips(trips.map(trip => trip._id === selectedTrip._id ? { ...trip, ...formData } : trip));
        setShowEditModal(false);
      } else {
        // const response = await tripService.createTrip(formData);
        // setTrips([response.data, ...trips]);
        setShowAddModal(false);
      }
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || selectedCategory.toLowerCase() === 'all' ||
                           trip.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesCity = selectedCity === 'all' || selectedCity.toLowerCase() === 'all' ||
                       trip.city?.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCategory && matchesCity;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
        <button
          onClick={handleAddTrip}
          className="px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 flex items-center gap-2 transition-colors"
        >
          <i className="fi fi-rr-plus"></i>
          Add New Trip
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            {cities.map((city) => (
              <option key={city} value={city.toLowerCase()}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Trips</p>
          <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-900">{filteredTrips.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Adventure Trips</p>
          <p className="text-2xl font-bold text-gray-900">
            {trips.filter(t => t.category?.toLowerCase() === 'adventure').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Beach Trips</p>
          <p className="text-2xl font-bold text-gray-900">
            {trips.filter(t => t.category?.toLowerCase() === 'beach').length}
          </p>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <i className="fi fi-rr-search-alt text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips found</h3>
          <p className="text-gray-500">Try adjusting your filters or add a new trip</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Trip Image */}
              <div className="relative h-48 bg-gray-200">
                {trip.images && trip.images.length > 0 ? (
                  <img
                    src={trip.images[0]}
                    alt={trip.placeName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                    <i className="fi fi-rr-mountain text-6xl text-green-900 opacity-20"></i>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-green-900">
                  {trip.category}
                </div>
              </div>

              {/* Trip Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.placeName}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fi fi-rr-marker"></i>
                    <span>{trip.city}, {trip.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fi fi-rr-calendar"></i>
                    <span>{trip.duration} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fi fi-rr-users"></i>
                    <span>Max {trip.maxPeople} people</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-2xl font-bold text-green-900">${trip.price}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTrip(trip)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <i className="fi fi-rr-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
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
                  <h2 className="text-2xl font-bold text-gray-900">
                    {showEditModal ? 'Edit Trip' : 'Add New Trip'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fi fi-rr-cross text-xl"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Place Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.placeName}
                        onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                        placeholder="Enter place name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                        placeholder="Describe the trip..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                        >
                          {categories.slice(1).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (days) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max People *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.maxPeople}
                          onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 transition-colors"
                    >
                      {showEditModal ? 'Update Trip' : 'Create Trip'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
