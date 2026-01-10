import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Header from '../../components/Header';
import { likeService } from '../../services/likeService';
import { authService } from '../../services/authService';
import DestinationDetailsSheet from './DestinationDetails';

export default function Likes() {
  const navigate = useNavigate();
  const [selectedNav, setSelectedNav] = useState("Likes");
  const [likedTrips, setLikedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [openSheet, setOpenSheet] = useState(false);

  useEffect(() => {
    fetchLikedTrips();
  }, []);

  const fetchLikedTrips = async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await likeService.getLikedTrips();
      setLikedTrips(response.data || []);
    } catch (error) {
      console.error('Error fetching liked trips:', error);
      setLikedTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (tripId, e) => {
    e.stopPropagation();
    try {
      await likeService.unlikeTrip(tripId);
      setLikedTrips(prev => prev.filter(trip => trip._id !== tripId));
    } catch (error) {
      console.error('Error unliking trip:', error);
    }
  };

  const filteredTrips = likedTrips.filter(trip =>
    trip.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format trip data for destination sheet
  const formatTripForSheet = (trip) => ({
    _id: trip._id,
    id: trip._id,
    placeName: trip.placeName,
    city: trip.city,
    country: trip.country,
    flag: trip.flag || "🇮🇳",
    image: trip.images?.[0] || trip.artImg || "/historic_place.png",
    images: trip.images || [],
    description: trip.description,
    rating: trip.rating,
    reviews: trip.reviews,
    price: trip.price,
    duration: trip.duration,
    category: trip.category,
    info: trip.inclusions?.map(inc => ({
      icon: inc.icon,
      label: inc.label
    })) || [
      { icon: "fi fi-rr-ticket", label: "Ticket" },
      { icon: "fi fi-rr-hotel", label: "Hotel" },
      { icon: "fi fi-rr-restaurant", label: "Meal" }
    ],
    weather: trip.weather || {
      icon: "fi fi-rr-clouds-sun",
      label: "Sunny",
      temp: 32,
      time: "8:40 AM"
    },
    highlights: trip.highlights || [],
    itinerary: trip.itinerary || [],
    availableSlots: trip.availableSlots,
    maxParticipants: trip.maxParticipants
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-24">


      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ backgroundColor: '#1f3121' }}>
        <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
        <p className="text-gray-300 text-sm">Trips you've saved for later</p>
      </div>

      {/* Search bar */}
      <div className="px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="relative">
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-10 pr-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Search your saved trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i className="fi fi-rr-search text-lg"></i>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pt-4 pb-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-900 rounded-full animate-spin"></div>
          </div>
        ) : !authService.isAuthenticated() ? (
          /* Not Logged In State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-heart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Login to see your favorites</h3>
            <p className="text-gray-500 text-sm mb-6">
              Sign in to save and view your favorite trips
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: '#1f3121' }}
            >
              <i className="fi fi-rr-sign-in-alt"></i>
              Login
            </button>
          </motion.div>
        ) : filteredTrips.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-heart text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No matching trips' : 'No saved trips yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start exploring and save your favorite trips'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: '#1f3121' }}
              >
                <i className="fi fi-rr-search"></i>
                Explore Trips
              </button>
            )}
          </motion.div>
        ) : (
          /* Trips Grid */
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer"
                  onClick={() => {
                    setSelectedDestination(formatTripForSheet(trip));
                    setOpenSheet(true);
                  }}
                >
                  <div className="h-40 relative">
                    <img
                      src={trip.images?.[0] || "/historic_place.png"}
                      alt={trip.placeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">
                        {trip.placeName}
                      </h3>
                      <div className="flex items-center text-white/90 text-xs mt-1">
                        <i className="fi fi-rr-marker mr-1"></i>
                        <span>{trip.city}, {trip.country}</span>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={(e) => handleUnlike(trip._id, e)}
                        className="p-1.5 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition"
                      >
                        <i className="fi fi-sr-heart text-base"></i>
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <i className="fi fi-rr-calendar mr-1"></i>
                        <span>{trip.duration}</span>
                      </div>
                      {trip.rating && (
                        <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-green-900 text-xs font-medium">
                          <i className="fi fi-sr-star mr-0.5 text-yellow-500"></i>
                          {trip.rating}
                        </div>
                      )}
                    </div>

                    {trip.price && (
                      <div className="text-sm font-semibold text-gray-800">
                        ${trip.price}<span className="text-xs text-gray-500 font-normal">/person</span>
                      </div>
                    )}

                    {trip.category && (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                          {trip.category}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />

      {/* Destination Details Sheet */}
      <DestinationDetailsSheet
        destination={selectedDestination}
        open={openSheet}
        onClose={() => setOpenSheet(false)}
      />
    </div>
  );
}
