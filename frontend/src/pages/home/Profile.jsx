// pages/home/Profile.jsx
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Settings, Camera, Edit, MapPin, Calendar, Sparkles } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { bookingService } from "../../services/bookingService";
import { likeService } from "../../services/likeService";

export default function Profile() {
  const navigate = useNavigate();
  const [selectedNav, setSelectedNav] = useState("Profile");
  const [activeTab, setActiveTab] = useState("Saved");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likedTrips, setLikedTrips] = useState([]);
  const [bookedTrips, setBookedTrips] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        const data = await authService.getProfile();
        setUser(data);

        // Fetch liked trips
        try {
          const likedResponse = await likeService.getLikedTrips();
          setLikedTrips(likedResponse.data || []);
        } catch (err) {
          console.error('Error fetching liked trips:', err);
        }

        // Fetch booked trips
        try {
          const bookingsResponse = await bookingService.getMyBookings();
          setBookedTrips(bookingsResponse.data || []);
        } catch (err) {
          console.error('Error fetching bookings:', err);
        }

        setLoading(false);
      } catch (err) {
        setError("Could not load profile. Please login again.");
        setUser(null);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">You are not logged in</h2>
          <p className="mb-6 text-gray-600">Please login or sign up to view your profile.</p>
          <div className="flex space-x-4">
            <Link to="/login" className="px-6 py-2 bg-green-900 text-white rounded-full font-medium">Login</Link>
            <Link to="/register" className="px-6 py-2 bg-green-700 text-white rounded-full font-medium">Sign Up</Link>
          </div>
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    );
  }

  const backendUrl = "https://zenz-backend.onrender.com";
  const getImageUrl = (url) => url?.startsWith('http') ? url : backendUrl + url;

  return (
    <motion.div
      className="pb-28 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cover and Profile Image */}
      <div className="relative">
        <div className="h-48 w-full bg-green-900">
          {user.coverImage ? (
            <img
              src={getImageUrl(user.coverImage)}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-green-700 to-green-900" />
          )}
        </div>

        {/* Header buttons */}
        <div className="absolute top-8 flex justify-between w-full px-4">
          <button
            className="p-2 bg-white rounded-full shadow"
            onClick={() => navigate("/")}
          >
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow">
            <Settings size={20} />
          </button>
        </div>

        {/* Profile image */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-green-900">
              {user.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fi fi-rr-user text-white text-4xl"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        {user.location && (
          <div className="flex items-center justify-center mt-1 text-gray-600">
            <MapPin size={16} className="mr-1" />
            <span>{user.location}</span>
          </div>
        )}
        {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}

        <Link to="edit" className="w-fit mt-4 px-6 py-2 bg-green-900 text-white rounded-full font-medium flex items-center mx-auto">
          <Edit size={16} className="mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="flex justify-center mt-6 px-4">
        <div className="flex space-x-8">
          <div className="text-center cursor-pointer hover:opacity-70 transition">
            <p className="font-bold text-gray-800">{bookedTrips.length}</p>
            <p className="text-gray-600 text-sm">Trips</p>
          </div>
          <div className="text-center cursor-not-allowed opacity-50">
            <p className="font-bold text-gray-800">0</p>
            <p className="text-gray-600 text-sm">Photos</p>
          </div>
          <div className="text-center cursor-not-allowed opacity-50">
            <p className="font-bold text-gray-800">0</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div className="text-center cursor-not-allowed opacity-50">
            <p className="font-bold text-gray-800">0</p>
            <p className="text-gray-600 text-sm">Following</p>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="mt-8 px-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 pb-2 font-medium ${activeTab === "Saved" ? "text-green-900 border-b-2 border-green-900" : "text-gray-500"}`}
            onClick={() => setActiveTab("Saved")}
          >
            Saved
          </button>
          <button
            className={`flex-1 pb-2 font-medium ${activeTab === "Photos" ? "text-green-900 border-b-2 border-green-900" : "text-gray-500"}`}
            onClick={() => setActiveTab("Photos")}
          >
            Photos
          </button>
          <button
            className={`flex-1 pb-2 font-medium ${activeTab === "Trips" ? "text-green-900 border-b-2 border-green-900" : "text-gray-500"}`}
            onClick={() => setActiveTab("Trips")}
          >
            Trips
          </button>
        </div>
      </div>

      {/* Saved trips tab */}
      {activeTab === "Saved" && (
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Liked Trips</h2>
          </div>

          {likedTrips.length > 0 ? (
            likedTrips.map(trip => (
              <div
                key={trip._id}
                className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                <div className="flex">
                  <div className="w-1/3 h-24">
                    <img
                      src={trip.images?.[0] || trip.image || "/historic_place.png"}
                      alt={trip.placeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-3">
                    <h3 className="font-semibold text-gray-800">{trip.placeName}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{trip.city}, {trip.country}</span>
                    </div>
                    {trip.price && (
                      <div className="flex items-center text-green-700 text-sm mt-1 font-semibold">
                        ${trip.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <i className="fi fi-rr-heart text-4xl mb-3 block"></i>
              <p>No liked trips yet</p>
              <p className="text-sm mt-1">Start exploring and save your favorites!</p>
            </div>
          )}
        </div>
      )}

      {/* Photos tab content - Coming Soon */}
      {activeTab === "Photos" && (
        <div className="mt-4 px-4">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
            <p className="text-gray-600">
              Photo gallery feature is currently under development.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Soon you'll be able to share your travel memories here.
            </p>
          </div>
        </div>
      )}

      {/* Trips tab content - Booked Trips */}
      {activeTab === "Trips" && (
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">My Bookings</h2>
            <Link to="/myBookings" className="text-green-900 font-medium text-sm">See All</Link>
          </div>

          {bookedTrips.length > 0 ? (
            bookedTrips.slice(0, 5).map(booking => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => navigate('/myBookings')}
              >
                <div className="flex">
                  <div className="w-1/3 h-24">
                    <img
                      src={booking.trip?.images?.[0] || booking.trip?.image || "/historic_place.png"}
                      alt={booking.trip?.placeName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{booking.trip?.placeName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <Calendar size={14} className="mr-1" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-green-700 text-sm mt-1 font-semibold">
                      ${booking.totalPrice}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <i className="fi fi-rr-suitcase-alt text-4xl mb-3 block"></i>
              <p>No trips booked yet</p>
              <p className="text-sm mt-1">Book your first adventure!</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />
    </motion.div>
  );
}
