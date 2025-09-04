'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Trash2, Edit, Info } from 'lucide-react';
import Image from 'next/image';
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
  profitPercentage?: number;
  amount: number | string;
  image?: string;
  model?: string;
  lowStock?: number;
}

const Inventory: React.FC = () => {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<InventoryItem | null>(null);
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Utility functions
  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;
  const formatNumberWithCommas = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
  };
  const parseFormattedNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

  // Data loading
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

  // Calculated values
  const filteredInventoryData = inventoryData.filter(item =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );
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

  // Event handlers
  const openModal = (type: 'edit' | 'delete', product: InventoryItem) => {
    if (type === 'edit') {
      setProductToEdit(product);
      setShowEditModal(true);
    } else {
      setProductToDelete(product);
      setShowDeleteModal(true);
    }
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setProductToDelete(null);
    setProductToEdit(null);
  };

  const processAction = async (action: 'delete' | 'update') => {
    const product = action === 'delete' ? productToDelete : productToEdit;
    if (!product) return;
    
    const isDelete = action === 'delete';
    isDelete ? setIsDeleting(true) : setIsUpdating(true);
    
    try {
      let updatedItems;
      let response;
      
      if (isDelete) {
        response = await fetch('/.netlify/functions/inventory', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
        updatedItems = inventoryData.filter(item => item.id !== product.id);
      } else {
        const profitPercentage = product.profitPercentage || 0;
        const calculatedBasePrice = product.unitCost * (1 + profitPercentage / 100);
        const updatedProduct = {
          ...product,
          basePrice: calculatedBasePrice,
          amount: calculatedBasePrice * product.stockLeft
        };
        
        updatedItems = inventoryData.map(item => 
          item.id === product.id ? updatedProduct : item
        );
        
        response = await fetch('/.netlify/functions/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inventory: updatedItems })
        });
      }

      const result = await response.json();
      
      if (result.success) {
        setInventoryData(updatedItems);
        localStorage.setItem('inventoryData', JSON.stringify(updatedItems));
        closeModals();
        alert(`Product "${product.product}" ${isDelete ? 'deleted' : 'updated'} successfully!`);
      } else {
        throw new Error(result.error || `Failed to ${action} product`);
      }
    } catch (error: any) {
      alert(`Failed to ${action} product: ${error.message}`);
    } finally {
      isDelete ? setIsDeleting(false) : setIsUpdating(false);
    }
  };

  const handleNumericInput = (field: 'unitCost' | 'profitPercentage', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!productToEdit) return;
    
    if (field === 'unitCost') {
      const formattedValue = formatNumberWithCommas(e.target.value);
      const numericValue = parseFormattedNumber(formattedValue);
      e.target.value = formattedValue;
      setProductToEdit({ ...productToEdit, [field]: numericValue });
    } else {
      setProductToEdit({ ...productToEdit, [field]: parseFloat(e.target.value) || 0 });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!productToEdit) return;
    
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProductToEdit(prev => prev ? ({ ...prev, image: e.target?.result as string }) : null);
      reader.readAsDataURL(file);
    }
  };

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
          <button onClick={loadInventoryData} className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
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
            className="bg-white rounded-[10px] px-3 py-2.5 flex items-center justify-between border border-gray-200 hover:border-gray-300 w-[193px]"
          >
            <span className="text-gray-700 text-sm">{selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-[10px] shadow-lg z-10">
              {['Today', 'Yesterday', 'Previous days', 'Last week', 'Last month', 'Last year'].map((option) => (
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
        <button onClick={loadInventoryData} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 text-sm">
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
              {['Product', 'Date Added', 'Stock left', 'Unit cost', 'Base Price', 'Amount', 'Actions'].map((header) => (
                <div key={header} className="text-sm font-medium text-gray-600 px-3">{header}</div>
              ))}
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
                  <div className="px-3 flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.product} className="w-8 h-8 bg-gray-200 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{item.product}</span>
                  </div>
                  <div className="px-3 text-sm text-gray-600">{item.dateAdded}</div>
                  <div className="px-3 text-sm text-gray-900">{item.stockLeft}</div>
                  <div className="px-3 text-sm text-gray-900">{formatCurrency(item.unitCost)}</div>
                  <div className="px-3 text-sm text-gray-900">{item.basePrice ? formatCurrency(item.basePrice) : '-'}</div>
                  <div className="px-3 text-sm text-gray-900">{typeof item.amount === 'number' ? formatCurrency(item.amount) : item.amount}</div>
                  <div className="px-3 flex gap-2">
                    <button onClick={() => openModal('edit', item)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => openModal('delete', item)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md">
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
          <div className="bg-white rounded-[32px] p-6 w-[727px] h-[700px] max-h-[90vh] overflow-y-auto">
            <h3 className="mb-6 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Edit Product</h3>
            
            <div className="space-y-6">
              {/* Category and Model Fields */}
              {[
                { label: 'Product category', value: productToEdit.category, field: 'category', placeholder: 'Start typing...', helper: 'To add a category, press enter after typing the name' },
                { label: 'Product model', value: productToEdit.model || '', field: 'model', placeholder: 'Start typing...' }
              ].map(({ label, value, field, placeholder, helper }) => (
                <div key={field}>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setProductToEdit({ ...productToEdit, [field]: e.target.value })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {helper && (
                    <div className="flex items-center gap-2 mt-2">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="font-sora text-xs leading-4 text-[#525866]">{helper}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Product image */}
              <div>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product image</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {productToEdit.image && <Image src={productToEdit.image} alt="Preview" width={100} height={100} className="border border-[#E2E4E9] rounded-[10px] object-cover" />}
                </div>
              </div>

              {/* Unit Cost */}
              <div>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Unit Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={productToEdit.unitCost ? formatNumberWithCommas(productToEdit.unitCost.toString()) : ''}
                    onChange={(e) => handleNumericInput('unitCost', e)}
                    onKeyDown={(e) => {
                      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && e.ctrlKey)) return;
                      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) e.preventDefault();
                    }}
                    className="w-[342px] h-10 rounded-[10px] pl-8 pr-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Profit Percentage */}
              <div>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Profit Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="1000"
                    step="0.1"
                    value={productToEdit.profitPercentage || ''}
                    onChange={(e) => handleNumericInput('profitPercentage', e)}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">%</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="font-sora text-xs leading-4 text-[#525866]">Enter profit margin as percentage (e.g., 25 for 25%)</span>
                </div>
              </div>

              {/* Calculated Base Price Display */}
              <div>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Base Price (Auto-calculated)</label>
                <div className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-gray-50 flex items-center">
                  <span className="text-gray-700 font-medium">
                    {formatCurrency((productToEdit.unitCost || 0) * (1 + (productToEdit.profitPercentage || 0) / 100))}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="font-sora text-xs leading-4 text-[#525866]">
                    Calculation: ₦{(productToEdit.unitCost || 0).toLocaleString()} × (1 + {productToEdit.profitPercentage || 0}%) = {formatCurrency((productToEdit.unitCost || 0) * (1 + (productToEdit.profitPercentage || 0) / 100))}
                  </span>
                </div>
              </div>

              {/* Quantity and Low Stock Fields */}
              {[
                { label: 'Quantity', value: productToEdit.stockLeft, field: 'stockLeft' },
                { label: 'Indicate low-stock', value: productToEdit.lowStock || 8, field: 'lowStock' }
              ].map(({ label, value, field }) => (
                <div key={field}>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setProductToEdit({ ...productToEdit, [field]: parseInt(e.target.value) || 0 })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button onClick={closeModals} disabled={isUpdating} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => processAction('update')}
                disabled={isUpdating}
                className="w-[347px] h-9 rounded-lg p-2 bg-[#375DFB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <span className="font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-center">Update Product</span>
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
            
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
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

            <div className="flex gap-3 justify-end">
              <button onClick={closeModals} disabled={isDeleting} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => processAction('delete')} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
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