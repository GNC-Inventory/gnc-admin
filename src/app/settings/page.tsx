'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authService } from '@/services/authService';
import { Eye, EyeOff, User, Lock, Save } from 'lucide-react';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, showWarningToast } from '@/utils/toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      showErrorToast('First name and last name are required');
      return;
    }

    // Check if any changes were made
    const hasChanges = profileData.firstName !== user?.firstName || 
                      profileData.lastName !== user?.lastName || 
                      profileData.phone !== user?.phone;
    
    if (!hasChanges) {
      showWarningToast('No changes detected to save');
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoadingToast('Updating profile...');

    try {
      const token = authService.getStoredToken();
      if (!token) throw new Error('No authentication token');

      const updatedUser = await authService.updateProfile(token, {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        phone: profileData.phone.trim(),
      });

      updateUser(updatedUser);
      dismissToast(loadingToastId);
      showSuccessToast('Profile updated successfully');
    } catch (error: any) {
      dismissToast(loadingToastId);
      console.error('Profile update error:', error);
      showErrorToast(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword) {
      showErrorToast('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      showErrorToast('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showErrorToast('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showWarningToast('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoadingToast('Changing password...');

    try {
      const token = authService.getStoredToken();
      if (!token) throw new Error('No authentication token');

      await authService.changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      dismissToast(loadingToastId);
      showSuccessToast('Password changed successfully');
    } catch (error: any) {
      dismissToast(loadingToastId);
      console.error('Password change error:', error);
      
      // Handle specific error cases
      if (error.message.includes('current password')) {
        showErrorToast('Current password is incorrect');
      } else if (error.message.includes('weak')) {
        showErrorToast('New password is too weak. Please choose a stronger password.');
      } else {
        showErrorToast(error.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab switching with unsaved changes warning
  const handleTabSwitch = (tab: 'profile' | 'password') => {
    if (tab === activeTab) return;
    
    // Check for unsaved changes in profile tab
    if (activeTab === 'profile') {
      const hasUnsavedChanges = profileData.firstName !== user?.firstName || 
                               profileData.lastName !== user?.lastName || 
                               profileData.phone !== user?.phone;
      
      if (hasUnsavedChanges) {
        const confirmSwitch = window.confirm('You have unsaved changes in your profile. Are you sure you want to switch tabs?');
        if (!confirmSwitch) return;
      }
    }
    
    // Check for unsaved changes in password tab
    if (activeTab === 'password') {
      const hasUnsavedChanges = passwordData.currentPassword || 
                               passwordData.newPassword || 
                               passwordData.confirmPassword;
      
      if (hasUnsavedChanges) {
        const confirmSwitch = window.confirm('You have unsaved changes in your password form. Are you sure you want to switch tabs?');
        if (!confirmSwitch) return;
      }
    }
    
    setActiveTab(tab);
  };

  // Phone number formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+\s-()]/g, ''); // Allow only digits, +, spaces, hyphens, parentheses
    setProfileData({...profileData, phone: value});
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { level: 'weak', text: 'Too short' };
    if (password.length < 8) return { level: 'fair', text: 'Fair' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { level: 'fair', text: 'Fair' };
    return { level: 'strong', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabSwitch('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => handleTabSwitch('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+234 xxx xxx xxxx"
                    disabled={isLoading}
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code for international numbers</p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.level === 'weak' ? 'text-red-600' :
                          passwordStrength.level === 'fair' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                        <div className={`h-1 rounded-full transition-all ${
                          passwordStrength.level === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength.level === 'fair' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Password Requirements:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Mix of uppercase and lowercase letters recommended</li>
                    <li>• Include numbers and special characters for better security</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}