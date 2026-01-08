import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Users, 
  User, 
  Plus,
  Info,
  Globe,
  Heart,
  Bell,
  Check,
  ChevronDown,
  Sliders,
  Star,
  Award,
  X,
  Bot,
  UserPlus,
  SkipForward,
  SkipBack,
  Play,
  Pause,
  Rewind,
  FastForward,
} from 'lucide-react';
import BottomNav from '../../components/BottomNav';




const TravelGuidesPage = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("Live Guides");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Guides");
  
  // State for Virtual Guide audio player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [transcript, setTranscript] = useState("");
  const audioRef = useRef(new Audio()); // Use useRef to persist audio element

  // Function to format time for display (MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effect to load transcript when language changes
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const transcriptFileName = selectedLanguage === "english" ? "audio trans script english" : "audio trans script hindi";
        const response = await fetch(`/transcripts/${transcriptFileName}.txt`);
        
        if (!response.ok) {
          throw new Error(`Failed to load transcript for ${selectedLanguage}`);
        }
        const text = await response.text();
        setTranscript(text);
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setTranscript("Transcript not available.");
      }
    };

    fetchTranscript();
  }, [selectedLanguage]);

  // Effect to manage audio source loading and reset on language change
  useEffect(() => {
    const audio = audioRef.current;
    const audioFileName = selectedLanguage === "english" ? "Hawa mahal English audio" : "Hawa mahal hindi audio";
    audio.src = `/audio/${audioFileName}.mp3`;
    audio.load(); // Load the new audio source
    audio.pause(); // Pause audio when language changes
    setIsPlaying(false); // Reset play state
    setCurrentTime(0); // Reset current time
    //setDuration(0); // Reset duration until metadata is loaded for new audio

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', setAudioData);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
    };
  }, [selectedLanguage]); // Only re-run when language changes

  // Effect to manage audio play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0); // Reset to beginning on end
    };

    if (isPlaying) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }

    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnded);

    return () => {
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [isPlaying]); // Only re-run when isPlaying state changes


  // Play/Pause handler
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Seek audio handler
  const handleSeek = (e) => {
    const audio = audioRef.current;
    // Check if duration is valid to prevent NaN
    if (isNaN(duration) || duration === 0) return; 
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
    // If paused, ensure it plays from the new seeked position
    if (!isPlaying) {
      audio.play().catch(e => console.error("Error playing audio after seek:", e));
      setIsPlaying(true);
    }
  };

  // Skip forward/backward handler
  const handleSkip = (seconds) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    setCurrentTime(audio.currentTime);
  };

  // Placeholder for chapter navigation (needs actual chapter data to implement fully)
  const handleNextChapter = () => {
    console.log("Next Chapter (not implemented yet)");
    // Logic to jump to the next chapter's start time
  };

  const handlePrevChapter = () => {
    console.log("Previous Chapter (not implemented yet)");
    // Logic to jump to the previous chapter's start time
  };

  // Virtual Guide UI component
  const VirtualGuideUI = () => {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 shadow">
          {/* Title + Language Dropdown */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Bot size={20} className="mr-2" />
              Virtual Guide
            </h2>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-green-500"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                {/* Add more languages as needed */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Transcript Block */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 h-40 overflow-y-auto text-gray-700 leading-relaxed text-sm">
            {transcript.split('\n').map((line, index) => (
              <p key={index} className="mb-1">
                {line.startsWith('▶') ? <span className="font-semibold text-green-700">{line}</span> : line}
              </p>
            ))}
          </div>

          {/* Timestamp Display */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{formatTime(currentTime)}</span>  <span>{formatTime(duration)}</span>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full bg-gray-200 rounded-full h-2 mb-4 cursor-pointer relative"
            onClick={handleSeek}
          >
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
            <div
              className="w-4 h-4 bg-green-700 rounded-full absolute -top-1 transform -translate-x-1/2 shadow-md"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          {/* Full control row */}
          <div className="flex items-center justify-around">
            <button
              className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={handlePrevChapter}
              title="Previous Chapter"
            >
              <SkipBack size={24} />
            </button>
            <button
              className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => handleSkip(-5)}
              title="Skip backward 5 seconds"
            >
              <Rewind size={24} />
            </button>
            <button
              className="p-4 bg-green-900 text-white rounded-full shadow-lg hover:bg-green-800 transition-colors"
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => handleSkip(5)}
              title="Skip forward 5 seconds"
            >
              <FastForward size={24} />
            </button>
            <button
              className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={handleNextChapter}
              title="Next Chapter"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Mock travel Guide data
  const travelGuides = [
  {
    id: 1,
    name: "Ramesh Kumar",
    location: "Agra, India",
    age: 42,
    experience: 18,
    place: "Taj Mahal",
    languages: ["Hindi", "English"],
    rating: 4,
    reviews: 120,
    certified: true,
    availability: "All Days",
    price: 800,
    description: "Expert Taj Mahal guide with historical insights and photo spots.",
    image: "https://randomuser.me/api/portraits/men/34.jpg",
    badges: ["ASI Certified", "Highly Rated", "Photogenic Spots"]
  },
  {
    id: 2,
    name: "Meena Sharma",
    location: "Jaipur, India",
    age: 37,
    experience: 12,
    place: "Hawa Mahal",
    languages: ["Hindi", "English", "French"],
    rating: 3.5,
    reviews: 86,
    certified: true,
    availability: "Mon–Sat",
    price: 600,
    description: "Friendly and detail-oriented guide for Hawa Mahal tours.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    badges: ["Cultural Expert", "Local Guide", "Top Rated"]
  }
];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} size={16} className="text-yellow-500" fill="currentColor" />);
      } else if (rating >= i - 0.5) {
        stars.push(<Star key={i} size={16} className="text-yellow-500" fill="currentColor" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }
    return stars;
  };


  // Available filter categories
  const filterCategories = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];

  // Handler for showing Guide details
  const handleShowGuideDetails = (Guide) => {
    setSelectedGuide(Guide);
    setShowDetails(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => {
      setSelectedGuide(null);
    }, 300);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-28 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-green-800 text-white p-6 pt-10 rounded-b-3xl shadow-md relative">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Travel Guides</h1>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full relative">
            <Info size={20} />
            {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span> */}
          </button>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            className="w-full bg-white/20 backdrop-blur-sm text-white border-none rounded-xl p-4 pl-12 pr-12 placeholder-white/70"
            placeholder="Find a Destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">
            <Search size={18} />
          </div>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">
            <Sliders size={18} />
          </button>
        </div>

        {/* View toggle */}
        <div className="bg-white/20 backdrop-blur-sm p-1 rounded-xl flex mb-5">
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center font-medium text-sm ${
              activeView === "Live Guides" 
                ? "bg-white text-green-900" 
                : "text-white"
            }`}
            onClick={() => setActiveView("Live Guides")}
          >
            <User size={16} className="mr-2" />
            Live Guides
          </button>
          <button
            className={`flex-1 py-2 rounded-lg flex items-center justify-center font-medium text-sm ${
              activeView === "Virtual Guide" 
                ? "bg-white text-green-900" 
                : "text-white"
            }`}
            onClick={() => setActiveView("Virtual Guide")}
          >
            <Bot size={16} className="mr-2" />
            Virtual Guide
          </button>
        </div>
      </div>

      {/* Main content */}
      {activeView === "Live Guides" && (
        <div className="p-4 pt-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              {filter === "All" ? "Recommended Guides" : `Guides in ${filter}`}
              <span className="text-sm font-normal text-gray-500 ml-1">({travelGuides.length})</span>
            </h2>
            <button className="text-sm font-medium text-green-900 flex items-center">
              Sort by Rating
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          
          {travelGuides.map(guide => (
            <div 
              key={guide.id}
              className="bg-white rounded-2xl shadow-sm mb-5 overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                {/* Header with profile pic and name */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden mr-3 border-2 border-white shadow-sm">
                        <img 
                          src={guide.image} 
                          alt={guide.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white font-bold">
                        {guide.age}
                      </div>
                      {guide.verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{guide.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span>{guide.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-full px-3 py-1 text-yellow-700 font-semibold text-sm flex items-center">
                    <div className="flex items-center space-x-1">
                      {renderStars(guide.rating)}
                      <span className="ml-2 text-sm text-gray-600">{guide.rating}</span>
                    </div>
                  </div>

                </div>
                
                {/* Trip details */}
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <MapPin size={16} className="text-green-900" />
                      </div>
                      <span>{guide.place}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Award size={16} className="text-green-900" />
                      </div>
                      <span>{guide.experience} years of experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <User size={16} className="text-green-900" />
                      </div>
                      <span>Rs. {guide.price} per trip</span>
                    </div>
                  </div>
                </div>

                
                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {guide.description}
                </p>
                
                {/* Badges */}
                {guide.badges && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.badges.map(badge => (
                        <div 
                          key={badge} 
                          className="flex items-center bg-green-50 rounded-full px-3 py-1.5 border border-green-100"
                        >
                          <Award size={12} className="mr-1 text-green-900" />
                          <span className="text-xs font-medium text-green-900">{badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button 
                    className="flex-1 bg-green-900 text-white py-3 rounded-xl font-medium flex items-center justify-center"
                    onClick={() => handleShowGuideDetails(guide)}
                  >
                    <UserPlus size={18} className="mr-2" />
                      Book Now
                    <span className="ml-2 text-sm font-normal text-white/80">
                      Rs. {guide.price}
                    </span>
                  </button>
                  <button className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Heart size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === "Virtual Guide" && (
        <VirtualGuideUI />
      )}
      {/* Bottom Navigation (simulated) */}
      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />

      {/* Guide Details Modal */}
      {showDetails && selectedGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header bar with close button */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Travel Guide Profile</h3>
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
                      src={selectedGuide.image} 
                      alt={selectedGuide.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedGuide.verified && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full text-white text-xs w-6 h-6 flex items-center justify-center border-2 border-white">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-800">{selectedGuide.name}</h2>
                    <span className="ml-2 text-gray-500 text-sm">{selectedGuide.age}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{selectedGuide.location}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center bg-green-50 rounded-full px-3 py-1 text-green-900 text-xs font-semibold">
                      <span>{selectedGuide.matchPercentage}% match</span>
                    </div>
                    {selectedGuide.reviews && (
                      <div className="flex items-center ml-2 text-gray-500 text-xs">
                        <Star size={12} className="mr-1 text-yellow-500" />
                        <span>{selectedGuide.reviews} reviews</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Badges */}
              {selectedGuide.badges && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedGuide.badges.map(badge => (
                    <div 
                      key={badge} 
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <Award size={12} className="mr-1 text-green-900" />
                      <span className="text-xs font-medium text-gray-700">{badge}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* About section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">About Me</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedGuide.about || selectedGuide.description}
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
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelGuidesPage;
