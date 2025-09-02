// app/inventory/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Trash2 } from 'lucide-react';
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
  image?: string;
}

const Inventory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const dropdownOptions = [
    'Today',
    'Yesterday', 
    'Previous days',
    'Last week',
    'Last month',
    'Last year'
  ];

  // Load inventory and transaction data from Netlify function
  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load inventory data
      const inventoryResponse = await fetch('/.netlify/functions/inventory');
      
      if (inventoryResponse.ok) {
        const inventoryResult = await inventoryResponse.json();
        if (inventoryResult.success && inventoryResult.data) {
          setInventoryData(inventoryResult.data);
          localStorage.setItem('inventoryData', JSON.stringify(inventoryResult.data));
        }
      }

      // Load transaction data
      const transactionResponse = await fetch('/.netlify/functions/inventory/transactions');
      
      if (transactionResponse.ok) {
        const transactionResult = await transactionResponse.json();
        if (transactionResult.success && transactionResult.data) {
          setTransactionData(transactionResult.data);
          localStorage.setItem('transactionData', JSON.stringify(transactionResult.data));
        }
      }

      // Fallback to localStorage if functions fail
      if (!inventoryResponse.ok) {
        const localInventory = localStorage.getItem('inventoryData');
        if (localInventory) setInventoryData(JSON.parse(localInventory));
      }

      if (!transactionResponse.ok) {
        const localTransactions = localStorage.getItem('transactionData');
        if (localTransactions) setTransactionData(JSON.parse(localTransactions));
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      
      // Fallback to localStorage
      const localInventory = localStorage.getItem('inventoryData');
      const localTransactions = localStorage.getItem('transactionData');
      
      if (localInventory) {
        setInventoryData(JSON.parse(localInventory));
        setError(null);
      }
      if (localTransactions) {
        setTransactionData(JSON.parse(localTransactions));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadInventoryData();
  }, []);

  // Filter inventory data based on search query
  const filteredInventoryData = inventoryData.filter(item =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats from actual inventory and transaction data
  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => {
    return sum + (typeof item.amount === 'number' ? item.amount : 0);
  }, 0);
  const lowStockItems = inventoryData.filter(item => item.stockLeft <= 5).length;

  // Calculate sales stats from transactions
  const totalItemsSold = transactionData.reduce((sum, transaction) => {
    return sum + transaction.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
  }, 0);

  const totalSalesRevenue = transactionData.reduce((sum, transaction) => {
    return sum + (transaction.total || 0);
  }, 0);

  // Calculate current inventory value (remaining stock value)
  const currentInventoryValue = inventoryData.reduce((sum, item) => {
    return sum + (item.unitCost * item.stockLeft);
  }, 0);

  // Handle delete product
  const handleDeleteClick = (product: InventoryItem) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/.netlify/functions/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productToDelete.id })
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove product from local state
        setInventoryData(prev => prev.filter(item => item.id !== productToDelete.id));
        
        // Update localStorage
        const updatedInventory = inventoryData.filter(item => item.id !== productToDelete.id);
        localStorage.setItem('inventoryData', JSON.stringify(updatedInventory));
        
        setShowDeleteModal(false);
        setProductToDelete(null);
        
        // Show success message (you can replace this with a toast notification)
        alert(`Product "${productToDelete.product}" deleted successfully!`);
      } else {
        throw new Error(result.error || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Failed to delete product: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  const formatAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      return formatCurrency(amount);
    }
    return amount;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadInventoryData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <p className="text-gray-600 w-[57px] h-5">Showing</p>
          
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

          <button 
            onClick={loadInventoryData}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <InCard itemCount={totalItems} totalValue={totalValue} />
        </div>

        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <OutCard itemCount={totalItemsSold} totalValue={totalSalesRevenue} />
        </div>

        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <InventoryValueCard itemCount={totalItems} totalValue={currentInventoryValue} />
        </div>

        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6 opacity-100 box-border">
          <LowInStockCard itemCount={lowStockItems} />
        </div>
      </div>

      {/* Combined Search and Inventory Section */}
      <div className="w-[1104px] h-[612px] bg-white rounded-[32px] p-6 opacity-100 box-border" style={{ gap: '16px' }}>
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

        <div className="mb-4">
          <h2 className="font-geist font-medium text-lg leading-6 text-[#0A0D14] align-bottom" style={{ letterSpacing: '-1.5%' }}>
            Inventory
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="w-[1056px] h-11 opacity-100 rounded-[20px] p-3 bg-[#F6F8FA] mb-2" style={{ gap: '36px' }}>
            <div className="grid items-center h-full" style={{ gridTemplateColumns: '300px 200px 120px 150px 150px 80px' }}>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Product</div>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Date Added</div>
              <div className="text-left text-sm font-medium text-gray-600 pl-0 pr-1">Stock left</div>
              <div className="text-left text-sm font-medium text-gray-600 px-3">Unit cost</div>
              <div className="text-left text-sm font-medium text-gray-600 px-6">Amount</div>
              <div className="text-left text-sm font-medium text-gray-600 px-3">Action</div>
            </div>
          </div>

          <div className="space-y-1">
            {filteredInventoryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No items found matching your search.' : 'No inventory items found. Add products to get started.'}
              </div>
            ) : (
              filteredInventoryData.map((item) => (
                <div key={item.id} className="grid items-center py-4 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '300px 200px 120px 150px 150px 80px' }}>
                  <div className="px-6">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.product} className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{item.product}</span>
                    </div>
                  </div>
                  <div className="px-6 text-sm text-gray-600">{item.dateAdded}</div>
                  <div className="px-8 text-sm text-gray-900">{item.stockLeft}</div>
                  <div className="px-3 text-sm text-gray-900">{formatCurrency(item.unitCost)}</div>
                  <div className="px-6 text-sm text-gray-900">{formatAmount(item.amount)}</div>
                  <div className="px-3">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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