import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "../../services/authService";

export default function ProfileEdit() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: ""
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);

  // Load current user data
  useEffect(() => {
    const loadProfile = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        const userData = await authService.getProfile();
        setFormData({
          name: userData.name || '',
          location: userData.location || '',
          bio: userData.bio || ''
        });
        setCurrentProfileImage(userData.profileImage);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      let profileImageUrl = currentProfileImage;

      // Upload profile image if changed
      if (profileImageFile) {
        try {
          const uploadData = await authService.uploadProfileImage(profileImageFile);
          profileImageUrl = uploadData.profileImage;
        } catch (err) {
          setError("Image upload failed");
          setIsSaving(false);
          return;
        }
      }

      // Update profile
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        profileImage: profileImageUrl
      };

      const updatedData = await authService.updateProfile(updateData);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedData));

      // Trigger storage event for Header to update
      window.dispatchEvent(new Event('storage'));

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const backendUrl = "https://zenz-backend.onrender.com";
  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${backendUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayImage = profileImagePreview || getImageUrl(currentProfileImage);

  return (
    <motion.div
      className="pb-8 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate("/profile")}
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Edit Profile</h1>
          <button
            className="px-4 py-2 bg-green-900 text-white rounded-full font-medium text-sm disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-check-circle text-green-600"></i>
            <p className="text-green-800 font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-cross-circle text-red-600"></i>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Profile Image Section */}
      <div className="bg-white mt-4 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-900 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-green-900 rounded-full text-white shadow cursor-pointer hover:bg-green-800 transition">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Upload a profile photo. Recommended size: 400x400px
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white mt-4 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Jaipur, Rajasthan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Save Button (Mobile) */}
      <div className="px-4 mt-6">
        <button
          className="w-full py-4 bg-green-900 text-white rounded-xl font-semibold text-lg disabled:opacity-50"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}
