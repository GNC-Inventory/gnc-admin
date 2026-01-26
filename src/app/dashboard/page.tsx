// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { user } = useAuth();
  const userName = user?.firstName || "User";
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

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

      {/* Admin Controls section removed */}
    </div>
  );
};

export default Dashboard;