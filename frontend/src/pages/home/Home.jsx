import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tripService } from "../../services/tripService";
import { likeService } from "../../services/likeService";
import { authService } from "../../services/authService";
import locationService from "../../services/locationService";

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Historical");
  const [selectedNav, setSelectedNav] = useState("Home");
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const stackRef = useRef(null);

  // State for trips from API
  const [categoryTrips, setCategoryTrips] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);
  const [likedTrips, setLikedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for location filtering
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Reset activeStackIndex when category changes
  useEffect(() => {
    setActiveStackIndex(0);
    if (stackRef.current) {
      stackRef.current.scrollLeft = 0;
    }
  }, [selectedCategory]);

  // Fetch trips by category and location
  useEffect(() => {
    fetchTripsByCategory();
  }, [selectedCategory, selectedLocation]);

  // Fetch popular trips on mount or location change
  useEffect(() => {
    fetchPopularTrips();
    fetchLikedTrips();
  }, [selectedLocation]);

  const fetchTripsByCategory = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripsByCategory(selectedCategory);
      let trips = response.data || [];

      // STRICT: Only show trips from the selected city
      if (selectedLocation?.city) {
        trips = trips.filter(trip => {
          // Ensure trip has a city and it matches exactly (case-insensitive)
          if (!trip.city) return false;
          return trip.city.trim().toLowerCase() === selectedLocation.city.trim().toLowerCase();
        });
      }

      setCategoryTrips(trips);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips');
      setCategoryTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTrips = async () => {
    try {
      const response = await tripService.getPopularTrips();
      let trips = response.data || [];

      // STRICT: Only show trips from the selected city
      if (selectedLocation?.city) {
        trips = trips.filter(trip => {
          // Ensure trip has a city and it matches exactly (case-insensitive)
          if (!trip.city) return false;
          return trip.city.trim().toLowerCase() === selectedLocation.city.trim().toLowerCase();
        });
      }

      setPopularTrips(trips);
    } catch (err) {
      console.error('Error fetching popular trips:', err);
      setPopularTrips([]);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const fetchLikedTrips = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }
    try {
      const response = await likeService.getLikedTrips();
      setLikedTrips(response.data || []);
    } catch (err) {
      console.error('Error fetching liked trips:', err);
      setLikedTrips([]);
    }
  };

  const toggleLike = async (tripId, e) => {
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      alert('Please login to like trips');
      return;
    }

    const isLiked = likedTrips.some(trip => trip._id === tripId || trip === tripId);

    try {
      if (isLiked) {
        await likeService.unlikeTrip(tripId);
        setLikedTrips(prev => prev.filter(trip => (trip._id || trip) !== tripId));
      } else {
        await likeService.likeTrip(tripId);
        setLikedTrips(prev => [...prev, tripId]);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Handler to update activeStackIndex on scroll
  const handleStackScroll = () => {
    const el = stackRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    let minDist = Infinity;
    let activeIdx = 0;
    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const parentCenter = el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
      const dist = Math.abs(center - parentCenter);
      if (dist < minDist) {
        minDist = dist;
        activeIdx = idx;
      }
    });
    setActiveStackIndex(activeIdx);
  };

  // Tourist place categories
  const categories = [
    { id: "Historical", label: "Historical" },
    { id: "Cultural", label: "Cultural" },
    { id: "Modern", label: "Modern" },
    { id: "Beaches", label: "Beaches" },
    { id: "Spiritual", label: "Spiritual" },
    { id: "Adventure", label: "Adventure" },
    { id: "Nature", label: "Nature" }
  ];


  return (
    <div className="pb-28 min-h-screen bg-[#f7f8fa]">
      <Header onLocationChange={handleLocationChange} />

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto px-4 mt-4">
        <input
          className="w-full border border-gray-200 text-md pl-12 pr-12 h-14 rounded-full bg-white outline-none text-gray-800 focus:ring-2 focus:ring-green-900 transition placeholder-gray-500"
          placeholder="Search destinations or trips..."
        />
        <span className="absolute top-4.5 left-9 text-gray-400 text-xl">
          <i className="fi fi-rr-search"></i>
        </span>
        <button
          className="absolute top-2 right-6 flex items-center justify-center text-gray-700 rounded-full bg-gray-100 hover:bg-green-900 hover:text-white w-10 h-10 transition"
        >
          <i className="fi fi-rr-filter text-gray-500 text-xl"></i>
        </button>
      </div>

      {/* Banner */}
      <div className="flex p-4 relative">
        {loading ? (
          <div className="w-full h-52 bg-gray-200 rounded-4xl animate-pulse"></div>
        ) : (
          <>
            {/* Ambient Glow Effect */}
            <div
              className="absolute inset-0 z-0 rounded-4xl blur-2xl opacity-60 pointer-events-none"
              style={{
                backgroundImage: 'url(/banner.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px)',
                transform: 'scale(0.85)',
              }}
              aria-hidden="true"
            />

            <div
              className="mb-4 w-full h-52 rounded-4xl bg-cover bg-center relative z-10"
              style={{ backgroundImage: 'url(/banner.jpg)' }}
              aria-label="Travel Banner"
            />
          </>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {categories.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-base font-medium transition-all whitespace-nowrap ${
              selectedCategory === tab.id 
                ? "bg-gray-900 text-white border-green-900" 
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Horizontal Stack for Selected Category */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Places: {selectedCategory}</h2>
        </div>

        {/* Loading State - Skeleton */}
        {loading && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[270px] max-w-xs rounded-4xl bg-gray-100 p-5 py-0 flex-shrink-0 flex flex-col gap-3 mt-8 animate-pulse">
                {/* Art Image Skeleton */}
                <div className="relative pt-3 w-full">
                  <div className="absolute -top-6 w-full">
                    <div className="flex items-center justify-center">
                      <div className="w-40 h-40 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex h-28"></div>
                  {/* Rating and Like Skeleton */}
                  <div className="absolute top-4 left-1 bg-gray-200 px-5 py-3 rounded-full w-16 h-8"></div>
                  <div className="absolute top-4 right-1 w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>

                {/* Content Skeleton */}
                <div className="flex flex-col gap-2 w-full items-center">
                  <div className="w-32 h-6 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-10 bg-gray-200 rounded mt-2"></div>
                  <div className="flex gap-2 w-full justify-center mt-2">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="w-full h-10 bg-gray-200 rounded-3xl rounded-b-none mt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchTripsByCategory}
              className="mt-4 px-6 py-2 bg-green-900 text-white rounded-full hover:bg-green-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Trips State */}
        {!loading && !error && categoryTrips.length === 0 && (
          <div className="text-center py-12">
            <i className="fi fi-rr-search-location text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-700 font-semibold mb-1">No trips found</p>
            <p className="text-gray-500 text-sm">
              {selectedLocation?.city
                ? `No ${selectedCategory.toLowerCase()} trips available in ${selectedLocation.city}`
                : `No trips available in this category`}
            </p>
            {selectedLocation?.city && (
              <button
                onClick={() => {
                  locationService.clearLocation();
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-green-900 text-white rounded-lg text-sm hover:bg-green-800"
              >
                Clear Location Filter
              </button>
            )}
          </div>
        )}

        {/* Trips List */}
        {!loading && !error && categoryTrips.length > 0 && (
          <>
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory"
              ref={stackRef}
              onScroll={handleStackScroll}
            >
              {categoryTrips.map(trip => (
                <div 
                  key={trip._id} 
                  className="min-w-[270px] max-w-xs rounded-4xl bg-green-500/10 p-5 py-0 flex-shrink-0 flex flex-col gap-3 relative mt-8 items-center snap-center"
                >
                  <div className="relative pt-3 w-full">
                    <div className="absolute -top-6 w-full">
                      <div className="flex items-center justify-center">
                        <img 
                          src={trip.artImg || "/3.png"} 
                          alt="" 
                          className="w-40" 
                        />
                      </div>
                    </div>
                    <div className="flex h-28"></div>
                    <div className="absolute top-4 left-1 bg-white/90 px-5 py-3 rounded-full text-xs font-semibold flex items-center gap-1 border border-gray-100">
                      <span style={{ color: '#1f3121' }}>
                        <i className="fi fi-sr-star"></i>
                      </span>
                      <span className="text-gray-500 text-xs">{trip.rating}</span>
                    </div>
                    <button
                      onClick={(e) => toggleLike(trip._id, e)}
                      className={`absolute top-4 right-1 p-2 rounded-full transition border border-gray-100 ${
                        likedTrips.some(t => (t._id || t) === trip._id)
                          ? 'bg-red-50 text-red-500'
                          : 'bg-white/90 hover:bg-red-100'
                      }`}
                    >
                      <i className={`${likedTrips.some(t => (t._id || t) === trip._id) ? 'fi fi-sr-heart' : 'fi fi-rr-heart'} p-1`}></i>
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex text-lg font-bold text-gray-900 flex-col items-center">
                      <span className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                        {trip.placeName}
                      </span>
                      <span className="text-sm font-normal text-gray-500">{trip.city}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1 text-center mt-1 line-clamp-2">
                      {trip.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold justify-center">
                      <span>{trip.duration}</span>
                      <span>•</span>
                      <span>${trip.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex w-full items-center justify-center">
                    <button
                      className="mt-2 w-fit py-2 px-8 text-white rounded-3xl rounded-b-none font-semibold shadow transition"
                      style={{ backgroundColor: '#1f3121' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    >
                      Show details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Custom Scrollbar Dots */}
            <div className="flex justify-center gap-2 mt-2">
              {categoryTrips.map((_, idx) => (
                <span
                  key={idx}
                  className="h-2 rounded-full transition-all duration-300 inline-block"
                  style={{
                    width: activeStackIndex === idx ? 24 : 8,
                    borderRadius: activeStackIndex === idx ? 8 : 999,
                    backgroundColor: activeStackIndex === idx ? '#1f3121' : '#d1d5db'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Popular Destinations Cards */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-2 mt-2">
          <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
          <button className="text-green-900 text-sm font-semibold hover:underline">
            View all
          </button>
        </div>

        {/* Skeleton Loading for Popular Trips */}
        {loading && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[310px] max-w-[310px] bg-white rounded-2xl flex-shrink-0 flex flex-col overflow-hidden border border-gray-100 animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="p-3 pb-0">
                  <div className="w-full h-40 bg-gray-200 rounded-xl"></div>
                </div>

                {/* Content Skeleton */}
                <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
                  <div className="w-32 h-5 bg-gray-200 rounded"></div>
                  <div className="flex gap-2">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && popularTrips.length === 0 ? (
          <div className="text-center py-8">
            <i className="fi fi-rr-map-marker-cross text-3xl text-gray-400 mb-2"></i>
            <p className="text-gray-600 font-medium mb-1">No popular destinations</p>
            <p className="text-gray-500 text-sm">
              {selectedLocation?.city
                ? `No popular trips available in ${selectedLocation.city}`
                : 'No popular destinations available'}
            </p>
          </div>
        ) : !loading ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
            {popularTrips.map(trip => (
              <div
                key={trip._id}
                className="snap-center min-w-[310px] max-w-[310px] bg-white rounded-2xl flex-shrink-0 flex flex-col overflow-hidden border border-gray-100"
              >
                {/* Image section */}
                <div className="relative p-3 pb-0">
                  <img
                    src={trip.images?.[0] || "/historic_place.png"}
                    alt={trip.placeName}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  {/* Like button */}
                  <button
                    onClick={(e) => toggleLike(trip._id, e)}
                    className={`absolute top-5 right-7 p-2 rounded-full shadow border border-gray-200 ${
                      likedTrips.some(t => (t._id || t) === trip._id)
                        ? 'bg-red-50 text-red-500'
                        : 'bg-white hover:bg-red-100'
                    }`}
                  >
                    <i className={`${likedTrips.some(t => (t._id || t) === trip._id) ? 'fi fi-sr-heart' : 'fi fi-rr-heart'} text-lg`}></i>
                  </button>
                </div>
                
                {/* Info section */}
                <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900 truncate max-w-[160px]">
                      {trip.placeName}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-2 mb-1">
                    <span>{trip.duration}</span>
                    <span className="mx-1">•</span>
                    <span>from ${trip.price}/person</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <i className="fi fi-sr-star" style={{ color: '#1f3121' }}></i>
                      <span className="font-semibold">{trip.rating}</span>
                      <span className="text-gray-400 ml-1">{trip.reviews} reviews</span>
                    </div>
                    <button
                      className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white transition"
                      style={{ backgroundColor: '#1f3121' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    >
                      <i className="fi fi-rr-arrow-right text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* My Saved Section */}
      {authService.isAuthenticated() && likedTrips.length > 0 && (
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-2 mt-2">
            <h2 className="text-xl font-bold text-gray-900">My Saved Trips</h2>
            <button
              onClick={() => setSelectedNav("Likes")}
              className="text-green-900 text-sm font-semibold hover:underline"
            >
              View all
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
            {likedTrips.slice(0, 5).map(trip => (
              <div
                key={trip._id}
                className="snap-center min-w-[310px] max-w-[310px] bg-white rounded-2xl flex-shrink-0 flex flex-col overflow-hidden border border-gray-100"
              >
                {/* Image section */}
                <div className="relative p-3 pb-0">
                  <img
                    src={trip.images?.[0] || "/historic_place.png"}
                    alt={trip.placeName}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  {/* Like button */}
                  <button
                    onClick={(e) => toggleLike(trip._id, e)}
                    className="absolute top-5 right-7 p-2 rounded-full shadow border border-gray-200 bg-red-50 text-red-500"
                  >
                    <i className="fi fi-sr-heart text-lg"></i>
                  </button>
                </div>

                {/* Info section */}
                <div className="flex flex-col gap-1 px-4 pt-3 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900 truncate max-w-[160px]">
                      {trip.placeName}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-2 mb-1">
                    <span>{trip.duration}</span>
                    <span className="mx-1">•</span>
                    <span>from ${trip.price}/person</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <i className="fi fi-sr-star" style={{ color: '#1f3121' }}></i>
                      <span className="font-semibold">{trip.rating}</span>
                      <span className="text-gray-400 ml-1">{trip.reviews} reviews</span>
                    </div>
                    <button
                      className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white transition"
                      style={{ backgroundColor: '#1f3121' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
                      onClick={() => navigate(`/trip/${trip._id}`)}
                    >
                      <i className="fi fi-rr-arrow-right text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />
    </div>
  );
}