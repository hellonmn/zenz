import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = authService.getCurrentUser();

  // Check if user is admin
  const isAdmin = user?.user?.role === 'admin' || user?.role === 'admin';

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <i className="fi fi-rr-lock text-6xl text-red-500 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-800"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: 'fi-rr-dashboard', label: 'Dashboard', exact: true },
    { path: '/admin/trips', icon: 'fi-rr-map-marker', label: 'Trips' },
    { path: '/admin/bookings', icon: 'fi-rr-calendar', label: 'Bookings' },
    { path: '/admin/users', icon: 'fi-rr-users', label: 'Users' },
    { path: '/admin/categories', icon: 'fi-rr-apps', label: 'Categories' },
    { path: '/admin/analytics', icon: 'fi-rr-chart-line', label: 'Analytics' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <h1 className="text-2xl font-bold text-green-900">Zenz Admin</h1>
            ) : (
              <i className="fi fi-rr-settings text-2xl text-green-900 mx-auto"></i>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className={`fi ${sidebarOpen ? 'fi-rr-angle-left' : 'fi-rr-angle-right'} text-gray-600`}></i>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-green-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center text-white">
              <i className="fi fi-rr-user"></i>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{user?.user?.name || user?.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Link
              to="/"
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              <i className="fi fi-rr-home"></i>
              <span>Back to Site</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navItems.find((item) => isActive(item.path, item.exact))?.label || 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage your travel platform</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <i className="fi fi-rr-bell text-gray-600 text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/profile"
                className="px-4 py-2 bg-green-900 text-white rounded-lg font-semibold hover:bg-green-800"
              >
                Profile
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
