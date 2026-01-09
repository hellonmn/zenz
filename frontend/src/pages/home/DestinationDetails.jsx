// pages/home/DestinationDetails.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import BookingForm from '../../components/BookingForm';
import { likeService } from '../../services/likeService';
import { authService } from '../../services/authService';

export default function DestinationDetailsSheet({ destination, open, onClose }) {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Check if trip is liked when destination changes
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!destination?._id || !authService.isAuthenticated()) {
        setIsLiked(false);
        return;
      }

      try {
        const response = await likeService.getLikedTrips();
        const liked = response.data.some(trip => trip._id === destination._id);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error checking like status:', error);
        setIsLiked(false);
      }
    };

    if (open && destination) {
      checkIfLiked();
    }
  }, [destination, open]);

  // Check for booking intent after login
  useEffect(() => {
    if (open && destination && authService.isAuthenticated()) {
      const bookingIntent = sessionStorage.getItem('bookTripIntent');
      if (bookingIntent) {
        try {
          const intent = JSON.parse(bookingIntent);
          if (intent.tripId === destination._id && intent.bookTrip) {
            // Clear the intent
            sessionStorage.removeItem('bookTripIntent');
            // Auto-open booking form
            setTimeout(() => {
              setShowBookingForm(true);
            }, 500);
          }
        } catch (error) {
          console.error('Error parsing booking intent:', error);
        }
      }
    }
  }, [open, destination]);

  // Toggle like function
  const handleToggleLike = async () => {
    if (!authService.isAuthenticated()) {
      alert('Please login to like trips');
      return;
    }

    if (liking) return;

    try {
      setLiking(true);
      if (isLiked) {
        await likeService.unlikeTrip(destination._id);
        setIsLiked(false);
      } else {
        await likeService.likeTrip(destination._id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/trip/${destination._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: `Check out this amazing trip: ${placeName} in ${country}`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert(`Share this link: ${text}`);
    });
  };

  // Handle Book Now button click
  const handleBookNow = () => {
    if (!authService.isAuthenticated()) {
      // Redirect to login with trip booking intent
      navigate('/login', {
        state: {
          from: window.location.pathname,
          tripId: destination._id,
          bookTrip: true
        }
      });
      return;
    }
    setShowBookingForm(true);
  };

  // Image stack logic
  const images = destination?.images && destination.images.length > 0
    ? destination.images
    : destination?.image
      ? [destination.image]
      : ["/historic_place.png"];

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Geocode city/country to coordinates
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!destination?.city && !destination?.country) return;
    const query = encodeURIComponent(`${destination.city || ""} ${destination.country || ""}`);
    fetch(`https://corsproxy.io/?https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      })
      .catch(err => console.error('Geocoding error:', err));
  }, [destination]);

  // Fetch weather from OpenWeatherMap
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!coords) return;
    const apiKey = "d05d544eae86b4f38a50937a5688a3f0"; // Replace with your API key
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`)
      .then(res => res.json())
      .then(data => {
        if (data && data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            desc: data.weather[0].main,
            icon: data.weather[0].icon,
            time: new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      })
      .catch(err => console.error('Weather error:', err));
  }, [coords]);

  if (!open || !destination) return null;

  // Safe access with fallbacks
  const placeName = destination.placeName || destination.name || "Unknown Place";
  const country = destination.country || "Unknown";
  const flag = destination.flag || "🌍";
  const description = destination.description || "No description available";
  const rating = destination.rating || 0;
  const info = destination.info || [];
  const author = destination.author || { 
    name: "Travel Guide", 
    avatar: "https://ui-avatars.com/api/?name=Travel+Guide&background=1f3121&color=fff" 
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Bottom Sheet */}
        <motion.div
          className="relative w-full max-w-md bg-white rounded-t-3xl shadow-xl px-6 py-8 flex flex-col items-center z-10 max-h-[90vh] overflow-y-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Drag handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
          
          {/* Image Stack - only one image visible at a time, scrollable */}
          <div className="w-full flex flex-col items-center relative" style={{ height: 260 }}>
            <button
              className="absolute top-4 left-4 bg-white rounded-full shadow p-2 z-20"
              onClick={onClose}
            >
              <i className="fi fi-rr-arrow-left text-xl text-gray-700"></i>
            </button>
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button
                className="bg-white rounded-full shadow p-2 hover:bg-blue-50 transition-all"
                onClick={handleShare}
              >
                <i className="fi fi-rr-share text-xl text-gray-700"></i>
              </button>
              <button
                className={`rounded-full shadow p-2 transition-all ${
                  isLiked ? 'bg-red-50' : 'bg-white hover:bg-red-50'
                } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleToggleLike}
                disabled={liking}
              >
                <i className={`${isLiked ? 'fi fi-sr-heart text-red-500' : 'fi fi-rr-heart text-gray-700'} text-xl`}></i>
              </button>
            </div>

            <div
              className="w-full overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory"
              onScroll={e => {
                const el = e.currentTarget;
                const containerWidth = el.offsetWidth;
                const scrollLeft = el.scrollLeft;
                const scrollWidth = el.scrollWidth;

                // If scrolled to the end, set to last image
                if (scrollLeft + containerWidth >= scrollWidth - 10) {
                  setActiveImgIdx(images.length - 1);
                  return;
                }

                // Otherwise calculate based on scroll position
                const children = Array.from(el.children[0]?.children || []);
                let minDist = Infinity;
                let activeIdx = 0;

                children.forEach((child, idx) => {
                  const rect = child.getBoundingClientRect();
                  const center = rect.left + rect.width / 2;
                  const parentCenter = el.getBoundingClientRect().left + containerWidth / 2;
                  const dist = Math.abs(center - parentCenter);

                  if (dist < minDist) {
                    minDist = dist;
                    activeIdx = idx;
                  }
                });

                setActiveImgIdx(activeIdx);
              }}
              style={{ height: 220, marginTop: 24 }}
            >
              <div className="flex gap-3 px-6 h-full">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="snap-center rounded-3xl overflow-hidden flex-shrink-0 transition-all duration-300"
                    style={{
                      width: 'calc(100% - 48px)',
                      maxWidth: 340,
                      height: 200,
                      transform: activeImgIdx === idx ? 'scale(1)' : 'scale(0.95)',
                      opacity: activeImgIdx === idx ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${placeName} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/historic_place.png";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots for images */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-2 mb-2">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className="h-2 rounded-full transition-all duration-300 inline-block"
                    style={{
                      width: activeImgIdx === idx ? 24 : 8,
                      backgroundColor: activeImgIdx === idx ? '#1f3121' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Place Info */}
          <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1 mt-2">
            {placeName}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">{flag}</span>
            <span className="text-gray-700 font-medium text-base">{country}</span>
          </div>
          <p className="text-gray-500 text-center mb-4 text-base px-2">
            {description}
          </p>

          {/* Price and Duration */}
          {(destination.price || destination.duration) && (
            <div className="flex items-center gap-4 mb-4">
              {destination.price && (
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <i className="fi fi-rr-dollar text-green-900"></i>
                  <span className="text-green-900 font-bold">${destination.price}</span>
                </div>
              )}
              {destination.duration && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                  <i className="fi fi-rr-calendar text-blue-900"></i>
                  <span className="text-blue-900 font-semibold">{destination.duration}</span>
                </div>
              )}
            </div>
          )}

          {/* Availability Info */}
          {destination.availableSlots !== undefined && destination.maxParticipants && (
            <div className="w-full mb-4 bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Available Slots</span>
                <span className="text-lg font-bold text-gray-900">
                  {destination.availableSlots} / {destination.maxParticipants}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ 
                    width: `${(destination.availableSlots / destination.maxParticipants) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Info Row (map/weather) */}
          <div className="flex gap-3 w-full mb-4">
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[100px]">
              {coords ? (
                <MapContainer 
                  center={[coords.lat, coords.lon]} 
                  zoom={12} 
                  scrollWheelZoom={false} 
                  style={{ width: '100%', height: 80, borderRadius: 16 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords.lat, coords.lon]}>
                    <Popup>{placeName}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="w-full h-20 flex items-center justify-center text-gray-400">
                  <i className="fi fi-rr-map-marker text-2xl"></i>
                </div>
              )}
              <span className="text-xs text-gray-500 mt-1">Map</span>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[100px]">
              {weather ? (
                <>
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                    alt={weather.desc} 
                    className="w-10 h-10 mb-1" 
                  />
                  <span className="text-xs text-gray-500 mb-1">{weather.desc}</span>
                  <div className="flex items-center gap-1 text-gray-700 font-bold text-lg">
                    <span>{weather.temp}°C</span>
                  </div>
                  <span className="text-xs font-normal text-gray-400">{weather.time}</span>
                </>
              ) : (
                <>
                  <i className="fi fi-rr-clouds-sun text-xl mb-1 text-yellow-500"></i>
                  <span className="text-xs text-gray-500 mb-1">Weather</span>
                  <span className="text-gray-700 font-bold text-lg">--°C</span>
                </>
              )}
            </div>
          </div>

          {/* Info Chips */}
          {info.length > 0 && (
            <div className="flex gap-3 w-full mb-4 justify-center flex-wrap">
              {info.map((chip, index) => (
                <div 
                  key={chip.label || index} 
                  className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 text-sm font-medium text-gray-700"
                >
                  <i className={`${chip.icon} text-base`}></i> {chip.label}
                </div>
              ))}
            </div>
          )}

          {/* Highlights */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="w-full mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Highlights</h3>
              <ul className="space-y-2">
                {destination.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <i className="fi fi-rr-check text-green-600 mt-1"></i>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Author and Rating Row */}
          <div className="flex items-center justify-between w-full mt-2 mb-4">
            <div className="flex items-center gap-2">
              <img 
                src={author.avatar} 
                alt={author.name} 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Travel+Guide&background=1f3121&color=fff";
                }}
              />
              <span className="text-sm text-gray-700 font-medium">By {author.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow border border-gray-100">
              <span className="text-orange-500"><i className="fi fi-sr-star"></i></span>
              <span className="text-gray-700 font-semibold text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Book Now Button */}
          <button
            className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: '#1f3121' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </motion.div>
      </motion.div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBookingForm(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <BookingForm
              trip={destination}
              onSuccess={(booking) => {
                setBookingSuccess(booking);
                setShowBookingForm(false);
              }}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </motion.div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setBookingSuccess(null);
              onClose();
            }}
          />
          <motion.div
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fi fi-rr-check text-3xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-4">Your trip has been successfully booked.</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Booking Reference</span>
                  <span className="font-mono font-bold text-gray-900">
                    {bookingSuccess.bookingReference}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Trip</span>
                  <span className="font-semibold text-gray-900">{placeName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">People</span>
                  <span className="font-semibold text-gray-900">
                    {bookingSuccess.numberOfPeople}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-bold text-green-700 text-lg">
                    ${bookingSuccess.totalPrice}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                A confirmation email has been sent to {bookingSuccess.customerDetails?.email}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/myBookings')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => {
                    setBookingSuccess(null);
                    onClose();
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}