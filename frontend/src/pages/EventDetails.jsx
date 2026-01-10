import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { eventService } from "../services/eventService";
import { authService } from "../services/authService";

export default function EventDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showBookingSheet, setShowBookingSheet] = useState(false);
  const [user, setUser] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Check if user already booked this event
    if (currentUser) {
      checkUserBooking();
    }

    // Check if user just logged in with booking intent
    const bookingIntent = localStorage.getItem("bookingIntent");
    if (bookingIntent === "true" && authService.isAuthenticated()) {
      localStorage.removeItem("bookingIntent");
      setShowBookingSheet(true);
    }
  }, [slug]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserBooking = async () => {
    try {
      const response = await eventService.getUserBooking(slug);
      if (response.data) {
        setUserBooking(response.data);
      }
    } catch (error) {
      // No booking found or error - user hasn't booked
      console.log("No existing booking found");
    }
  };

  const handleDownloadBrochure = () => {
    if (event?.brochureUrl) {
      window.open(event.brochureUrl, "_blank");
    }
  };

  const handleBookNow = () => {
    // Check if user already booked
    if (userBooking) {
      alert(`You have already booked this event. Reference: ${userBooking.bookingReference}`);
      return;
    }

    // Check if user is logged in
    if (!authService.isAuthenticated()) {
      // Store intended action and redirect to login
      localStorage.setItem("redirectAfterLogin", `/events/${slug}`);
      localStorage.setItem("bookingIntent", "true");
      navigate("/login");
      return;
    }

    setShowBookingSheet(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="w-full h-72 bg-gray-200"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <i className="fi fi-rr-calendar-exclamation text-3xl text-gray-400"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This event doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-green-900 text-white rounded-full font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Back and Share Buttons */}
      <div className="fixed top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-lg"
        >
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <button
          onClick={() =>
            navigator.share?.({
              title: event.title,
              url: window.location.href,
            })
          }
          className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-lg"
        >
          <i className="fi fi-rr-share"></i>
        </button>
      </div>

      <div className="">
        {/* Hero Banner - Portrait Ratio */}
        <div className="px-4 pt-4">
          {event.bannerImage && (
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={event.bannerImage}
                alt={event.title}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Event Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {event.edition && (
                  <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                    {event.edition}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-white/90 text-base md:text-lg">
                  {event.tagline}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="px-4 mt-4 mb-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fi fi-rr-calendar text-orange-600"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {formatDate(event.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fi fi-rr-marker text-green-600"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Venue</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {event.venue.name}
                </p>
              </div>
            </div>

            {event.ticketPrice === 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fi fi-rr-ticket text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Entry</p>
                  <p className="text-sm font-bold text-green-600">FREE</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fi fi-rr-indian-rupee-sign text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{event.ticketPrice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Brochure Button */}
        {event.brochureUrl && (
          <div className="px-4 mb-4">
            <button
              onClick={handleDownloadBrochure}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <i className="fi fi-rr-download"></i>
              Download Brochure
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-1 border-2 border-gray-200 flex gap-1 overflow-x-auto no-scrollbar">
            {["about", "schedule", "highlights", "venue"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold capitalize text-sm whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-green-900 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border-2 border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {event.aboutEvent}
                </p>

                {event.aboutOrganizers && (
                  <div className="mt-6">
                    <h4 className="text-base font-bold text-gray-900 mb-2">
                      Organizers
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {event.aboutOrganizers}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "schedule" && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {event.schedule?.map((daySchedule, idx) => {
                  const isExpanded = expandedDay === idx;
                  return (
                    <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : idx)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-900 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold">
                              D{daySchedule.day}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900">
                              Day {daySchedule.day}
                            </p>
                            <p className="text-sm text-gray-600">
                              {daySchedule.date}
                            </p>
                          </div>
                        </div>
                        <motion.i
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="fi fi-rr-angle-down text-gray-600"
                        ></motion.i>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
                              {daySchedule.scheduleItems?.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex gap-3">
                                  <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold h-fit whitespace-nowrap">
                                    {item.time}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {item.title}
                                    </p>
                                    {item.description && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "highlights" && (
              <motion.div
                key="highlights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border-2 border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Key Highlights
                </h3>
                <div className="space-y-3">
                  {event.highlights?.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fi fi-rr-star text-orange-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {highlight.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "venue" && (
              <motion.div
                key="venue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border-2 border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Venue</h3>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {event.venue.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <i className="fi fi-rr-marker text-orange-500 mt-0.5"></i>
                      {event.venue.address}
                    </p>
                  </div>

                  {event.venue.mapLink && (
                    <a
                      href={event.venue.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block flex items-center justify-center w-full py-3 bg-green-900 text-white text-center rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                    >
                      <i className="fi fi-rr-map mr-2"></i>
                      Open in Maps
                    </a>
                  )}

                  {event.contactInfo && event.contactInfo.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Contact
                      </h4>
                      {event.contactInfo.map((contact, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-3 mb-2"
                        >
                          <p className="font-semibold text-gray-900 text-sm">
                            {contact.name}
                          </p>
                          {contact.role && (
                            <p className="text-xs text-gray-600">
                              {contact.role}
                            </p>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-sm text-blue-600 mt-1 flex items-center gap-1"
                            >
                              <i className="fi fi-rr-phone-call"></i>
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {userBooking ? (
          <div className="space-y-2">
            <div className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 ${
              userBooking.status === 'confirmed'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : userBooking.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
            }`}>
              <i className={`fi ${
                userBooking.status === 'confirmed' ? 'fi-rr-check-circle' : 'fi-rr-clock'
              }`}></i>
              {userBooking.status === 'confirmed' ? 'Booked' :
               userBooking.status === 'pending' ? 'Booking Pending' : 'Booking ' + userBooking.status}
            </div>
            <p className="text-center text-sm text-gray-600">
              Reference: <span className="font-semibold">{userBooking.bookingReference}</span>
            </p>
          </div>
        ) : (
          <button
            onClick={handleBookNow}
            className="w-full bg-green-900 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <i className="fi fi-rr-ticket"></i>
            Book Now
          </button>
        )}
      </div>

      {/* Booking Bottom Sheet */}
      <BookingBottomSheet
        show={showBookingSheet}
        event={event}
        user={user}
        onClose={() => setShowBookingSheet(false)}
      />
    </div>
  );
}

// Booking Bottom Sheet Component
function BookingBottomSheet({ show, event, user, onClose }) {
  const [bookingType, setBookingType] = useState("ticket");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfTickets: 1,
    businessType: "",
    stallSize: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill form when user data is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  if (!show || !event) return null;

  // Check if field has value from user profile
  const hasProfileData = (field) => {
    if (!user) return false;
    if (field === "name") return !!user.name;
    if (field === "email") return !!user.email;
    if (field === "phone") return !!(user.phone || user.phoneNumber);
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingData = {
        bookingType,
        guestInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        numberOfTickets:
          bookingType === "ticket" ? formData.numberOfTickets : 1,
        totalAmount:
          event.ticketPrice *
          (bookingType === "ticket" ? formData.numberOfTickets : 1),
        stallDetails:
          bookingType === "stall"
            ? {
                businessType: formData.businessType,
                stallSize: formData.stallSize,
              }
            : undefined,
      };

      const response = await eventService.createBooking(
        event.slug,
        bookingData
      );

      // Show success message based on booking status
      const message = response.data.status === 'confirmed'
        ? `Booking confirmed! Your reference: ${response.data.bookingReference}`
        : `Booking submitted successfully! Your reference: ${response.data.bookingReference}. Awaiting approval.`;

      alert(message);
      onClose();
      // Reload page to show updated booking status
      window.location.reload();
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Handle Bar */}
          <div className="sticky top-0 bg-white pt-2 pb-4 px-4 border-b border-gray-200">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Book Your Spot
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <i className="fi fi-rr-cross text-gray-600"></i>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-6">
            {/* Booking Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingType("ticket")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bookingType === "ticket"
                      ? "border-green-900 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <i className="fi fi-rr-ticket text-2xl mb-2"></i>
                  <p className="font-semibold text-sm">Entry Ticket</p>
                  {event.ticketPrice === 0 && (
                    <p className="text-xs text-green-600 mt-1">Free</p>
                  )}
                </button>
                {event.stallsAvailable && (
                  <button
                    type="button"
                    onClick={() => setBookingType("stall")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      bookingType === "stall"
                        ? "border-green-900 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <i className="fi fi-rr-shop text-2xl mb-2"></i>
                    <p className="font-semibold text-sm">Book Stall</p>
                  </button>
                )}
              </div>
            </div>

            {/* Contact Information - Only show fields that need to be filled */}
            <div className="space-y-3">
              {!hasProfileData("name") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {!hasProfileData("email") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {!hasProfileData("phone") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone.replace(/^\+91/, '')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: '+91' + value });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                      placeholder="XXXXX XXXXX"
                      maxLength="10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ticket-specific fields */}
            {bookingType === "ticket" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfTickets}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfTickets: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                />
              </div>
            )}

            {/* Stall-specific fields */}
            {bookingType === "stall" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                    placeholder="e.g., Clothing, Food, Art"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stall Size *
                  </label>
                  <select
                    required
                    value={formData.stallSize}
                    onChange={(e) =>
                      setFormData({ ...formData, stallSize: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 text-sm"
                  >
                    <option value="">Select size</option>
                    <option value="5x5">5x5 ft (Small)</option>
                    <option value="8x5">8x5 ft (Large)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-green-900 to-green-700 text-white rounded-2xl font-bold text-base shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
