'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Trash2, Edit } from 'lucide-react';
import InCard from '@/components/products/InCard';
import OutCard from '@/components/products/OutCard';
import InventoryValueCard from '@/components/products/InventoryValueCard';
import LowInStockCard from '@/components/products/LowInStockCard';

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  dateAdded: string;
  stockLeft: number;
  unitCost: number;
  basePrice?: number;
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
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<InventoryItem | null>(null);
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const dropdownOptions = ['Today', 'Yesterday', 'Previous days', 'Last week', 'Last month', 'Last year'];

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryResponse, transactionResponse] = await Promise.all([
        fetch('/.netlify/functions/inventory'),
        fetch('/.netlify/functions/inventory/transactions')
      ]);

      if (inventoryResponse.ok) {
        const result = await inventoryResponse.json();
        if (result.success) {
          setInventoryData(result.data || []);
          localStorage.setItem('inventoryData', JSON.stringify(result.data || []));
        }
      }

      if (transactionResponse.ok) {
        const result = await transactionResponse.json();
        if (result.success) {
          setTransactionData(result.data || []);
          localStorage.setItem('transactionData', JSON.stringify(result.data || []));
        }
      }

      // Fallback to localStorage
      if (!inventoryResponse.ok || !transactionResponse.ok) {
        const localInventory = localStorage.getItem('inventoryData');
        const localTransactions = localStorage.getItem('transactionData');
        if (localInventory) setInventoryData(JSON.parse(localInventory));
        if (localTransactions) setTransactionData(JSON.parse(localTransactions));
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      
      const localInventory = localStorage.getItem('inventoryData');
      const localTransactions = localStorage.getItem('transactionData');
      if (localInventory) setInventoryData(JSON.parse(localInventory));
      if (localTransactions) setTransactionData(JSON.parse(localTransactions));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const filteredInventoryData = inventoryData.filter(item =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => 
    sum + (typeof item.amount === 'number' ? item.amount : 0), 0
  );
  const lowStockItems = inventoryData.filter(item => item.stockLeft <= 5).length;
  const totalItemsSold = transactionData.reduce((sum, transaction) => 
    sum + transaction.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
  );
  const totalSalesRevenue = transactionData.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
  const currentInventoryValue = inventoryData.reduce((sum, item) => sum + (item.unitCost * item.stockLeft), 0);

  // Modal handlers
  const openDeleteModal = (product: InventoryItem) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const openEditModal = (product: InventoryItem) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setProductToDelete(null);
    setProductToEdit(null);
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
        const updatedInventory = inventoryData.filter(item => item.id !== productToDelete.id);
        setInventoryData(updatedInventory);
        localStorage.setItem('inventoryData', JSON.stringify(updatedInventory));
        closeModals();
        alert(`Product "${productToDelete.product}" deleted successfully!`);
      } else {
        throw new Error(result.error || 'Failed to delete product');
      }
    } catch (error: any) {
      alert(`Failed to delete product: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const updateProduct = async () => {
    if (!productToEdit) return;
    
    setIsUpdating(true);
    try {
      const updatedItems = inventoryData.map(item => 
        item.id === productToEdit.id ? productToEdit : item
      );
      
      const response = await fetch('/.netlify/functions/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: updatedItems })
      });

      const result = await response.json();
      
      if (result.success) {
        setInventoryData(updatedItems);
        localStorage.setItem('inventoryData', JSON.stringify(updatedItems));
        closeModals();
        alert(`Product "${productToEdit.product}" updated successfully!`);
      } else {
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (error: any) {
      alert(`Failed to update product: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;
  const formatAmount = (amount: number | string) => typeof amount === 'number' ? formatCurrency(amount) : amount;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
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
          <button onClick={loadInventoryData} className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <p className="text-gray-600">Showing</p>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-white rounded-[10px] px-3 py-2.5 flex items-center justify-between border border-gray-200 hover:border-gray-300 transition-colors w-[193px]"
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
        <button onClick={loadInventoryData} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors text-sm">
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <InCard itemCount={totalItems} totalValue={totalValue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <OutCard itemCount={totalItemsSold} totalValue={totalSalesRevenue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <InventoryValueCard itemCount={totalItems} totalValue={currentInventoryValue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <LowInStockCard itemCount={lowStockItems} />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="w-[1104px] h-[612px] bg-white rounded-[32px] p-6">
        <div className="mb-6">
          <div className="relative w-[540px] h-9 rounded-[20px] p-2 border border-gray-200">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items by name or SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <h2 className="font-medium text-lg text-[#0A0D14] mb-4">Inventory</h2>

        <div className="overflow-x-auto">
          <div className="w-[1056px] h-11 rounded-[20px] p-3 bg-[#F6F8FA] mb-2">
            <div className="grid items-center h-full" style={{ gridTemplateColumns: '260px 160px 100px 120px 120px 120px 120px' }}>
              <div className="text-sm font-medium text-gray-600 px-6">Product</div>
              <div className="text-sm font-medium text-gray-600 px-6">Date Added</div>
              <div className="text-sm font-medium text-gray-600">Stock left</div>
              <div className="text-sm font-medium text-gray-600 px-3">Unit cost</div>
              <div className="text-sm font-medium text-gray-600 px-3">Base Price</div>
              <div className="text-sm font-medium text-gray-600 px-6">Amount</div>
              <div className="text-sm font-medium text-gray-600 px-3">Actions</div>
            </div>
          </div>

          <div className="space-y-1">
            {filteredInventoryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No items found matching your search.' : 'No inventory items found. Add products to get started.'}
              </div>
            ) : (
              filteredInventoryData.map((item) => (
                <div key={item.id} className="grid items-center py-4 border-b border-gray-100 hover:bg-gray-50" style={{ gridTemplateColumns: '260px 160px 100px 120px 120px 120px 120px' }}>
                  <div className="px-6 flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.product} className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{item.product}</span>
                  </div>
                  <div className="px-6 text-sm text-gray-600">{item.dateAdded}</div>
                  <div className="px-8 text-sm text-gray-900">{item.stockLeft}</div>
                  <div className="px-3 text-sm text-gray-900">{formatCurrency(item.unitCost)}</div>
                  <div className="px-3 text-sm text-gray-900">{item.basePrice ? formatCurrency(item.basePrice) : '-'}</div>
                  <div className="px-6 text-sm text-gray-900">{formatAmount(item.amount)}</div>
                  <div className="px-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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

      {/* Edit Modal */}
      {showEditModal && productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Left</label>
                <input
                  type="number"
                  min="0"
                  value={productToEdit.stockLeft}
                  onChange={(e) => setProductToEdit({
                    ...productToEdit,
                    stockLeft: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productToEdit.unitCost}
                  onChange={(e) => setProductToEdit({
                    ...productToEdit,
                    unitCost: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {productToEdit.basePrice !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productToEdit.basePrice}
                    onChange={(e) => setProductToEdit({
                      ...productToEdit,
                      basePrice: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModals}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {productToDelete.image ? (
                    <img src={productToDelete.image} alt={productToDelete.product} className="w-12 h-12 bg-gray-200 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{productToDelete.product}</p>
                    <p className="text-sm text-gray-500">Unit Cost: {formatCurrency(productToDelete.unitCost)}</p>
                    {productToDelete.basePrice && (
                      <p className="text-sm text-gray-500">Base Price: {formatCurrency(productToDelete.basePrice)}</p>
                    )}
                  </div>
                </div>
                
                {productToDelete.stockLeft > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      <strong>Warning:</strong> This product has {productToDelete.stockLeft} items remaining in stock.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModals}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;