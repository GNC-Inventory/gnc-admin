// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, Trash2, X } from 'lucide-react';
import SalesCard from '@/components/dashboard/SalesCard';
import TransactionsCard from '@/components/dashboard/TransactionsCard';
import AverageSalesCard from '@/components/dashboard/AverageSalesCard';
import TaxDueCard from '@/components/dashboard/TaxDueCard';
import SalesGraph from '@/components/dashboard/SalesGraph';
import SalesByProduct from '@/components/dashboard/SalesByProduct';
import TopPerformingStaff from '@/components/dashboard/TopPerformingStaff';
import LowInStock from '@/components/dashboard/LowInStock';
import TotalAmountReturned from '@/components/dashboard/TotalAmountReturned';
import TotalReturnedItems from '@/components/dashboard/TotalReturnedItems';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast';

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const { user } = useAuth();
  const userName = user?.firstName || "User";
  const isAdmin = user?.role === 'ADMIN';
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

  const handleResetSales = async () => {
    if (resetConfirmText !== 'RESET') {
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
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // Dismiss loading toast
      dismissToast(loadingToastId);

      if (data.success) {
        // Clear localStorage
        localStorage.removeItem('transactionData');
        
        showSuccessToast(`Sales data reset successfully. ${data.data.archivedCount} records archived.`);
        
        // Close modal and reset state
        setShowResetModal(false);
        setResetConfirmText('');
        
        // Reload page to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showErrorToast(data.error?.message || 'Failed to reset sales data');
      }
    } catch (error) {
      // Dismiss loading toast
      dismissToast(loadingToastId);
      console.error('Reset error:', error);
      showErrorToast('Network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full pl-8 pr-1 py-4 w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 
          className="text-[#0A0D14] mb-4"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '0%'
          }}
        >
          Welcome, {userName}
        </h1>
        
        {/* Showing and Dropdown */}
        <div className="flex items-center gap-4">
          <p 
            className="text-gray-600"
            style={{
              width: '57px',
              height: '20px'
            }}
          >
            Showing
          </p>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white rounded-[10px] px-3 py-2.5 flex items-center justify-between border border-gray-200 hover:border-gray-300 transition-colors"
              style={{
                width: '193px',
                height: '40px',
                padding: '10px 10px 10px 12px',
                gap: '8px'
              }}
            >
              <span className="text-gray-700 text-sm">{selectedPeriod}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-[10px] shadow-lg z-10">
                {dropdownOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedPeriod(option);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-[10px] last:rounded-b-[10px]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 mb-8" style={{ gap: '16px' }}>
        {/* Sales Card */}
        <div 
          style={{
            width: '258px',
            height: '128px',
            borderRadius: '32px',
            padding: '24px',
            background: '#FFFFFF',
            opacity: 1,
            boxSizing: 'border-box'
          }}
          className="xl:w-[300px] xl:h-[150px] 2xl:w-[350px] 2xl:h-[170px]"
        >
          <SalesCard period="today" />
        </div>

        {/* Transactions Card */}
        <div 
          style={{
            width: '258px',
            height: '128px',
            borderRadius: '32px',
            padding: '24px',
            background: '#FFFFFF',
            opacity: 1,
            boxSizing: 'border-box'
          }}
        >
          <TransactionsCard period="today" />
        </div>

        {/* Average Sales Card */}
        <div 
          style={{
            width: '258px',
            height: '128px',
            borderRadius: '32px',
            padding: '24px',
            background: '#FFFFFF',
            opacity: 1,
            boxSizing: 'border-box'
          }}
        >
          <AverageSalesCard period="today" />
        </div>

        {/* Tax Due Card */}
        <div 
          style={{
            width: '258px',
            height: '128px',
            borderRadius: '32px',
            padding: '24px',
            background: '#FFFFFF',
            opacity: 1,
            boxSizing: 'border-box'
          }}
        >
          <TaxDueCard period="today" />
        </div>
      </div>

      {/* Sales Graph */}
      <div 
        className="mb-8"
        style={{
          width: '1104px',
          height: '261px',
          top: '384px',
          left: '304px',
          gap: '24px',
          opacity: 1,
          borderRadius: '32px',
          padding: '24px',
          background: '#FFFFFF'
        }}
      >
        <SalesGraph period={selectedPeriod.toLowerCase()} />
      </div>

      {/* Sales by Product and Bottom Stats Row */}
      <div className="flex gap-4 mb-8">
        {/* Sales by Product */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '540px',
            height: '280px',
            gap: '14px'
          }}
        >
          <SalesByProduct period={selectedPeriod.toLowerCase()} />
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Performing Staff */}
          <div 
            className="bg-white rounded-[32px] p-6"
            style={{
              width: '258px',
              height: '132px',
              gap: '16px'
            }}
          >
            <TopPerformingStaff period={selectedPeriod.toLowerCase()} />
          </div>

          {/* Low in Stock */}
          <div 
            className="bg-white rounded-[32px] p-6"
            style={{
              width: '258px',
              height: '132px',
              gap: '16px'
            }}
          >
            <LowInStock period={selectedPeriod.toLowerCase()} />
          </div>

          {/* Total Amount Returned */}
          <div 
            className="bg-white rounded-[32px] p-6"
            style={{
              width: '258px',
              height: '132px',
              gap: '16px'
            }}
          >
            <TotalAmountReturned period={selectedPeriod.toLowerCase()} />
          </div>

          {/* Total Returned Items */}
          <div 
            className="bg-white rounded-[32px] p-6"
            style={{
              width: '258px',
              height: '132px',
              gap: '16px'
            }}
          >
            <TotalReturnedItems period={selectedPeriod.toLowerCase()} />
          </div>
        </div>
      </div>

      {/* DANGER ZONE - Only visible for ADMIN users */}
      {isAdmin && (
        <div className="bg-white rounded-[32px] p-6 border-2 border-red-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-600">Admin Controls - Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Reset Sales Data</h3>
              <p className="text-xs text-gray-600 mb-3">
                This will permanently reset all sales transaction data to zero. 
                All testing data will be cleared. Use this only after completing the testing phase.
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Reset Sales Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-md w-full shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Reset</h3>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2 font-medium">
                ⚠️ This action will permanently reset:
              </p>
              <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                <li>All sales transaction records</li>
                <li>Total Stock Out values</li>
                <li>Gross Total Sales Value</li>
                <li>All sales-related statistics</li>
              </ul>
              <p className="text-xs text-red-700 mt-3 font-medium">
                📋 Note: Data will be archived before deletion for audit purposes.
              </p>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="Type RESET"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isResetting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleResetSales}
                disabled={resetConfirmText !== 'RESET' || isResetting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  );
};

export default Dashboard;