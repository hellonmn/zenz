// components/LocationSheet.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Search, Globe } from 'lucide-react';
import locationService from '../services/locationService';

export default function LocationSheet({ open, onClose, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState('');

  const popularCities = locationService.getPopularCities();

  useEffect(() => {
    const saved = locationService.getSavedLocation();
    if (saved) {
      setCurrentLocation(saved);
    }
  }, [open]);

  const handleDetectLocation = async () => {
    setDetecting(true);
    setError('');

    try {
      // Try browser geolocation first
      const location = await locationService.getCurrentLocation();
      locationService.saveLocation(location);
      setCurrentLocation(location);
      onLocationChange(location);
      setTimeout(() => onClose(), 500);
    } catch (err) {
      // Fallback to IP-based location
      try {
        const location = await locationService.getLocationByIP();
        locationService.saveLocation(location);
        setCurrentLocation(location);
        onLocationChange(location);
        setTimeout(() => onClose(), 500);
      } catch (ipErr) {
        setError('Failed to detect location. Please select manually.');
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSelectCity = (city) => {
    const location = {
      city: city.name,
      state: city.state,
      country: 'India',
      countryCode: 'IN',
      displayName: city.name,
      latitude: null,
      longitude: null
    };

    locationService.saveLocation(location);
    setCurrentLocation(location);
    onLocationChange(location);
    onClose();
  };

  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <motion.div
          className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl px-6 py-6 flex flex-col z-10 max-h-[75vh] mb-0"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Drag handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4 mx-auto" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Select Location</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Current Location</p>
                  <p className="text-xs text-green-700">{currentLocation.displayName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 mb-4"
          >
            <Navigation size={18} />
            {detecting ? 'Detecting...' : 'Use Current Location'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Popular Cities List */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin size={16} />
              Popular Cities in India
            </h3>
            <div className="space-y-2">
              {filteredCities.map((city, index) => (
                <button
                  key={`${city.name}-${index}`}
                  onClick={() => handleSelectCity(city)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition text-left"
                >
                  <span className="text-2xl">{city.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{city.name}</p>
                    <p className="text-xs text-gray-500">{city.state}</p>
                  </div>
                  {currentLocation?.city === city.name && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {filteredCities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No cities found</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
