'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreateUserModal from './CreateUserModal';
import { Search, MoreVertical, Trash2, LogOut } from 'lucide-react';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isOnline: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        showErrorToast('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showErrorToast('Error loading users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Listen for modal open event from Navbar
  useEffect(() => {
    const handleOpenModal = () => setShowCreateModal(true);
    window.addEventListener('openCreateUserModal', handleOpenModal);
    return () => window.removeEventListener('openCreateUserModal', handleOpenModal);
  }, []);

  // Filter users
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create user - handles both admin and salesman creation
  const handleCreateUser = async (userData: any) => {
    const loadingToastId = showLoadingToast(`Creating ${userData.role.toLowerCase()}...`);
    
    try {
      // Choose endpoint based on role
      const endpoint = userData.role === 'ADMIN' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/admin`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/users/salesman`;
      
      // Prepare request body (remove role from body as backend expects it in the logic)
      const { role, ...requestData } = userData;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      dismissToast(loadingToastId);
      
      if (data.success) {
        await fetchUsers();
        return { tempPassword: data.data.tempPassword };
      } else {
        showErrorToast(data.error?.message || `Failed to create ${userData.role.toLowerCase()}`);
        throw new Error(data.error?.message || `Failed to create ${userData.role.toLowerCase()}`);
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error('Error creating user:', error);
      showErrorToast(`Error creating ${userData.role.toLowerCase()}. Please try again.`);
      throw error;
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    const loadingToastId = showLoadingToast(`Deleting ${user.firstName} ${user.lastName}...`);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      
      dismissToast(loadingToastId);
      
      if (response.ok) {
        await fetchUsers();
        showSuccessToast(`${user.firstName} ${user.lastName} has been deleted successfully`);
        setActionUserId(null);
      } else {
        const errorData = await response.json();
        showErrorToast(errorData.error?.message || 'Failed to delete user');
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error('Error deleting user:', error);
      showErrorToast('Error deleting user. Please try again.');
    }
  };

  // Logout user
  const handleLogoutUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const loadingToastId = showLoadingToast(`Logging out ${user.firstName} ${user.lastName}...`);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      
      dismissToast(loadingToastId);
      
      if (response.ok) {
        await fetchUsers();
        showSuccessToast(`${user.firstName} ${user.lastName} has been logged out successfully`);
        setActionUserId(null);
      } else {
        const errorData = await response.json();
        showErrorToast(errorData.error?.message || 'Failed to logout user');
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error('Error logging out user:', error);
      showErrorToast('Error logging out user. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="p-6">
        {/* Search - No header, just search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'
                            }`}>
                              <span className="text-white text-sm font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'MANAGER'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-900">
                            {user.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setActionUserId(actionUserId === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionUserId === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <button
                                  onClick={() => handleLogoutUser(user.id)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  disabled={!user.isOnline}
                                >
                                  <LogOut className="w-4 h-4 mr-2" />
                                  Force Logout
                                  {!user.isOnline && <span className="ml-2 text-xs text-gray-400">(Offline)</span>}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        <CreateUserModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateUser} 
        />
      </div>
    </ProtectedRoute>
  );
}