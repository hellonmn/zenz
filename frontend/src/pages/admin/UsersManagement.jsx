import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../services/adminService';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const roles = ['All', 'User', 'Admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data as fallback
      const mockUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 9876543210',
          role: 'user',
          createdAt: new Date('2024-01-15'),
          totalBookings: 5,
          totalSpent: 2500,
          isActive: true,
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 9876543211',
          role: 'admin',
          createdAt: new Date('2023-12-01'),
          totalBookings: 12,
          totalSpent: 6000,
          isActive: true,
        },
        {
          _id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+91 9876543212',
          role: 'user',
          createdAt: new Date('2024-02-10'),
          totalBookings: 3,
          totalSpent: 1800,
          isActive: false,
        },
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        setActionLoading(true);
        await adminService.updateUserRole(userId, newRole);
        setUsers(users.map(u =>
          u._id === userId ? { ...u, role: newRole } : u
        ));
        if (selectedUser?._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
        alert('User role updated successfully!');
      } catch (error) {
        console.error('Error updating role:', error);
        alert('Failed to update user role. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        setActionLoading(true);
        await adminService.toggleUserStatus(userId, !currentStatus);
        setUsers(users.map(u =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        ));
        if (selectedUser?._id === userId) {
          setSelectedUser({ ...selectedUser, isActive: !currentStatus });
        }
        alert(`User ${action}d successfully!`);
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update user status. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => u._id !== userId));
        if (selectedUser?._id === userId) {
          setShowDetailsModal(false);
        }
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesRole = selectedRole === 'all' ||
      user.role?.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      user: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return badges[role?.toLowerCase()] || badges.user;
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-700 border-green-300'
      : 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            {roles.map((role) => (
              <option key={role} value={role.toLowerCase()}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-700">Admins</p>
          <p className="text-2xl font-bold text-purple-800">
            {users.filter(u => u.role?.toLowerCase() === 'admin').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700">Regular Users</p>
          <p className="text-2xl font-bold text-blue-800">
            {users.filter(u => u.role?.toLowerCase() === 'user').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700">Active Users</p>
          <p className="text-2xl font-bold text-green-800">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <i className="fi fi-rr-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between gap-6">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-envelope"></i>
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-phone-call"></i>
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-calendar"></i>
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bookings: </span>
                        <span className="font-semibold text-gray-900">{user.totalBookings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Spent: </span>
                        <span className="font-semibold text-green-900">${user.totalSpent}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold whitespace-nowrap"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleToggleRole(user._id, user.role)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
                  >
                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl transition-colors text-sm font-semibold disabled:opacity-50 whitespace-nowrap ${
                      user.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {selectedUser.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedUser.isActive)}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fi fi-rr-cross text-xl"></i>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="font-semibold text-gray-900">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-semibold text-gray-900">{selectedUser.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Statistics */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Booking Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Bookings</span>
                        <span className="font-bold text-gray-900">{selectedUser.totalBookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Spent</span>
                        <span className="font-bold text-green-900">${selectedUser.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Average per Booking</span>
                        <span className="font-bold text-gray-900">
                          ${selectedUser.totalBookings > 0 ? (selectedUser.totalSpent / selectedUser.totalBookings).toFixed(2) : 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className={`rounded-xl p-4 border ${selectedUser.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Account Status</h3>
                    <p className={`${selectedUser.isActive ? 'text-green-700' : 'text-gray-700'}`}>
                      This account is currently <span className="font-bold">{selectedUser.isActive ? 'active' : 'inactive'}</span>
                    </p>
                  </div>

                  {/* Admin Actions */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Admin Actions</h3>

                    <button
                      onClick={() => handleToggleRole(selectedUser._id, selectedUser.role)}
                      disabled={actionLoading}
                      className="w-full px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-semibold disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>

                    <button
                      onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                      disabled={actionLoading}
                      className={`w-full px-6 py-3 rounded-xl transition-colors font-semibold disabled:opacity-50 ${
                        selectedUser.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {actionLoading ? 'Processing...' : selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(selectedUser._id)}
                      disabled={actionLoading}
                      className="w-full px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Delete User'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
