// app/inventory/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

  // Load inventory data from localStorage on component mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('inventoryData');
    if (savedInventory) {
      setInventoryData(JSON.parse(savedInventory));
    }
  }, []);

  // Filter inventory data based on search query
  const filteredInventoryData = inventoryData.filter(item =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats from actual inventory data
  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => {
    return sum + (typeof item.amount === 'number' ? item.amount : 0);
  }, 0);
  const lowStockItems = inventoryData.filter(item => item.stockLeft <= 5).length;

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
          <p className="text-gray-600 w-[57px] h-5">
            Showing
          </p>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white rounded-[10px] px-3 py-2.5 flex items-center justify-between border border-gray-200 hover:border-gray-300 transition-colors w-[193px] h-10"
              style={{ padding: '10px 10px 10px 12px', gap: '8px' }}
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
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* In Card */}
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <InCard itemCount={totalItems} totalValue={totalValue} />
        </div>

        {/* Out Card */}
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <OutCard itemCount={0} totalValue={0} />
        </div>

        {/* Inventory Value Card */}
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <InventoryValueCard itemCount={totalItems} totalValue={totalValue} />
        </div>

        {/* Low In Stock Card */}
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <LowInStockCard itemCount={lowStockItems} />
        </div>
      </div>

      {/* Combined Search and Inventory Section */}
      <div className="w-[1104px] h-[612px] bg-white rounded-[32px] p-6 opacity-100 box-border" style={{ gap: '16px' }}>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-[540px] h-9 opacity-100 rounded-[20px] p-2 border border-gray-200" style={{ gap: '8px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items by name or SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Inventory Section Title */}
        <div className="mb-4">
          <h2 className="font-geist font-medium text-lg leading-6 text-[#0A0D14] align-bottom" style={{ letterSpacing: '-1.5%' }}>
            Inventory
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {/* Table Header - separate from table */}
          <div className="w-[1056px] h-11 opacity-100 rounded-[20px] p-3 bg-[#F6F8FA] mb-2" style={{ gap: '36px' }}>
            <div className="grid items-center h-full" style={{ gridTemplateColumns: '300px 200px 120px 150px 150px' }}>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Product</div>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Date Added</div>
              <div className="text-left text-sm font-medium text-gray-600 pl-0 pr-1">Stock left</div>
              <div className="text-left text-sm font-medium text-gray-600 px-3">Unit cost</div>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Amount</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="space-y-1">
            {filteredInventoryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No inventory items found. Add products to get started.
              </div>
            ) : (
              filteredInventoryData.map((item) => (
                <div key={item.id} className="grid items-center py-4 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '300px 200px 120px 150px 150px' }}>
                  <div className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                      <span className="text-sm font-medium text-gray-900">{item.product}</span>
                    </div>
                  </div>
                  <div className="px-6 text-sm text-gray-600">{item.dateAdded}</div>
                  <div className="px-8 text-sm text-gray-900">{item.stockLeft}</div>
                  <div className="px-3 text-sm text-gray-900">{formatCurrency(item.unitCost)}</div>
                  <div className="px-6 text-sm text-gray-900">{formatAmount(item.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;