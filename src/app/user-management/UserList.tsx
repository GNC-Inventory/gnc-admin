'use client';

import { useState } from 'react';
import { MoreVertical, LogOut, Trash2, Key } from 'lucide-react';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, showWarningToast } from '@/utils/toast';

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

interface UserListProps {
  users: User[];
  onDeleteUser: (userId: number) => void;
  onLogoutUser: (userId: number) => void;
  onResetPassword?: (userId: number) => void;
  token?: string; // Add token for API calls if needed
}

export default function UserList({ users, onDeleteUser, onLogoutUser, onResetPassword, token }: UserListProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState<number | null>(null);

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    
    setProcessingAction(userId);
    const loadingToastId = showLoadingToast(`Deleting ${user.firstName} ${user.lastName}...`);
    
    try {
      await onDeleteUser(userId);
      dismissToast(loadingToastId);
      showSuccessToast(`${user.firstName} ${user.lastName} has been deleted successfully`);
    } catch (error) {
      dismissToast(loadingToastId);
      showErrorToast(`Failed to delete ${user.firstName} ${user.lastName}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setOpenDropdown(null);
    }
  };

  const handleLogoutUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (!user.isOnline) {
      showWarningToast(`${user.firstName} ${user.lastName} is already offline`);
      setOpenDropdown(null);
      return;
    }
    
    setProcessingAction(userId);
    const loadingToastId = showLoadingToast(`Logging out ${user.firstName} ${user.lastName}...`);
    
    try {
      await onLogoutUser(userId);
      dismissToast(loadingToastId);
      showSuccessToast(`${user.firstName} ${user.lastName} has been logged out successfully`);
    } catch (error) {
      dismissToast(loadingToastId);
      showErrorToast(`Failed to logout ${user.firstName} ${user.lastName}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setOpenDropdown(null);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user || !onResetPassword) return;
    
    const confirmReset = window.confirm(
      `Are you sure you want to reset the password for ${user.firstName} ${user.lastName}? They will need to use the new temporary password.`
    );
    if (!confirmReset) return;
    
    setProcessingAction(userId);
    const loadingToastId = showLoadingToast(`Resetting password for ${user.firstName} ${user.lastName}...`);
    
    try {
      await onResetPassword(userId);
      dismissToast(loadingToastId);
      showSuccessToast(`Password reset for ${user.firstName} ${user.lastName}. New temporary password has been generated.`);
    } catch (error) {
      dismissToast(loadingToastId);
      showErrorToast(`Failed to reset password for ${user.firstName} ${user.lastName}. Please try again.`);
    } finally {
      setProcessingAction(null);
      setOpenDropdown(null);
    }
  };

  const handleAction = (action: () => void) => {
    setOpenDropdown(null);
    action();
  };

  const isUserBeingProcessed = (userId: number) => processingAction === userId;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
          {users.map((user) => (
            <tr key={user.id} className={`hover:bg-gray-50 ${isUserBeingProcessed(user.id) ? 'opacity-50 pointer-events-none' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center relative">
                    <span className="text-white text-sm font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                    {isUserBeingProcessed(user.id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-75 rounded-full">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
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
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
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
                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUserBeingProcessed(user.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {openDropdown === user.id && !isUserBeingProcessed(user.id) && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenDropdown(null)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                        <div className="py-1">
                          {onResetPassword && (
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </button>
                          )}
                          <button
                            onClick={() => handleLogoutUser(user.id)}
                            className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors ${
                              user.isOnline 
                                ? 'text-gray-700 hover:bg-gray-100' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!user.isOnline}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Force Logout
                            {!user.isOnline && <span className="ml-auto text-xs">(Offline)</span>}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
}