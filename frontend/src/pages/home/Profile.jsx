// pages/home/Profile.jsx
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Settings, Camera, Edit, MapPin, Calendar } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import { useState, useEffect } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const [selectedNav, setSelectedNav] = useState("Profile");
  const [activeTab, setActiveTab] = useState("Saved");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    fetch("http://localhost:5000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await res.json();
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load profile. Please login again.");
        setUser(null);
        setLoading(false);
      });
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

  const backendUrl = "http://localhost:5000";
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
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
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
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
              <img 
                src={getImageUrl(user.profileImage)} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-green-900 rounded-full text-white shadow">
              <Camera size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
        <div className="flex items-center justify-center mt-1 text-gray-600">
          <MapPin size={16} className="mr-1" />
          <span>{user.location}</span>
        </div>
        <p className="mt-2 text-gray-700">{user.bio}</p>
        <div className="text-gray-500 text-sm mt-1">{user.joinDate}</div>
        
        <Link to="edit" className="w-fit mt-4 px-6 py-2 bg-green-900 text-white rounded-full font-medium flex items-center mx-auto">
          <Edit size={16} className="mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="flex justify-center mt-6 px-4">
        <div className="flex space-x-8">
          <div className="text-center">
            <p className="font-bold text-gray-800">{user.tripCount}</p>
            <p className="text-gray-600 text-sm">Trips</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800">{user.photoCount}</p>
            <p className="text-gray-600 text-sm">Photos</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800">{user.followerCount}</p>
            <p className="text-gray-600 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800">{user.followingCount}</p>
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

      {/* Saved trips */}
      {activeTab === "Saved" && (
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Saved Trips</h2>
            <button className="text-green-900 font-medium text-sm">See All</button>
          </div>

          {(user.savedTrips || []).map(trip => (
            <div 
              key={trip.id} 
              className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
              onClick={() => navigate("/details")}
            >
              <div className="flex">
                <div className="w-1/3 h-24">
                  <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                </div>
                <div className="w-2/3 p-3">
                  <h3 className="font-semibold text-gray-800">{trip.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{trip.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Photos tab content */}
      {activeTab === "Photos" && (
        <div className="mt-4 px-4">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={i % 2 === 0 
                    ? "https://media.istockphoto.com/id/478627080/photo/evening-view-of-ama-dablam.jpg?s=612x612&w=0&k=20&c=GLKvtQt1JVoOB4yR2WI86_fYOmG8WObeZP_QV_gFG_0=" 
                    : "https://media.istockphoto.com/id/1453838542/photo/last-light-on-mount-sneffels.jpg?s=612x612&w=0&k=20&c=IBOZYpAjhV5hFEL8yKYmY2ZCyCaGEOrXR5VZI13NMRI="
                  } 
                  alt={`Photo ${i}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Trips tab content */}
      {activeTab === "Trips" && (
        <div className="mt-4 px-4 text-center py-8">
          <p className="text-gray-600">Your past and upcoming trips will appear here</p>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav selected={selectedNav} onSelect={setSelectedNav} />
    </motion.div>
  );
}