import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import locationService from "../services/locationService";
import LocationSheet from "./LocationSheet";

export default function Header({ onLocationChange }) {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);

        // Get profile image URL
        const userProfileImage = currentUser.user?.profileImage || currentUser.profileImage;
        if (userProfileImage) {
          const backendUrl = "https://zenz-backend.onrender.com";
          const imageUrl = userProfileImage.startsWith('http')
            ? userProfileImage
            : `${backendUrl}${userProfileImage}`;
          setProfileImage(imageUrl);
        }
      }
    };

    loadUserData();

    // Listen for storage changes (when user logs in/out or updates profile)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load saved location or detect automatically
  useEffect(() => {
    const loadLocation = async () => {
      const savedLocation = locationService.getSavedLocation();

      if (savedLocation) {
        setLocation(savedLocation);
        onLocationChange?.(savedLocation);
      } else {
        // Auto-detect location on first load
        try {
          const detected = await locationService.getLocationByIP();
          setLocation(detected);
          locationService.saveLocation(detected);
          onLocationChange?.(detected);
        } catch (error) {
          const defaultLocation = {
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            countryCode: 'IN',
            displayName: 'Delhi'
          };
          setLocation(defaultLocation);
          onLocationChange?.(defaultLocation);
        }
      }
    };

    loadLocation();
  }, []);

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    onLocationChange?.(newLocation);
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-[#f7f8fa]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLocationSheet(true)}
            className="text-left hover:bg-gray-100 rounded-lg px-2 py-1 -ml-2 transition"
          >
            <div className="text-xs text-gray-500">Location</div>
            <div className="flex items-center gap-1 text-base font-semibold text-gray-900">
              <i className="fi fi-rr-marker text-green-900 text-sm"></i>
              {location?.city || 'Delhi'} <span className="text-gray-900 text-xs">▼</span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
            <i className="fi fi-rr-bell text-gray-500 text-xl"></i>
            {/* Optionally add a notification dot */}
          </button>
          <Link to="/profile">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="size-10 rounded-full object-cover border-2 border-green-900 shadow-md hover:shadow-lg transition"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="size-10 rounded-full bg-green-900 flex items-center justify-center border-2 border-green-900 shadow-md hover:shadow-lg transition"
              style={{ display: profileImage ? 'none' : 'flex' }}
            >
              <i className="fi fi-rr-user text-white text-lg"></i>
            </div>
          </Link>
        </div>
      </div>

      {/* Location Sheet */}
      <LocationSheet
        open={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        onLocationChange={handleLocationChange}
      />
    </>
  );
}
  