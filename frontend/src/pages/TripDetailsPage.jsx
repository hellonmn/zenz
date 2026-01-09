// pages/TripDetailsPage.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Lottie from 'lottie-react';
import 'leaflet/dist/leaflet.css';
import { likeService } from '../services/likeService';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingService';
import { tripService } from '../services/tripService';
import planeAnimation from '../../public/assets/json/planeAnimation.json';
import successAnimation from '../../public/assets/json/successMark.json';

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);

  // Booking states
  const [bookingStatus, setBookingStatus] = useState(null); // null | 'pending' | 'approved' | 'none'
  const [checkingBooking, setCheckingBooking] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [bookingStep, setBookingStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const currentUser = authService.getCurrentUser();
  const [customerDetails, setCustomerDetails] = useState({
    name: currentUser?.user?.name || currentUser?.name || '',
    email: currentUser?.user?.email || currentUser?.email || '',
    phone: currentUser?.user?.phone || currentUser?.phone || '',
    emergencyContact: '',
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        setLoading(true);
        const response = await tripService.getTripById(tripId);
        setDestination(response.data);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // Check booking status
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!authService.isAuthenticated() || !tripId) {
        setCheckingBooking(false);
        setBookingStatus('none');
        return;
      }

      try {
        const response = await bookingService.getMyBookings();
        const existingBooking = response.data.find(
          booking => booking.trip._id === tripId && booking.status !== 'cancelled'
        );

        if (existingBooking) {
          setBookingData(existingBooking);
          setBookingStatus(existingBooking.status); // 'pending' or 'approved'
        } else {
          setBookingStatus('none');
        }
      } catch (error) {
        console.error('Error checking booking status:', error);
        setBookingStatus('none');
      } finally {
        setCheckingBooking(false);
      }
    };

    checkBookingStatus();
  }, [tripId]);

  // Check if trip is liked
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

    if (destination) {
      checkIfLiked();
    }
  }, [destination]);

  // Geocode location
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

  // Fetch weather
  useEffect(() => {
    if (!coords) return;
    const apiKey = "d05d544eae86b4f38a50937a5688a3f0";
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

  // Check for booking intent after login
  useEffect(() => {
    if (destination && authService.isAuthenticated()) {
      const bookingIntent = sessionStorage.getItem('bookTripIntent');
      if (bookingIntent) {
        try {
          const intent = JSON.parse(bookingIntent);
          if (intent.tripId === destination._id && intent.bookTrip) {
            sessionStorage.removeItem('bookTripIntent');
            setTimeout(() => {
              handleBookNow();
            }, 500);
          }
        } catch (error) {
          console.error('Error parsing booking intent:', error);
        }
      }
    }
  }, [destination]);

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

  const handleBookNow = () => {
    if (!authService.isAuthenticated()) {
      navigate('/login', {
        state: {
          from: window.location.pathname,
          tripId: destination._id,
          bookTrip: true
        }
      });
      return;
    }

    if (bookingStatus === 'none') {
      setShowBookingSheet(true);
      setBookingStep('form');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingData) return;

    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingData._id);
        setBookingStatus('none');
        setBookingData(null);
        alert('Booking cancelled successfully');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(customerDetails.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (numberOfPeople < 1) {
      newErrors.numberOfPeople = 'At least 1 person required';
    } else if (numberOfPeople > destination.availableSlots) {
      newErrors.numberOfPeople = `Only ${destination.availableSlots} slots available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setBookingStep('processing');

      const bookingPayload = {
        tripId: destination._id,
        numberOfPeople: parseInt(numberOfPeople),
        customerDetails,
        paymentMethod: 'card',
        tripStartDate: destination.startDate,
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await bookingService.createBooking(bookingPayload);

      setBookingStep('success');
      setBookingData(response.data);
      setBookingStatus('pending');

      // Auto close after 3 seconds
      setTimeout(() => {
        setShowBookingSheet(false);
        setBookingStep('form');
      }, 3000);

    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create booking' });
      setBookingStep('form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-green-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <i className="fi fi-rr-exclamation text-6xl text-gray-400 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const images = destination?.images && destination.images.length > 0
    ? destination.images
    : destination?.image
      ? [destination.image]
      : ["/historic_place.png"];

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

  const totalPrice = (destination.price || 0) * numberOfPeople;

  // Get button text and handler based on booking status
  const getBookingButton = () => {
    if (checkingBooking) {
      return (
        <button
          disabled
          className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-lg bg-gray-400 cursor-not-allowed"
        >
          Checking...
        </button>
      );
    }

    if (bookingStatus === 'approved') {
      return (
        <div className="w-full space-y-2">
          <div className="w-full py-4 bg-green-100 text-green-800 rounded-2xl font-bold text-lg text-center border-2 border-green-300">
            ✓ Booked
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3 bg-white text-gray-700 rounded-2xl font-semibold border-2 border-gray-300 hover:bg-gray-50"
          >
            View in My Trips
          </button>
        </div>
      );
    }

    if (bookingStatus === 'pending') {
      return (
        <div className="w-full space-y-2">
          <button
            onClick={handleCancelBooking}
            className="w-full py-3 bg-red-50/20 text-red-400 rounded-2xl font-semibold border-2 border-red-100/20 hover:bg-red-100"
          >
            Cancel Booking
          </button>
        </div>
      );
    }

    return (
      <button
        className="w-full py-4 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:shadow-xl"
        style={{ backgroundColor: '#1f3121' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
        onClick={handleBookNow}
      >
        Book Now
      </button>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fi fi-rr-angle-left text-xl text-gray-700"></i>
              </button>
              <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{placeName}</h1>

            </div>
            <div className="flex gap-2">
              <button
                className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                onClick={handleShare}
              >
                <i className="fi fi-rr-share text-xl text-gray-700"></i>
              </button>
              <button
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-50' : 'hover:bg-red-50'
                } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleToggleLike}
                disabled={liking}
              >
                <i className={`${isLiked ? 'fi fi-sr-heart text-red-500' : 'fi fi-rr-heart text-gray-700'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white">
          {images.length === 1 ? (
            // Single image - centered
            <div className="w-full flex justify-center p-4">
              <img
                src={images[0]}
                alt={placeName}
                className="w-full h-72 object-cover rounded-2xl"
                onError={(e) => {
                  e.target.src = "/historic_place.png";
                }}
              />
            </div>
          ) : (
            // Multiple images - scrollable
            <>
              <div
                className="w-full overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory px-4 py-4"
                onScroll={e => {
                  const el = e.currentTarget;
                  const containerWidth = el.offsetWidth;
                  const scrollLeft = el.scrollLeft;
                  const scrollWidth = el.scrollWidth;

                  if (scrollLeft + containerWidth >= scrollWidth - 10) {
                    setActiveImgIdx(images.length - 1);
                    return;
                  }

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
              >
                <div className="flex gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="snap-center rounded-2xl overflow-hidden flex-shrink-0"
                      style={{
                        width: 'calc(100% - 32px)',
                        maxWidth: 500,
                        height: 250,
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

              {/* Dots */}
              <div className="flex justify-center gap-2 pb-4">
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
            </>
          )}
        </div>

        {/* Content */}
        <div className="mx-auto mt-4 space-y-4">
          <div className="p-4">
            {/* Place Info */}
            <div className="bg-white rounded-2xl p-6">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {placeName}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{flag}</span>
                <span className="text-gray-700 font-medium text-lg">{country}</span>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                {description}
              </p>
            </div>

            {/* Price and Duration */}
            {(destination.price || destination.duration) && (
              <div className="flex items-center gap-4">
                {destination.price && (
                  <div className="flex items-center gap-2 bg-green-50 px-5 py-3 rounded-full">
                    <i className="fi fi-rr-dollar text-green-900"></i>
                    <span className="text-green-900 font-bold text-lg">${destination.price}</span>
                  </div>
                )}
                {destination.duration && (
                  <div className="flex items-center gap-2 bg-blue-50 px-5 py-3 rounded-full">
                    <i className="fi fi-rr-calendar text-blue-900"></i>
                    <span className="text-blue-900 font-semibold">{destination.duration}</span>
                  </div>
                )}
              </div>
            )}

            {/* Availability */}
            {destination.availableSlots !== undefined && destination.maxParticipants && (
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Available Slots</span>
                  <span className="text-xl font-bold text-gray-900">
                    {destination.availableSlots} / {destination.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(destination.availableSlots / destination.maxParticipants) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Map and Weather */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4">
                {coords ? (
                  <MapContainer
                    center={[coords.lat, coords.lon]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: 120, borderRadius: 12 }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lon]}>
                      <Popup>{placeName}</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-gray-400">
                    <i className="fi fi-rr-map-marker text-3xl"></i>
                  </div>
                )}
                <span className="text-sm text-gray-500 mt-2 block text-center font-medium">Map Location</span>
              </div>

              <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center">
                {weather ? (
                  <>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.desc}
                      className="w-16 h-16 mb-1"
                    />
                    <span className="text-sm text-gray-500 mb-1">{weather.desc}</span>
                    <div className="flex items-center gap-1 text-gray-700 font-bold text-2xl">
                      <span>{weather.temp}°C</span>
                    </div>
                    <span className="text-xs font-normal text-gray-400 mt-1">{weather.time}</span>
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-clouds-sun text-3xl mb-2 text-yellow-500"></i>
                    <span className="text-sm text-gray-500 mb-1">Weather</span>
                    <span className="text-gray-700 font-bold text-2xl">--°C</span>
                  </>
                )}
              </div>
            </div>

            {/* Info Chips */}
            {info.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {info.map((chip, index) => (
                  <div
                    key={chip.label || index}
                    className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 text-sm font-medium text-gray-700 border border-gray-200"
                  >
                    <i className={`${chip.icon} text-lg`}></i> {chip.label}
                  </div>
                ))}
              </div>
            )}

            {/* Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Highlights</h3>
                <ul className="space-y-3">
                  {destination.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3 text-base text-gray-700">
                      <i className="fi fi-rr-check text-green-600 text-lg mt-0.5"></i>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author and Rating */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=Travel+Guide&background=1f3121&color=fff";
                  }}
                />
                <div>
                  <span className="text-xs text-gray-500">Trip by</span>
                  <p className="text-base text-gray-900 font-semibold">{author.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                <span className="text-orange-500"><i className="fi fi-sr-star text-lg"></i></span>
                <span className="text-gray-700 font-bold text-base">{rating.toFixed(1)}</span>
              </div>
            </div>

          </div>

          {/* Booking Button */}
          <div className="sticky bottom-0 bg-white p-4 rounded-t-2xl shadow-lg border-t border-gray-200">
            {getBookingButton()}
          </div>
        </div>
      </div>

      {/* Booking Bottom Sheet */}
      <AnimatePresence>
        {showBookingSheet && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => bookingStep === 'form' && setShowBookingSheet(false)}
            />

            <motion.div
              className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Form Step */}
              {bookingStep === 'form' && (
                <div className="p-6 overflow-y-auto max-h-[85vh]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Book Your Trip</h2>
                    <button
                      onClick={() => setShowBookingSheet(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <i className="fi fi-rr-cross text-gray-600 text-xl"></i>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    {/* Trip Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Trip</span>
                        <span className="font-semibold text-gray-900">{placeName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price per person</span>
                        <span className="font-semibold text-gray-900">${destination.price}</span>
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
                        max={destination.availableSlots}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                      {errors.numberOfPeople && (
                        <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Available slots: {destination.availableSlots}
                      </p>
                    </div>

                    {/* Contact Info if needed */}
                    {(!currentUser || !customerDetails.name || !customerDetails.email) && (
                      <>
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
                      </>
                    )}

                    {/* Auto-filled message */}
                    {currentUser && customerDetails.name && customerDetails.email && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <i className="fi fi-rr-check-circle text-green-600 text-xl mt-0.5"></i>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900 mb-1">
                              Contact information loaded
                            </p>
                            <p className="text-xs text-green-700">
                              Booking as: {customerDetails.name} ({customerDetails.email})
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={customerDetails.specialRequests}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, specialRequests: e.target.value })}
                        placeholder="Any special requirements..."
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
                    </div>

                    {/* Total */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Price</span>
                        <span className="text-2xl font-bold text-green-700">${totalPrice}</span>
                      </div>
                    </div>

                    {/* Error */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-700 text-sm">{errors.submit}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                      style={{ backgroundColor: '#1f3121' }}
                    >
                      Confirm Booking - ${totalPrice}
                    </button>
                  </form>
                </div>
              )}

              {/* Processing Step */}
              {bookingStep === 'processing' && (
                <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <Lottie
                    animationData={planeAnimation}
                    loop={true}
                    style={{ width: 200, height: 200 }}
                  />
                  <p className="text-xl font-semibold text-gray-900 mt-4">Processing your booking...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait</p>
                </div>
              )}

              {/* Success Step */}
              {bookingStep === 'success' && bookingData && (
                <motion.div
                  className="p-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex flex-col items-center">
                    <Lottie
                      animationData={successAnimation}
                      loop={false}
                      style={{ width: 150, height: 150 }}
                    />
                    <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600 mb-6 text-center">Your trip has been successfully booked</p>

                    <div className="bg-gray-50 rounded-xl p-4 w-full mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Reference</span>
                        <span className="font-mono font-bold text-gray-900">
                          {bookingData.bookingReference}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Trip</span>
                        <span className="font-semibold text-gray-900">{placeName}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">People</span>
                        <span className="font-semibold text-gray-900">{bookingData.numberOfPeople}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="font-bold text-green-700 text-lg">${bookingData.totalPrice}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      Confirmation email sent to {bookingData.customerDetails?.email}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
