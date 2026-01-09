import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeTrips: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [tripsRes, bookingsRes, statsRes] = await Promise.all([
        adminService.getAllTrips().catch(err => {
          console.error('Error fetching trips:', err);
          return { data: [] };
        }),
        adminService.getAllBookings().catch(err => {
          console.error('Error fetching bookings:', err);
          return { data: [] };
        }),
        adminService.getDashboardStats().catch(err => {
          console.error('Error fetching stats:', err);
          return { data: null };
        }),
      ]);

      const trips = tripsRes.data || [];
      const bookings = bookingsRes.data || [];
      const apiStats = statsRes.data;

      // Calculate stats from actual data
      const calculatedStats = {
        totalTrips: apiStats?.totalTrips || trips.length,
        totalBookings: apiStats?.totalBookings || bookings.length,
        totalUsers: apiStats?.totalUsers || 0,
        totalRevenue: apiStats?.totalRevenue || bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        pendingBookings: apiStats?.pendingBookings || bookings.filter(b => b.status === 'pending').length,
        activeTrips: apiStats?.activeTrips || trips.filter(t => !t.archived).length,
      };

      setStats(calculatedStats);
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Trips',
      value: stats.totalTrips || 0,
      icon: 'fi-rr-map-marker',
      color: 'blue',
      link: '/admin/trips',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: 'fi-rr-calendar',
      color: 'green',
      link: '/admin/bookings',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: 'fi-rr-users',
      color: 'purple',
      link: '/admin/users',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue || 0}`,
      icon: 'fi-rr-dollar',
      color: 'yellow',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingBookings || 0,
      icon: 'fi-rr-clock',
      color: 'orange',
      link: '/admin/bookings?status=pending',
    },
    {
      title: 'Active Trips',
      value: stats.activeTrips || 0,
      icon: 'fi-rr-plane',
      color: 'teal',
      link: '/admin/trips?status=active',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-green-100">Manage your travel platform efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getColorClasses(stat.color)}`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            {stat.link && (
              <Link
                to={stat.link}
                className="text-sm text-green-900 font-semibold hover:underline flex items-center gap-1"
              >
                View Details <i className="fi fi-rr-arrow-right text-xs"></i>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <Link
              to="/admin/bookings"
              className="text-sm text-green-900 font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fi fi-rr-inbox text-3xl mb-2"></i>
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {booking.trip?.placeName || 'Unknown Trip'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.customerDetails?.name} • {booking.numberOfPeople} people
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${booking.totalPrice}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/trips/new"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
            >
              <i className="fi fi-rr-plus text-2xl text-green-900"></i>
              <div>
                <p className="font-semibold text-gray-900">Add New Trip</p>
                <p className="text-sm text-gray-500">Create a new travel package</p>
              </div>
            </Link>

            <Link
              to="/admin/bookings?status=pending"
              className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <i className="fi fi-rr-clock text-2xl text-orange-900"></i>
              <div>
                <p className="font-semibold text-gray-900">Pending Approvals</p>
                <p className="text-sm text-gray-500">Review booking requests</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <i className="fi fi-rr-users text-2xl text-blue-900"></i>
              <div>
                <p className="font-semibold text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and edit user accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <i className="fi fi-rr-chart-line text-2xl text-purple-900"></i>
              <div>
                <p className="font-semibold text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Check platform performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
