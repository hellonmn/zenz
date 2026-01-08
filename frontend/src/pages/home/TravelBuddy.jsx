import React, { useState } from "react";
import {
  ChevronLeft,
  Search,
  Filter,
  MessageCircle,
  MapPin,
  Calendar,
  Users,
  Plus,
  Globe,
  Heart,
  Bell,
  Check,
  ChevronDown,
  Sliders,
  Star,
  Award,
  X,
  UserPlus,
} from "lucide-react";
import BottomNav from "../../components/BottomNav";

const EnhancedTravelBuddyPreview = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("discover");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Explore");

  // Mock travel buddy data
  const travelBuddies = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "New York, USA",
      age: 28,
      destination: "Bali, Indonesia",
      dates: "Jun 15 - Jul 2, 2025",
      interests: ["Hiking", "Photography", "Local Food"],
      groupSize: 3,
      budget: "1000-1500",
      matchPercentage: 92,
      languages: ["English", "Spanish"],
      verified: true,
      responseRate: "98%",
      reviews: 12,
      tripCount: 8,
      about:
        "Travel enthusiast with a passion for adventure. Love exploring new cultures and trying local foods. I'm a photographer, so I'm always on the lookout for the perfect shot!",
      image:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
      description:
        "Hey there! I'm planning a trip to Bali and looking for travel buddies who love outdoor adventures and experiencing local culture.",
      photos: [
        "/api/placeholder/300/200",
        "/api/placeholder/300/200",
        "/api/placeholder/300/200",
      ],
      badges: ["Adventurer", "Foodie", "Photographer"],
    },
    {
      id: 2,
      name: "David Chang",
      location: "San Francisco, USA",
      age: 32,
      destination: "Tokyo, Japan",
      dates: "Aug 10 - Aug 25, 2025",
      interests: ["Street Food", "City Exploration", "Nightlife"],
      groupSize: 2,
      matchPercentage: 85,
      verified: true,
      image:
        "https://t3.ftcdn.net/jpg/02/00/90/24/360_F_200902415_G4eZ9Ok3Ypd4SZZKjc8nqJyFVp1eOD6V.jpg",
      description:
        "Looking for someone to explore Tokyo with! I'm a foodie and want to check out the best restaurants, cool neighborhoods, and nightlife spots.",
    },
  ];

  // Available filter categories
  const filterCategories = [
    "All",
    "Asia",
    "Europe",
    "Americas",
    "Africa",
    "Oceania",
  ];

  // Handler for showing buddy details
  const handleShowBuddyDetails = (buddy) => {
    setSelectedBuddy(buddy);
    setShowDetails(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedBuddy(null);
    }, 300);
  };

  return (
    <div className="bg-white min-h-screen pb-28 relative">
      {/* Header */}
      <div className="bg-white text-gray-900 p-6 pt-5 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Explore & Find <br /> your travel partner
          </h1>
          <button className="p-3 bg-white backdrop-blur-sm shadow-xl shadow-gray-300 border border-gray-100 rounded-full relative">
            <i className="fi fi-rr-search"></i>
          </button>
        </div>

        {/* Search bar */}
        {/* <div className="relative mb-6">
          <input
            className="w-full bg-white/20 backdrop-blur-sm text-black border-none rounded-xl p-4 pl-12 pr-12 placeholder-white/70"
            placeholder="Find a travel buddy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">
            <Search size={18} />
          </div>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
            <Sliders size={18} />
          </button>
        </div> */}


        {/* Filter tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar w-full">
          {filterCategories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap text-sm transition-all ${
                filter === category
                  ? "bg-green-700 text-white font-medium shadow-xl shadow-green-100"
                  : "bg-white border border-gray-100 text-gray-400"
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="border-t border-gray-100">
        <div className="flex flex-col justify-between p-4 mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            {filter === "All"
              ? "Recommended Matches"
              : `Travel buddies in ${filter}`}
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({travelBuddies.length})
            </span>
          </h2>
          <div className="flex">
            <button className="text-sm bg-gray-100 p-2 w-fit rounded-xl font-medium text-green-900 flex items-center">
              Sort by Match
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
        </div>

        {travelBuddies.map((buddy) => (
          <div
            key={buddy.id}
            className="bg-white overflow-hidden border-b border-gray-100"
          >
            <div className="px-3 pt-3 pb-0">
              {/* Header with profile pic and name */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex" onClick={() => handleShowBuddyDetails(buddy)}>
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden mr-3 border-2 border-white shadow-sm">
                        <img
                          src={buddy.image}
                          alt={buddy.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white font-bold">
                      {buddy.age}
                    </div> */}
                      {buddy.verified && (
                        <div className="absolute -top-1 right-2 bg-blue-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white">
                          <i className="fi fi-rr-check"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-md">
                        {buddy.name}
                      </h3>
                      <div className="flex items-center text-gray-500 text-xs">
                        <MapPin size={14} className="mr-1" />
                        <span>{buddy.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-green-900 font-semibold text-sm flex items-center gap-1 h-full justify-center">
                    {/* <span>{buddy.matchPercentage}%</span>
                  <span className="ml-1 text-xs text-green-700">match</span> */}
                    <button
                      className="flex-1 bg-white border border-gray-100 text-gray-500 size-8 rounded-xl font-medium flex items-center justify-center"
                      onClick={() => handleShowBuddyDetails(buddy)}
                    >
                      <i className="fi fi-rr-heart"></i>
                    </button>
                    <button
                      className="flex-1 bg-white border border-gray-100 text-gray-500 size-8 rounded-xl font-medium flex items-center justify-center"
                      onClick={() => handleShowBuddyDetails(buddy)}
                    >
                      <i className="fi fi-rr-user-add"></i>
                    </button>
                  </div>
                </div>
              </div>

              

              {/* Action buttons */}
              {/* <div className="flex gap-3">
                <button 
                  className="flex-1 bg-green-900 text-white py-3 rounded-xl font-medium flex items-center justify-center"
                  onClick={() => handleShowBuddyDetails(buddy)}
                >
                  <UserPlus size={18} className="mr-2" />
                  Connect
                </button>
                <button className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="text-gray-500" />
                </button>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Floating action button */}
      {/* <div className="fixed right-6 bottom-20">
        <button className="w-16 h-16 bg-green-900 rounded-full shadow-lg flex items-center justify-center">
          <Plus size={24} className="text-white" />
        </button>
      </div> */}

      {/* Bottom Navigation (simulated) */}
      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />

      {/* Buddy Details Modal */}
      {showDetails && selectedBuddy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header bar with close button */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                Travel Buddy Profile
              </h3>
              <button
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                onClick={handleCloseDetails}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-5">
              {/* Profile header */}
              <div className="flex items-center mb-5">
                <div className="relative mr-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-sm">
                    <img
                      src={selectedBuddy.image}
                      alt={selectedBuddy.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedBuddy.verified && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedBuddy.name}
                    </h2>
                    <span className="ml-2 text-gray-500 text-sm">
                      {selectedBuddy.age}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{selectedBuddy.location}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center bg-green-50 rounded-full px-3 py-1 text-green-900 text-xs font-semibold">
                      <span>{selectedBuddy.matchPercentage}% match</span>
                    </div>
                    {selectedBuddy.reviews && (
                      <div className="flex items-center ml-2 text-gray-500 text-xs">
                        <Star size={12} className="mr-1 text-yellow-500" />
                        <span>{selectedBuddy.reviews} reviews</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges */}
              {selectedBuddy.badges && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedBuddy.badges.map((badge) => (
                    <div
                      key={badge}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <Award size={12} className="mr-1 text-green-900" />
                      <span className="text-xs font-medium text-gray-700">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Trip details */}
              <div className="mb-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center text-gray-800 font-medium mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <MapPin size={16} className="text-green-900" />
                    </div>
                    <span>{selectedBuddy.destination}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Calendar size={16} className="text-green-900" />
                    </div>
                    <span>{selectedBuddy.dates}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Users size={16} className="text-green-900" />
                    </div>
                    <span>Looking for {selectedBuddy.groupSize} travel {selectedBuddy.groupSize === 1 ? 'buddy' : 'buddies'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {selectedBuddy.description}
              </p>

              {/* Interests */}
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBuddy.interests.map(interest => (
                    <span 
                      key={interest} 
                      className="bg-green-50 text-green-900 text-xs px-3 py-1.5 rounded-full border border-green-100"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* About section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  About Me
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedBuddy.about || selectedBuddy.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
                  onClick={handleCloseDetails}
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-green-900 text-white rounded-xl font-medium flex items-center justify-center">
                  <UserPlus size={18} className="mr-2" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTravelBuddyPreview;
