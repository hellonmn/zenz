import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, LogIn } from "lucide-react";

const navLinks = [
  { label: "Home", icon: "house-crack", path: "/" },
  { label: "Explore", icon: "space-station-moon", path: "/buddy" },
  { label: "Likes", icon: "heart", path: "/likes" },
  { label: "My Bookings", icon: "apps", path: "/myBookings" },
  { label: "Profile", icon: "user", path: "/profile" },
];

export default function BottomNav({ selected, onSelect }) {
  const navigate = useNavigate();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Check authentication status
const checkAuthStatus = async () => {
  setCheckingAuth(true);
  const token = localStorage.getItem("token");
  
  if (!token) {
    setIsLoggedIn(false);
    setCheckingAuth(false);
    return false; // Return the result
  }

  try {
    const response = await fetch("https://zenz-backend.onrender.com/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const loggedIn = response.ok;
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      localStorage.removeItem("token");
    }
    setCheckingAuth(false);
    return loggedIn; // Return the result
  } catch (error) {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    setCheckingAuth(false);
    return false; // Return the result
  }
};

const handleNavClick = async (link) => {
  if (link.label === "Profile") {
    const authenticated = await checkAuthStatus();
    
    if (authenticated) {
      onSelect(link.label);
      navigate(link.path);
    } else {
      setShowBottomSheet(true);
    }
  } else {
    onSelect(link.label);
    navigate(link.path);
  }
};

  const handleAuthNavigation = (path) => {
    setShowBottomSheet(false);
    navigate(path);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full z-50">
        <div className="flex items-center justify-between bg-white rounded-t-3xl shadow-lg px-2 py-2 max-w-md mx-auto border-t border-gray-100">
          {navLinks.map((link) => {
            const isActive = selected === link.label;
            const iconClass = `fi ${isActive ? "fi-sr-" : "fi-rr-"}${link.icon}`;
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                disabled={link.label === "Profile" && checkingAuth}
                className="flex flex-col items-center flex-1 py-1 focus:outline-none disabled:opacity-50"
              >
                <span 
                  className={`text-xl mb-0.5 ${isActive ? "" : "text-gray-400"}`}
                  style={isActive ? { color: '#1f3121' } : {}}
                >
                  {link.label === "Profile" && checkingAuth ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className={iconClass}></i>
                  )}
                </span>
                <span className={`text-xs mt-0.5 ${isActive ? "font-bold text-gray-900" : "text-gray-500"}`}>
                  {link.label}
                </span>
                {/* Reserve space for the dot to prevent layout shift */}
                <span className="h-2 flex items-center justify-center mt-1">
                  {isActive ? (
                    <span 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#1f3121' }}
                    ></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full invisible"></span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showBottomSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-[#0000006e] bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBottomSheet}
            />
            
            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-6 py-6 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Handle bar */}
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              {/* Close button */}
              <button
                onClick={closeBottomSheet}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={24} className="text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Access Your Profile
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Please login or sign up to view and manage your profile
                </p>

                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAuthNavigation("/login")}
                    className="w-full py-4 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                    style={{ backgroundColor: '#1f3121' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0f1910'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1f3121'}
                  >
                    <LogIn size={20} />
                    <span>Login to Your Account</span>
                  </button>
                  
                  <button
                    onClick={() => handleAuthNavigation("/register")}
                    className="w-full py-4 rounded-xl font-semibold transition-colors"
                    style={{ 
                      backgroundColor: '#e8f0e9', 
                      color: '#1f3121' 
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#d4e5d6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e8f0e9'}
                  >
                    Create New Account
                  </button>
                </div>

                {/* Footer text */}
                <p className="text-xs text-gray-500 mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}