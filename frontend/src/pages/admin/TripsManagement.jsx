import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

export default function TripsManagement() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    placeName: '',
    description: '',
    price: '',
    category: 'Adventure',
    city: '',
    state: '',
    country: 'India',
    duration: '',
    maxPeople: '',
    artImage: '',
    images: [],
    itinerary: [''],
    highlights: [''],
    included: [''],
    excluded: [''],
    latitude: '',
    longitude: '',
    featured: false,
    popular: false,
  });

  const categories = ['All', 'Adventure', 'Beach', 'Heritage', 'Wildlife', 'Pilgrimage', 'Hill Station', 'Mountains', 'Desert', 'Forest'];
  const cities = ['All', 'Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad'];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTrips();
      setTrips(response.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to regular trip service if admin service fails
      try {
        const { tripService } = await import('../../services/tripService');
        const fallbackResponse = await tripService.getAllTrips();
        setTrips(fallbackResponse.data || []);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
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
      country: 'India',
      duration: '',
      maxPeople: '',
      artImage: '',
      images: [],
      itinerary: [''],
      highlights: [''],
      included: [''],
      excluded: [''],
      latitude: '',
      longitude: '',
      featured: false,
      popular: false,
    });
    setImagePreview([]);
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
      country: trip.country || 'India',
      duration: trip.duration || '',
      maxPeople: trip.maxPeople || '',
      artImage: trip.artImage || '',
      images: trip.images || [],
      itinerary: trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [''],
      highlights: trip.highlights && trip.highlights.length > 0 ? trip.highlights : [''],
      included: trip.included && trip.included.length > 0 ? trip.included : [''],
      excluded: trip.excluded && trip.excluded.length > 0 ? trip.excluded : [''],
      latitude: trip.location?.coordinates?.[1] || trip.latitude || '',
      longitude: trip.location?.coordinates?.[0] || trip.longitude || '',
      featured: trip.featured || false,
      popular: trip.popular || false,
    });
    setImagePreview(trip.images || []);
    setShowEditModal(true);
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await adminService.deleteTrip(tripId);
        setTrips(trips.filter(trip => trip._id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);

      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview([...imagePreview, ...previews]);

      // Upload to server
      const response = await adminService.uploadImages(files);

      if (response.success && response.data?.urls) {
        setFormData({
          ...formData,
          images: [...formData.images, ...response.data.urls]
        });
      } else {
        // If upload fails, keep local previews for now
        alert('Image upload may have failed. Please check and resubmit.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
  };

  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const handleRemoveArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean up data - remove empty strings from arrays
    const cleanedData = {
      ...formData,
      itinerary: formData.itinerary.filter(item => item.trim() !== ''),
      highlights: formData.highlights.filter(item => item.trim() !== ''),
      included: formData.included.filter(item => item.trim() !== ''),
      excluded: formData.excluded.filter(item => item.trim() !== ''),
      price: parseFloat(formData.price),
      duration: formData.duration,
      maxPeople: parseInt(formData.maxPeople),
      location: formData.latitude && formData.longitude ? {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
      } : undefined,
    };

    try {
      if (showEditModal) {
        await adminService.updateTrip(selectedTrip._id, cleanedData);
        alert('Trip updated successfully!');
        setShowEditModal(false);
      } else {
        await adminService.createTrip(cleanedData);
        alert('Trip created successfully!');
        setShowAddModal(false);
      }
      fetchTrips();
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
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

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>

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
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700">Featured</p>
          <p className="text-2xl font-bold text-green-900">
            {trips.filter(t => t.featured).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700">Popular</p>
          <p className="text-2xl font-bold text-blue-900">
            {trips.filter(t => t.popular).length}
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
            <TripCard
              key={trip._id}
              trip={trip}
              onEdit={() => handleEditTrip(trip)}
              onDelete={() => handleDeleteTrip(trip._id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Will add in next message due to length */}
      <TripFormModal
        show={showAddModal || showEditModal}
        isEdit={showEditModal}
        formData={formData}
        setFormData={setFormData}
        imagePreview={imagePreview}
        uploading={uploading}
        fileInputRef={fileInputRef}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        onSubmit={handleSubmit}
        onImageSelect={handleImageSelect}
        onRemoveImage={handleRemoveImage}
        onArrayFieldChange={handleArrayFieldChange}
        onAddArrayField={handleAddArrayField}
        onRemoveArrayField={handleRemoveArrayField}
        categories={categories.slice(1)}
      />
    </div>
  );
}

// Trip Card Component
function TripCard({ trip, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
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
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-green-900">
            {trip.category}
          </div>
          {trip.featured && (
            <div className="px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
              ⭐ Featured
            </div>
          )}
        </div>
      </div>

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
            <span>{trip.duration}</span>
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
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <i className="fi fi-rr-edit"></i>
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <i className="fi fi-rr-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Trip Form Modal Component
function TripFormModal({
  show,
  isEdit,
  formData,
  setFormData,
  imagePreview,
  uploading,
  fileInputRef,
  onClose,
  onSubmit,
  onImageSelect,
  onRemoveImage,
  onArrayFieldChange,
  onAddArrayField,
  onRemoveArrayField,
  categories
}) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Trip' : 'Add New Trip'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fi fi-rr-cross text-xl"></i>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-6 space-y-8 max-h-[calc(90vh-100px)] overflow-y-auto">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.placeName}
                    onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Enter place name"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Describe the trip..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="e.g., 5 days 4 nights"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max People *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxPeople}
                    onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="0.000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                    placeholder="0.000000"
                  />
                </div>
              </div>
            </section>

            {/* Thumbnail Image (artImage) */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Thumbnail Image (artImage)</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <i className="fi fi-rr-info mr-2"></i>
                  This image will be used as the thumbnail in category listings on the homepage.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.artImage}
                  onChange={(e) => setFormData({ ...formData, artImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.artImage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={formData.artImage}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = '/historic_place.png';
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Images */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Trip Detail Images</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-800">
                  <i className="fi fi-rr-info mr-2"></i>
                  These images will be shown in the trip details page gallery.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-900 hover:bg-green-50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-green-900 rounded-full animate-spin"></div>
                      <span className="text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-cloud-upload text-3xl text-gray-400"></i>
                      <span className="text-gray-600">Click to upload images</span>
                      <span className="text-xs text-gray-500">Support: JPG, PNG, WEBP (Max 5MB each)</span>
                    </>
                  )}
                </button>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {imagePreview.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fi fi-rr-cross text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Array Fields */}
            <ArrayFieldSection
              title="Highlights"
              field="highlights"
              items={formData.highlights}
              placeholder="Add a highlight..."
              onChange={onArrayFieldChange}
              onAdd={onAddArrayField}
              onRemove={onRemoveArrayField}
            />

            <ArrayFieldSection
              title="Itinerary"
              field="itinerary"
              items={formData.itinerary}
              placeholder="Day 1: Activity description..."
              onChange={onArrayFieldChange}
              onAdd={onAddArrayField}
              onRemove={onRemoveArrayField}
            />

            <ArrayFieldSection
              title="Included"
              field="included"
              items={formData.included}
              placeholder="What's included..."
              onChange={onArrayFieldChange}
              onAdd={onAddArrayField}
              onRemove={onRemoveArrayField}
            />

            <ArrayFieldSection
              title="Excluded"
              field="excluded"
              items={formData.excluded}
              placeholder="What's not included..."
              onChange={onArrayFieldChange}
              onAdd={onAddArrayField}
              onRemove={onRemoveArrayField}
            />

            {/* Settings */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Settings</h3>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="text-gray-700 font-medium">Featured Trip</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-5 h-5 text-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="text-gray-700 font-medium">Popular Trip</span>
                </label>
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 transition-colors font-semibold"
              >
                {isEdit ? 'Update Trip' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Array Field Section Component
function ArrayFieldSection({ title, field, items, placeholder, onChange, onAdd, onRemove }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={() => onAdd(field)}
          className="px-3 py-1 bg-green-100 text-green-900 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(field, index, e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
              placeholder={placeholder}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(field, index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <i className="fi fi-rr-trash"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
