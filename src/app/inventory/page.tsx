// app/inventory/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import InCard from '@/components/products/InCard';
import OutCard from '@/components/products/OutCard';
import InventoryValueCard from '@/components/products/InventoryValueCard';
import LowInStockCard from '@/components/products/LowInStockCard';

interface InventoryItem {
  id: string;
  product: string;
  dateAdded: string;
  stockLeft: number;
  unitCost: number;
  amount: number | string;
}

const Inventory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

  // Sample inventory data
  const inventoryData: InventoryItem[] = [
    {
      id: '1',
      product: 'Generator',
      dateAdded: '25-07-2025 14:36:12',
      stockLeft: 1,
      unitCost: 243000,
      amount: 243000
    },
    {
      id: '2',
      product: 'Air conditioner',
      dateAdded: '25-07-2025 14:36:12',
      stockLeft: 1,
      unitCost: 243000,
      amount: 'Leaking water'
    },
    {
      id: '3',
      product: 'Fan',
      dateAdded: '25-07-2025 14:36:12',
      stockLeft: 1,
      unitCost: 243000,
      amount: 'Leaking water'
    },
    {
      id: '4',
      product: 'Television',
      dateAdded: '25-07-2025 14:36:12',
      stockLeft: 1,
      unitCost: 243000,
      amount: 'Leaking water'
    },
    {
      id: '5',
      product: 'Solar Battery',
      dateAdded: '25-07-2025 14:36:12',
      stockLeft: 1,
      unitCost: 243000,
      amount: 'Leaking water'
    }
  ];

  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  const formatAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      return formatCurrency(amount);
    }
    return amount;
  };

  return (
    <div className="bg-gray-50 min-h-full p-8">
      {/* Header Section */}
      <div className="mb-6">
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
        {/* In Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '172px',
            gap: '16px'
          }}
        >
          <InCard itemCount={5} totalValue={243000} />
        </div>

        {/* Out Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '172px',
            gap: '16px'
          }}
        >
          <OutCard itemCount={205} totalValue={23243000} />
        </div>

        {/* Inventory Value Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '172px',
            gap: '16px'
          }}
        >
          <InventoryValueCard itemCount={13205} totalValue={132243000} />
        </div>

        {/* Low In Stock Card */}
        <div 
          className="bg-white rounded-[32px] p-6"
          style={{
            width: '258px',
            height: '172px',
            gap: '16px'
          }}
        >
          <LowInStockCard itemCount={25} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items by name or SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Inventory Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Section Title */}
        <div className="p-6 border-b border-gray-200">
          <h2 
            className="text-[#0A0D14] font-semibold"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              fontWeight: 600
            }}
          >
            Inventory
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-[#F6F8FA]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Date Added</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Stock left</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Unit cost</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {inventoryData.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                      <span className="text-sm font-medium text-gray-900">{item.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.dateAdded}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.stockLeft}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.unitCost)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatAmount(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;