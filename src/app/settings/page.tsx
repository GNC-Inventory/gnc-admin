'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authService } from '@/services/authService';
import { Eye, EyeOff, User, Lock, Save, AlertTriangle, Trash2, X, ShieldCheck } from 'lucide-react';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, showWarningToast } from '@/utils/toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
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

  // Reset Sales State with Admin Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [authCredentials, setAuthCredentials] = useState({
    email: '',
    password: ''
  });
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle Admin Authentication
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authCredentials.email || !authCredentials.password) {
      showErrorToast('Please enter both email and password');
      return;
    }

    setIsAuthenticating(true);
    const loadingToastId = showLoadingToast('Verifying admin credentials...');

    try {
      // Validate admin credentials
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authCredentials.email,
          password: authCredentials.password,
        }),
      });

      const data = await response.json();

      dismissToast(loadingToastId);

      if (data.success && data.data.user.role === 'ADMIN') {
        // Admin authenticated successfully
        showSuccessToast('Admin verified successfully');
        setShowAuthModal(false);
        setShowResetModal(true);
        // Clear credentials for security
        setAuthCredentials({ email: '', password: '' });
        setShowAuthPassword(false);
      } else if (data.success && data.data.user.role !== 'ADMIN') {
        showErrorToast('Only administrators can perform this action');
      } else {
        showErrorToast('Invalid credentials. Please try again.');
      }
    } catch (error) {
      dismissToast(loadingToastId);
      console.error('Auth error:', error);
      showErrorToast('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Reset Sales Data
  const handleResetSales = async () => {
    if (confirmationText !== 'RESET') {
      showErrorToast('Please type RESET to confirm');
      return;
    }

    setIsResetting(true);
    const loadingToastId = showLoadingToast('Resetting sales data...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/reset`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      });

      const result = await response.json();

      if (result.success) {
        localStorage.removeItem('transactionData');

        setShowResetModal(false);
        setConfirmationText('');
        dismissToast(loadingToastId);
        showSuccessToast(`Sales data reset successfully. ${result.data?.archivedCount || 0} records archived.`);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error?.message || 'Failed to reset sales data');
      }
    } catch (error) {
      dismissToast(loadingToastId);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorToast(`Failed to reset sales data: ${errorMessage}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      showErrorToast('First name and last name are required');
      return;
    }

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

  // Handle tab switching
  const handleTabSwitch = (tab: 'profile' | 'password' | 'danger') => {
    if (tab === activeTab) return;

    if (activeTab === 'profile') {
      const hasUnsavedChanges = profileData.firstName !== user?.firstName ||
        profileData.lastName !== user?.lastName ||
        profileData.phone !== user?.phone;

      if (hasUnsavedChanges) {
        const confirmSwitch = window.confirm('You have unsaved changes in your profile. Are you sure you want to switch tabs?');
        if (!confirmSwitch) return;
      }
    }

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+\s-()]/g, '');
    setProfileData({ ...profileData, phone: value });
  };

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabSwitch('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => handleTabSwitch('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </button>
              <button
                onClick={() => handleTabSwitch('danger')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'danger'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Danger Zone
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
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
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
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
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
                        <span className={`text-xs font-medium ${passwordStrength.level === 'weak' ? 'text-red-600' :
                            passwordStrength.level === 'fair' ? 'text-yellow-600' :
                              'text-green-600'
                          }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                        <div className={`h-1 rounded-full transition-all ${passwordStrength.level === 'weak' ? 'w-1/3 bg-red-500' :
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
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
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

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Reset Sales Data</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        This will permanently delete all sales transaction records and reset &quot;Stock Out&quot; and &quot;Gross Total Sales Value&quot; to zero.
                      </p>
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ This action cannot be undone. Use only for clearing testing data.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset Sales
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Admin Verification Required</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthCredentials({ email: '', password: '' });
                    setShowAuthPassword(false);
                  }}
                  disabled={isAuthenticating}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  🔒 For security, please verify your admin credentials before proceeding with this critical action.
                </p>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={authCredentials.email}
                    onChange={(e) => setAuthCredentials({ ...authCredentials, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@example.com"
                    required
                    disabled={isAuthenticating}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authCredentials.password}
                      onChange={(e) => setAuthCredentials({ ...authCredentials, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                      disabled={isAuthenticating}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isAuthenticating}
                    >
                      {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthCredentials({ email: '', password: '' });
                      setShowAuthPassword(false);
                    }}
                    disabled={isAuthenticating}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verify & Continue
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Confirm Sales Data Reset</h3>
                </div>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setConfirmationText('');
                  }}
                  disabled={isResetting}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-900 font-medium mb-2">
                  ⚠️ WARNING: This action will permanently:
                </p>
                <ul className="text-sm text-red-800 ml-4 space-y-1">
                  <li>• Delete all sales transaction records</li>
                  <li>• Reset &quot;Total Stock Out&quot; to 0 items</li>
                  <li>• Reset &quot;Gross Total Sales Value&quot; to ₦ 0.00</li>
                  <li>• Clear all testing phase sales data</li>
                </ul>
                <p className="text-sm text-red-900 font-medium mt-3">
                  This action CANNOT be undone!
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900">
                  ℹ️ Note: All data will be archived before deletion for audit purposes.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">RESET</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  placeholder="Type RESET"
                  disabled={isResetting}
                  className="w-full h-10 rounded-lg px-3 border border-gray-300 text-center font-mono text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setConfirmationText('');
                  }}
                  disabled={isResetting}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSales}
                  disabled={isResetting || confirmationText !== 'RESET'}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isResetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Reset All Sales Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}