// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SalesCard from '@/components/dashboard/SalesCard';
import TransactionsCard from '@/components/dashboard/TransactionsCard';
import AverageSalesCard from '@/components/dashboard/AverageSalesCard';
import TaxDueCard from '@/components/dashboard/TaxDueCard';
import SalesGraph from '@/components/dashboard/SalesGraph';

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const userName = "Joseph"; // This would come from your auth context/props
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

  return (
    <div className="bg-gray-50 min-h-full p-8">
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
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Sales Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '128px',
            gap: '16px'
          }}
        >
          <SalesCard amount={5000000} period="today" />
        </div>

        {/* Transactions Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '128px',
            gap: '16px'
          }}
        >
          <TransactionsCard count={156} period="today" />
        </div>

        {/* Average Sales Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '128px',
            gap: '16px'
          }}
        >
          <AverageSalesCard amount={243000} period="today" />
        </div>

        {/* Tax Due Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '128px',
            gap: '16px'
          }}
        >
          <TaxDueCard amount={853129} period="today" />
        </div>
      </div>

      {/* Sales Graph */}
      <div 
        className="bg-white rounded-[32px] p-6 mb-8"
        style={{
          width: '1104px',
          height: '261px',
          gap: '24px'
        }}
      >
        <SalesGraph period={selectedPeriod.toLowerCase()} />
      </div>

      {/* Sales by Product and Bottom Stats Row */}
      <div className="flex gap-6">
        {/* Sales by Product */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '540px',
            height: '246px',
            gap: '14px'
          }}
        >
          {/* Sales by Product Component will go here */}
          <div className="text-center text-gray-500 flex items-center justify-center h-full">
            Sales by Product Component
          </div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top Performing Staff */}
          <div 
            className="bg-white rounded-[32px] p-6"
            style={{
              width: '258px',
              height: '132px',
              gap: '16px'
            }}
          >
            {/* Top Performing Staff Component will go here */}
            <div className="text-center text-gray-500 text-xs">Top Performing Staff</div>
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
            {/* Low in Stock Component will go here */}
            <div className="text-center text-gray-500 text-xs">Low in Stock</div>
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
            {/* Total Amount Returned Component will go here */}
            <div className="text-center text-gray-500 text-xs">Total Amount Returned</div>
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
            {/* Total Returned Items Component will go here */}
            <div className="text-center text-gray-500 text-xs">Total Returned Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;