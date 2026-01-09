import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    avgBookingValue: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    userGrowth: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [popularTrips, setPopularTrips] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data
      const [dashboardStats, revenue, bookings, trips, categories] = await Promise.all([
        adminService.getDashboardStats().catch(() => ({ data: {} })),
        adminService.getRevenueAnalytics(period).catch(() => ({ data: [] })),
        adminService.getBookingTrends(period).catch(() => ({ data: [] })),
        adminService.getPopularTrips(10).catch(() => ({ data: [] })),
        adminService.getCategoryPerformance().catch(() => ({ data: [] })),
      ]);

      setStats(dashboardStats.data || {
        totalRevenue: 125840,
        totalBookings: 342,
        totalUsers: 1543,
        avgBookingValue: 368,
        revenueGrowth: 12.5,
        bookingGrowth: 8.3,
        userGrowth: 15.2,
      });

      setRevenueData(revenue.data || generateMockRevenueData());
      setBookingTrends(bookings.data || generateMockBookingData());
      setPopularTrips(trips.data || generateMockPopularTrips());
      setCategoryPerformance(categories.data || generateMockCategoryData());

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data as fallback
      setStats({
        totalRevenue: 125840,
        totalBookings: 342,
        totalUsers: 1543,
        avgBookingValue: 368,
        revenueGrowth: 12.5,
        bookingGrowth: 8.3,
        userGrowth: 15.2,
      });
      setRevenueData(generateMockRevenueData());
      setBookingTrends(generateMockBookingData());
      setPopularTrips(generateMockPopularTrips());
      setCategoryPerformance(generateMockCategoryData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="space-y-3">
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 bg-white"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue?.toLocaleString() || 0}`}
          growth={stats.revenueGrowth}
          icon="fi-rr-dollar"
          color="green"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings?.toLocaleString() || 0}
          growth={stats.bookingGrowth}
          icon="fi-rr-calendar-check"
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers?.toLocaleString() || 0}
          growth={stats.userGrowth}
          icon="fi-rr-users"
          color="purple"
        />
        <StatCard
          title="Avg Booking Value"
          value={`$${stats.avgBookingValue?.toLocaleString() || 0}`}
          growth={(stats.revenueGrowth - stats.bookingGrowth)}
          icon="fi-rr-chart-line"
          color="orange"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
        <div className="h-64">
          <BarChart data={revenueData} />
        </div>
      </div>

      {/* Booking Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Status Distribution</h2>
          <div className="space-y-4">
            {bookingTrends.map((trend, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{trend.status}</span>
                  <span className="text-sm font-bold text-gray-900">{trend.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${getStatusColor(trend.status)}`}
                    style={{ width: `${trend.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Category Performance</h2>
          <div className="space-y-4">
            {categoryPerformance.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-900">${cat.revenue?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{cat.bookings} bookings</span>
                  <span className="text-xs text-gray-500">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Trips */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top 10 Popular Trips</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trip Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bookings</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {popularTrips.map((trip, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {trip.image ? (
                        <img
                          src={trip.image}
                          alt={trip.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <i className="fi fi-rr-mountain text-green-900"></i>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{trip.name}</p>
                        <p className="text-xs text-gray-500">{trip.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      {trip.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{trip.bookings}</td>
                  <td className="py-3 px-4 font-bold text-green-900">${trip.revenue?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <i className="fi fi-sr-star text-yellow-500 text-sm"></i>
                      <span className="font-semibold text-gray-900">{trip.rating?.toFixed(1)}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, growth, icon, color }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${colors[color]}`}>
          <i className={`fi ${icon} text-xl`}></i>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {growth !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          growth >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <i className={`fi ${growth >= 0 ? 'fi-rr-arrow-trend-up' : 'fi-rr-arrow-trend-down'}`}></i>
          <span>{Math.abs(growth).toFixed(1)}%</span>
          <span className="text-gray-500 font-normal">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

// Simple Bar Chart Component
function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="h-full flex items-end justify-between gap-2 px-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex flex-col items-center justify-end h-48">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg relative group"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                ${item.value?.toLocaleString()}
              </div>
            </motion.div>
          </div>
          <span className="text-xs text-gray-600 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Helper function
function getStatusColor(status) {
  const colors = {
    approved: 'bg-green-500',
    pending: 'bg-yellow-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-gray-500',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-500';
}

// Mock data generators
function generateMockRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.slice(0, 6).map((month, i) => ({
    label: month,
    value: Math.floor(15000 + Math.random() * 10000)
  }));
}

function generateMockBookingData() {
  return [
    { status: 'Approved', count: 245, percentage: 71.6 },
    { status: 'Pending', count: 52, percentage: 15.2 },
    { status: 'Cancelled', count: 30, percentage: 8.8 },
    { status: 'Rejected', count: 15, percentage: 4.4 },
  ];
}

function generateMockPopularTrips() {
  const trips = [
    { name: 'Goa Beach Paradise', location: 'Goa, India', category: 'Beach', bookings: 156, revenue: 62400, rating: 4.8 },
    { name: 'Himalayan Trek', location: 'Manali, Himachal Pradesh', category: 'Adventure', bookings: 142, revenue: 85200, rating: 4.9 },
    { name: 'Kerala Backwaters', location: 'Alleppey, Kerala', category: 'Nature', bookings: 128, revenue: 51200, rating: 4.7 },
    { name: 'Jaipur Heritage Tour', location: 'Jaipur, Rajasthan', category: 'Heritage', bookings: 115, revenue: 46000, rating: 4.6 },
    { name: 'Ladakh Adventure', location: 'Leh, Ladakh', category: 'Adventure', bookings: 98, revenue: 78400, rating: 4.9 },
    { name: 'Andaman Islands', location: 'Port Blair, Andaman', category: 'Beach', bookings: 87, revenue: 52200, rating: 4.8 },
    { name: 'Varanasi Spiritual', location: 'Varanasi, UP', category: 'Pilgrimage', bookings: 76, revenue: 30400, rating: 4.5 },
    { name: 'Munnar Tea Gardens', location: 'Munnar, Kerala', category: 'Hill Station', bookings: 65, revenue: 32500, rating: 4.6 },
    { name: 'Ranthambore Safari', location: 'Ranthambore, Rajasthan', category: 'Wildlife', bookings: 54, revenue: 43200, rating: 4.7 },
    { name: 'Darjeeling Hills', location: 'Darjeeling, West Bengal', category: 'Hill Station', bookings: 48, revenue: 24000, rating: 4.5 },
  ];
  return trips;
}

function generateMockCategoryData() {
  return [
    { name: 'Adventure', icon: '🏔️', bookings: 240, revenue: 163600, percentage: 32 },
    { name: 'Beach', icon: '🏖️', bookings: 243, revenue: 114600, percentage: 28 },
    { name: 'Heritage', icon: '🏛️', bookings: 115, revenue: 46000, percentage: 15 },
    { name: 'Wildlife', icon: '🦁', bookings: 54, revenue: 43200, percentage: 12 },
    { name: 'Hill Station', icon: '⛰️', bookings: 113, revenue: 56500, percentage: 10 },
    { name: 'Pilgrimage', icon: '🕉️', bookings: 76, revenue: 30400, percentage: 3 },
  ];
}
