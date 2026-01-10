import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BannerManagement() {
  const [bannerImage, setBannerImage] = useState('/banner.jpg');
  const [uploading, setUploading] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [bannerLink, setBannerLink] = useState('/events/padharo-mhare-fest');
  const [brochureUrl, setBrochureUrl] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('banner', file);

      const token = localStorage.getItem('token');
      const response = await fetch('https://zenz-backend.onrender.com/api/admin/upload/banner', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setBannerImage(data.bannerUrl);
      alert('Banner uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload banner');
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLink = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://zenz-backend.onrender.com/api/admin/banner/link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ link: bannerLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update link');
      }

      alert('Banner link updated successfully!');
    } catch (error) {
      console.error('Error updating link:', error);
      alert(error.message || 'Failed to update banner link');
    }
  };

  const handleBrochureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('PDF size should be less than 10MB');
      return;
    }

    try {
      setUploadingBrochure(true);

      const formData = new FormData();
      formData.append('brochure', file);

      const token = localStorage.getItem('token');
      const response = await fetch('https://zenz-backend.onrender.com/api/admin/upload/brochure', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setBrochureUrl(data.brochureUrl);
      alert('Brochure uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload brochure');
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleRemoveBanner = () => {
    if (window.confirm('Are you sure you want to remove the current banner?')) {
      setBannerImage('/banner.jpg');
      setPreviewImage(null);
      alert('Banner removed. Default banner will be shown.');
    }
  };

  const handleRemoveBrochure = () => {
    if (window.confirm('Are you sure you want to remove the brochure?')) {
      setBrochureUrl('');
      alert('Brochure removed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage the home page banner image and link</p>
        </div>
      </div>

      {/* Current Banner Preview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Banner</h2>
        <div className="relative">
          <div
            className="w-full h-64 rounded-2xl bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${previewImage || bannerImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold text-lg">Home Page Banner</p>
              <p className="text-white/80 text-sm">Click to navigate to: {bannerLink}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload New Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Banner</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div
                  className={`w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-green-900 hover:bg-green-50 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fi fi-rr-cloud-upload text-3xl text-gray-400 mb-2"></i>
                      <p className="text-gray-600 font-medium">Click to upload banner</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB (Recommended: 1200x400px)
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {previewImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-green-700">
                <i className="fi fi-rr-check-circle"></i>
                <p className="font-medium">New banner ready to display!</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Event Brochure Upload */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Event Brochure</h2>
        <div className="space-y-4">
          {brochureUrl && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fi fi-rr-file-pdf text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Brochure Uploaded</p>
                    <a
                      href={brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
                <button
                  onClick={handleRemoveBrochure}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Brochure PDF
            </label>
            <label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleBrochureUpload}
                disabled={uploadingBrochure}
                className="hidden"
              />
              <div
                className={`w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-green-900 hover:bg-green-50 transition-colors ${
                  uploadingBrochure ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingBrochure ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-green-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <i className="fi fi-rr-cloud-upload text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600 font-medium">Click to upload event brochure</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Banner Link Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Banner Click Action</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Redirect URL/Path
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="/events/event-slug"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900"
              />
              <button
                onClick={handleSaveLink}
                className="px-6 py-3 bg-green-900 text-white rounded-xl hover:bg-green-800 font-semibold flex items-center gap-2 transition-colors"
              >
                <i className="fi fi-rr-check"></i>
                Save Link
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter the path where users should be redirected when they click the banner
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-3">
          <button
            onClick={handleRemoveBanner}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold flex items-center gap-2 transition-colors"
          >
            <i className="fi fi-rr-trash"></i>
            Remove Banner
          </button>
          {brochureUrl && (
            <button
              onClick={handleRemoveBrochure}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold flex items-center gap-2 transition-colors"
            >
              <i className="fi fi-rr-trash"></i>
              Remove Brochure
            </button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <i className="fi fi-rr-bulb"></i>
          Tips for Best Results
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <i className="fi fi-rr-check text-blue-600 mt-0.5"></i>
            <span>Use high-quality images with 1200x400px resolution for best display</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fi fi-rr-check text-blue-600 mt-0.5"></i>
            <span>Ensure important content is centered as edges may be cropped on mobile</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fi fi-rr-check text-blue-600 mt-0.5"></i>
            <span>Compress images before uploading to improve page load speed</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fi fi-rr-check text-blue-600 mt-0.5"></i>
            <span>Test the banner link to ensure it redirects to the correct page</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
