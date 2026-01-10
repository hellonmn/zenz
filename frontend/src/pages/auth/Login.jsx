import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  MapPin,
  Plane,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoImage from "../../assets/logo.jpg";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get redirect info from location state
  const redirectTo = location.state?.from || '/';
  const tripId = location.state?.tripId;
  const bookTrip = location.state?.bookTrip;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("https://zenz-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }
      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      // Check if there's a redirect after login stored (for event booking)
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');

      if (redirectAfterLogin) {
        // Navigate to the stored redirect path (event page)
        navigate(redirectAfterLogin);
        return;
      }

      // If user was trying to book a trip, store the intent
      if (tripId && bookTrip) {
        sessionStorage.setItem('bookTripIntent', JSON.stringify({ tripId, bookTrip: true }));
        navigate(`/trip/${tripId}`);
      } else {
        // Redirect to the page they came from or home
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    console.log("Navigate to forgot password");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* <img 
            src="https://media.istockphoto.com/id/1933790728/photo/young-female-tourist-enjoying-the-beautiful-landscape-at-padar-island-in-komodo-national-park.jpg?s=2048x2048&w=is&k=20&c=BYZ_IStEP4m0uZbbypyf25Win-QL1ZhazwHnaOor9eo=" 
            alt="Travel Background" 
            className="w-full h-full object-cover"
          /> */}
        </div>

        {/* Back Button */}
        <div className="absolute top-8 left-4 z-20">
          <button
            onClick={handleGoBack}
            className="p-2 bg-white bg-opacity-20 rounded-full text-black hover:bg-opacity-30 transition-all"
          >
            <i class="fi fi-rr-angle-small-left"></i>
          </button>
        </div>
        
        <div className="mt-16 relative z-10 flex flex-col items-center justify-center h-fit px-6 text-center text-white">
          <div className="">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="p-[2px] bg-white bg-opacity-20 rounded-3xl">
                <img src={logoImage} alt="" className="size-16 rounded-xl" />
              </div>
              <div className="mb-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to continue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 py-8 rounded-t-3xl px-6 pb-8 shadow-2xl">
        

        <div className="flex flex-col gap-6">
          {bookTrip && tripId && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl mb-2 text-sm">
              <div className="flex items-start gap-2">
                <i className="fi fi-rr-info text-blue-600 mt-0.5"></i>
                <div>
                  <p className="font-semibold mb-1">Login Required</p>
                  <p>Please login to continue booking this trip.</p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-green-900 hover:text-green-700 font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-green-900 text-white py-3 rounded-xl font-semibold text-lg flex items-center justify-center transition-all hover:bg-green-800 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-900 hover:text-green-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}