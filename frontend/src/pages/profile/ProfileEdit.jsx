import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  Calendar,
  User,
  Globe,
  MessageCircle,
  Instagram,
  Phone,
  Plus,
  X
} from "lucide-react";
import { useState } from "react";

export default function ProfileEdit() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "Naman Jangir",
    username: "naman_jangir",
    birthYear: "1995",
    homeCity: "Jhunjhunu",
    homeCountry: "India",
    currentLocation: "Jaipur, Rajasthan",
    bio: "Travel enthusiast | Developer | Adventure seeker",
    languages: ["English", "Hindi"],
    socialHandles: {
      instagram: "@naman_travels",
      whatsapp: "+91 98765 43210"
    },
    profileImage: "https://media.istockphoto.com/id/1300972574/photo/millennial-male-team-leader-organize-virtual-workshop-with-employees-online.jpg?s=612x612&w=0&k=20&c=uP9rKidKETywVil0dbvg_vAKyv2wjXMwWJDNPHzc_Ug=",
    coverImage: "https://media.istockphoto.com/id/1368262606/photo/traveler-backpacker-asian-woman-travel-in-bangkok-thailand-beautiful-female-enjoying-with.jpg?s=612x612&w=0&k=20&c=38oPUSGcSzhLCqVMscJQduuIeZxTQjpTNY7E4Gy7x_c="
  });

  const [newLanguage, setNewLanguage] = useState("");
  const [showLanguageInput, setShowLanguageInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
      setShowLanguageInput(false);
    }
  };

  const removeLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleImageChange = (field, file) => {
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [field]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setIsSaving(false);
      return;
    }
    let profileImageUrl = formData.profileImage;
    if (profileImageFile) {
      const imgData = new FormData();
      imgData.append('profileImage', profileImageFile);
      try {
        const uploadRes = await fetch("http://localhost:5000/api/auth/profile/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imgData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.message || "Failed to upload image");
          setIsSaving(false);
          return;
        }
        profileImageUrl = uploadData.profileImage;
      } catch (err) {
        setError("Image upload failed");
        setIsSaving(false);
        return;
      }
    }
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          location: formData.currentLocation,
          profileImage: profileImageUrl,
          coverImage: formData.coverImage
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to update profile");
        setIsSaving(false);
        return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/profile");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsSaving(false);
    }
    setIsSaving(false);
  };

  const backendUrl = "http://localhost:5000";
  const getImageUrl = (url) => url?.startsWith('http') ? url : backendUrl + url;

  return (
    <motion.div 
      className="pb-8 bg-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate("/profile")}
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Edit Profile</h1>
          <button 
            className="px-4 py-2 bg-green-900 text-white rounded-full font-medium text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      <div className="relative bg-white">
        <div className="h-32 w-full bg-green-900 relative">
          <img 
            src={formData.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <button className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white">
            <Camera size={16} />
          </button>
        </div>
        
        {/* Profile image upload */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200">
              <img 
                src={getImageUrl(formData.profileImage)} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-green-900 rounded-full text-white shadow cursor-pointer">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageChange('profileImage', e.target.files[0])} />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-16 px-4 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User size={20} className="mr-2 text-green-900" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Year</label>
              <input
                type="number"
                value={formData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="YYYY"
                min="1900"
                max="2010"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent h-20 resize-none"
                placeholder="Tell us about yourself..."
                maxLength="150"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/150 characters</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-green-900" />
            Location Details
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home City</label>
                <input
                  type="text"
                  value={formData.homeCity}
                  onChange={(e) => handleInputChange('homeCity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.homeCountry}
                  onChange={(e) => handleInputChange('homeCountry', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                  placeholder="Your country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currently Traveling To</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="Where are you traveling now?"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe size={20} className="mr-2 text-green-900" />
            Languages Spoken
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.languages.map((language, index) => (
              <span 
                key={index}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {language}
                <button 
                  onClick={() => removeLanguage(language)}
                  className="ml-2 text-green-600 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {showLanguageInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="Enter language"
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              />
              <button 
                onClick={addLanguage}
                className="px-4 py-2 bg-green-900 text-white rounded-lg text-sm"
              >
                Add
              </button>
              <button 
                onClick={() => {
                  setShowLanguageInput(false);
                  setNewLanguage("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLanguageInput(true)}
              className="flex items-center text-green-900 font-medium text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Language
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MessageCircle size={20} className="mr-2 text-green-900" />
            Social Handles <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Instagram size={16} className="mr-2 text-pink-600" />
                Instagram
              </label>
              <input
                type="text"
                value={formData.socialHandles.instagram}
                onChange={(e) => handleInputChange('socialHandles.instagram', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="@your_username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone size={16} className="mr-2 text-green-600" />
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.socialHandles.whatsapp}
                onChange={(e) => handleInputChange('socialHandles.whatsapp', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Show error if any */}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}

        <div className="pt-4">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-green-900 text-white rounded-xl font-semibold text-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
}