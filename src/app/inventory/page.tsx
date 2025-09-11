'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Trash2, Edit, Info, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import InCard from '@/components/products/InCard';
import OutCard from '@/components/products/OutCard';
import InventoryValueCard from '@/components/products/InventoryValueCard';
import LowInStockCard from '@/components/products/LowInStockCard';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast';

interface InventoryItem {
  id: string;
  name: string;           // Changed from 'product' to 'name'
  category: string;
  lastUpdated: string;    // Changed from 'dateAdded' to 'lastUpdated'
  quantity: number;       // Changed from 'stockLeft' to 'quantity'
  unitCost: number;
  basePrice?: number;
  profitPercentage?: number;
  amount: number | string;
  image?: string;
  model?: string;
  lowStockThreshold?: number;  // Changed from 'lowStock' to 'lowStockThreshold'
}

const periods = ['Today', 'Yesterday', 'Previous days', 'Last week', 'Last month', 'Last year'];
const categories = ['All Categories', 'Building Materials', 'Electricals', 'Electronics'];

const Inventory: React.FC = () => {
  // Consolidated state
  const [state, setState] = useState({
  selectedPeriod: 'Today',
  selectedCategory: 'All Categories',
  dropdownOpen: false,
  categoryDropdownOpen: false,
  searchQuery: '',
  inventoryData: [] as InventoryItem[],
  transactionData: [] as any[],
  loading: true,
  error: null as string | null,
  showDeleteModal: false,
  showEditModal: false,
  productToDelete: null as InventoryItem | null,
  productToEdit: null as InventoryItem | null,
  isDeleting: false,
  isUpdating: false,
  lowStockDropdownOpen: false,
  highlightedItemId: null as string | null,
});

const tableContainerRef = useRef<HTMLDivElement>(null);

  // Utility functions
  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;
  const formatNumberWithCommas = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
  };
  const parseFormattedNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

  // Scroll to specific item in table
  const scrollToItem = (itemId: string) => {
    updateState({ highlightedItemId: itemId, lowStockDropdownOpen: false });
    
    setTimeout(() => {
      const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
      if (itemElement && tableContainerRef.current) {
        itemElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        updateState({ highlightedItemId: null });
      }, 3000);
    }, 100);
  };

  // Update state helper
  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

  // Data loading
  const loadInventoryData = async () => {
    try {
      updateState({ loading: true, error: null });

      const [inventoryResponse, transactionResponse] = await Promise.all([
  fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
    headers: { 
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
    }
  }),
  fetch('https://gnc-inventory-backend.onrender.com/api/sales', {
    headers: { 
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
    }
  })
]);

      let inventoryData = [];
      let transactionData = [];

      if (inventoryResponse.ok) {
        const result = await inventoryResponse.json();
        if (result.success) {
          inventoryData = result.data || [];
          localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        }
      }

      if (transactionResponse.ok) {
        const result = await transactionResponse.json();
        if (result.success) {
          transactionData = result.data || [];
          localStorage.setItem('transactionData', JSON.stringify(transactionData));
        }
      }

      // Fallback to localStorage if API fails
      if (!inventoryResponse.ok || !transactionResponse.ok) {
        const localInventory = localStorage.getItem('inventoryData');
        const localTransactions = localStorage.getItem('transactionData');
        if (localInventory) inventoryData = JSON.parse(localInventory);
        if (localTransactions) transactionData = JSON.parse(localTransactions);
      }

  // Transform the data to match your interface
// Transform the data to match your interface
const transformedInventoryData = inventoryData.map((item: any) => {
  console.log('Transforming item:', item);
  console.log('Item image data:', item.product?.imageUrl);
  return {
    id: item.id?.toString() || '',
    name: item.product?.name || '',                    
    category: item.product?.category || '',            
    lastUpdated: item.lastUpdated || '',        
    quantity: item.quantity || 0,              
    unitCost: item.product?.unitCost || 0,             // Added: from product object
    basePrice: item.product?.basePrice || 0,          // Added: from product object
    profitPercentage: item.profitPercentage || 0,
    amount: (item.product?.basePrice || 0) * (item.quantity || 0), // Calculate amount
    image: item.product?.imageUrl || '',                  // Added: from product object
    model: item.product?.model || '',                  
    lowStockThreshold: item.lowStockThreshold || 5
  };
});

console.log('Transformed data:', transformedInventoryData);

updateState({ inventoryData: transformedInventoryData, transactionData });
      // ADD DEBUGGING HERE:
console.log('Inventory data:', inventoryData);
console.log('First item:', inventoryData[0]);
console.log('Total items loaded:', inventoryData.length);

    } catch (err) {
      updateState({ error: 'Failed to load data' });
      const localInventory = localStorage.getItem('inventoryData');
      const localTransactions = localStorage.getItem('transactionData');
      if (localInventory) updateState({ inventoryData: JSON.parse(localInventory) });
      if (localTransactions) updateState({ transactionData: JSON.parse(localTransactions) });
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  // Calculated values
  const filteredInventoryData = state.inventoryData.filter(item => {
  const matchesSearch = item.name ? item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) : false;
  const matchesCategory = state.selectedCategory === 'All Categories' || item.category === state.selectedCategory;
  return matchesSearch && matchesCategory;
});

// ADD THIS DEBUGGING:
console.log('Raw inventory data:', state.inventoryData);
console.log('Filtered inventory data:', filteredInventoryData);
console.log('Search query:', state.searchQuery);
console.log('Selected category:', state.selectedCategory);
console.log('First filtered item:', filteredInventoryData[0]);

  // Calculated values - now filtered by selected category
  const categoryFilteredData = state.inventoryData.filter(item => 
    state.selectedCategory === 'All Categories' || item.category === state.selectedCategory
  );

  const categoryFilteredTransactions = state.transactionData.filter(transaction =>
    transaction.items.some((item: any) => 
      state.selectedCategory === 'All Categories' || item.category === state.selectedCategory
    )
  );
  const stats = {
    totalItems: categoryFilteredData.length,
    totalValue: categoryFilteredData.reduce((sum, item) => 
      sum + (typeof item.amount === 'number' ? item.amount : 0), 0),
    lowStockItems: categoryFilteredData.filter(item => item.quantity <= 5).length,
    totalItemsSold: categoryFilteredTransactions.reduce((sum, transaction) => 
      sum + transaction.items.reduce((itemSum: number, item: any) => {
        if (state.selectedCategory === 'All Categories' || item.category === state.selectedCategory) {
          return itemSum + item.quantity;
        }
        return itemSum;
      }, 0), 0),
    totalSalesRevenue: categoryFilteredTransactions.reduce((sum, transaction) => {
      const categoryRevenue = transaction.items.reduce((itemSum: number, item: any) => {
        if (state.selectedCategory === 'All Categories' || item.category === state.selectedCategory) {
          return itemSum + (item.price * item.quantity || 0);
        }
        return itemSum;
      }, 0);
      return sum + categoryRevenue;
    }, 0),
    currentInventoryValue: categoryFilteredData.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
  };

  // Event handlers
  const openModal = (type: 'edit' | 'delete', product: InventoryItem) => {
    if (type === 'edit') {
      updateState({ productToEdit: product, showEditModal: true });
    } else {
      updateState({ productToDelete: product, showDeleteModal: true });
    }
  };

  const closeModals = () => {
    updateState({ 
      showDeleteModal: false, 
      showEditModal: false, 
      productToDelete: null, 
      productToEdit: null 
    });
  };

  const processAction = async (action: 'delete' | 'update') => {
    const product = action === 'delete' ? state.productToDelete : state.productToEdit;
    if (!product) return;
    
    const isDelete = action === 'delete';
    updateState({ [isDelete ? 'isDeleting' : 'isUpdating']: true });
    
    const loadingToastId = showLoadingToast(isDelete ? 'Deleting product...' : 'Updating product...');
    
    try {

       // ADD DEBUGGING HERE:
      console.log('API Key:', process.env.NEXT_PUBLIC_API_KEY);
      console.log('Making request to:', `https://gnc-inventory-backend.onrender.com/api/admin/inventory/${product.id}`);
         
      let updatedItems;
      let response;
      
      if (isDelete) {
  const productId = parseInt(product.id);
  console.log('Original product ID:', product.id, 'Type:', typeof product.id);
  console.log('Converted product ID:', productId, 'Type:', typeof productId);
  
  response = await fetch(`https://gnc-inventory-backend.onrender.com/api/admin/inventory/${productId}`, {
    method: 'DELETE',
    headers: { 
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
    }
  });
  updatedItems = state.inventoryData.filter(item => item.id !== product.id);
      } else {
  const profitPercentage = product.profitPercentage || 0;
  const calculatedBasePrice = product.unitCost * (1 + profitPercentage / 100);
  
  // Structure the data to match what the backend expects
  const updatePayload = {
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    product: {
      name: product.name,
      category: product.category,
      model: product.model,
      unitCost: product.unitCost,
      basePrice: calculatedBasePrice,
      imageUrl: product.image || null
    }
  };
  
  const updatedProduct = {
    ...product,
    basePrice: calculatedBasePrice,
    amount: calculatedBasePrice * product.quantity
  };
  
  updatedItems = state.inventoryData.map(item => 
    item.id === product.id ? updatedProduct : item
  );
  
  response = await fetch(`https://gnc-inventory-backend.onrender.com/api/admin/inventory/${product.id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
    },
    body: JSON.stringify(updatePayload)
  });
}

      const result = await response.json();
      dismissToast(loadingToastId);
      
      if (result.success) {
        updateState({ inventoryData: updatedItems });
        localStorage.setItem('inventoryData', JSON.stringify(updatedItems));
        closeModals();
        showSuccessToast(`Product "${product.name}" ${isDelete ? 'deleted' : 'updated'} successfully!`);
      } else {
        throw new Error(result.error || `Failed to ${action} product`);
      }
    } catch (error: any) {
      dismissToast(loadingToastId);
      showErrorToast(`Failed to ${action} product: ${error.message}`);
    } finally {
      updateState({ [isDelete ? 'isDeleting' : 'isUpdating']: false });
    }
  };

  const handleNumericInput = (field: 'unitCost' | 'profitPercentage', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.productToEdit) return;
    
    if (field === 'unitCost') {
      const formattedValue = formatNumberWithCommas(e.target.value);
      const numericValue = parseFormattedNumber(formattedValue);
      e.target.value = formattedValue;
      updateState({ productToEdit: { ...state.productToEdit, [field]: numericValue } });
    } else {
      updateState({ productToEdit: { ...state.productToEdit, [field]: parseFloat(e.target.value) || 0 } });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.productToEdit) return;
    
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => updateState({ 
        productToEdit: state.productToEdit ? ({ ...state.productToEdit, image: e.target?.result as string }) : null 
      });
      reader.readAsDataURL(file);
    }
  };

  // Dropdown component
  const Dropdown = ({ 
    options, 
    selected, 
    onSelect, 
    isOpen, 
    onToggle 
  }: {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="bg-white rounded-[10px] px-3 py-2.5 flex items-center justify-between border border-gray-200 hover:border-gray-300 w-[193px]"
      >
        <span className="text-gray-700 text-sm">{selected}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-[10px] shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                onToggle();
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-[10px] last:rounded-b-[10px]"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

// Low Stock Dropdown Component
  const LowStockDropdown = ({ lowStockItems }: { lowStockItems: InventoryItem[] }) => (
    <div className="relative w-full h-full">
      <button
        onClick={() => updateState({ lowStockDropdownOpen: !state.lowStockDropdownOpen })}
        className="w-full h-full flex flex-col items-start justify-center p-4 hover:bg-gray-50 transition-colors rounded-[32px]"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Low in stock</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{lowStockItems.length}</span>
          <span className="text-sm text-gray-600">items</span>
          {state.lowStockDropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          )}
        </div>
      </button>

      {state.lowStockDropdownOpen && lowStockItems.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-[20px] shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">Low Stock Items</span>
          </div>
          
          <div className="p-2">
            {lowStockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToItem(item.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-8 h-8 bg-gray-200 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                
                <span className="text-sm text-red-600 font-medium">{item.quantity} left</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (state.loading) {
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
      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{state.error}</p>
          <button onClick={loadInventoryData} className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      

      {/* Header with Filters */}
      <div className="mb-6 flex items-center gap-4">
        <p className="text-gray-600">Showing</p>
        
        {/* Date Filter */}
        <Dropdown
          options={periods}
          selected={state.selectedPeriod}
          onSelect={(period) => updateState({ selectedPeriod: period })}
          isOpen={state.dropdownOpen}
          onToggle={() => updateState({ dropdownOpen: !state.dropdownOpen })}
        />

        {/* Category Filter */}
        <Dropdown
          options={categories}
          selected={state.selectedCategory}
          onSelect={(category) => updateState({ selectedCategory: category })}
          isOpen={state.categoryDropdownOpen}
          onToggle={() => updateState({ categoryDropdownOpen: !state.categoryDropdownOpen })}
        />

        <button onClick={loadInventoryData} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 text-sm">
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <InCard itemCount={stats.totalItems} totalValue={stats.totalValue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <OutCard itemCount={stats.totalItemsSold} totalValue={stats.totalSalesRevenue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px] p-6">
          <InventoryValueCard itemCount={stats.totalItems} totalValue={stats.currentInventoryValue} />
        </div>
        <div className="w-[258px] h-[172px] bg-white rounded-[32px]">
          <LowStockDropdown lowStockItems={categoryFilteredData.filter(item => item.quantity <= 5)} />
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
              value={state.searchQuery}
              onChange={(e) => updateState({ searchQuery: e.target.value })}
              className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <h2 className="font-medium text-lg text-[#0A0D14] mb-4">Inventory</h2>

        <div className="overflow-x-auto">
{/* Table Header */}
          <div className="w-[1056px] h-11 rounded-[20px] bg-[#F6F8FA] mb-2 flex items-center">
            <div className="grid items-center h-full w-full" style={{ gridTemplateColumns: '220px 140px 150px 90px 110px 110px 120px 116px' }}>
              <div className="text-sm font-medium text-gray-600 pl-8">Product</div>
              <div className="text-sm font-medium text-gray-600 ml-1">Category</div>
              <div className="text-sm font-medium text-gray-600 px-3">Date Added</div>
              <div className="text-sm font-medium text-gray-600 pr-3 pl-1">Stock left</div>
              <div className="text-sm font-medium text-gray-600 px-2">Unit cost</div>
              <div className="text-sm font-medium text-gray-600 px-1">Base Price</div>
              <div className="text-sm font-medium text-gray-600 px-3">Amount</div>
              <div className="text-sm font-medium text-gray-600 px-3">Actions</div>
            </div>
          </div>

          {/* Table Rows */}
          <div 
  ref={tableContainerRef}
  className="space-y-1 max-h-[400px] overflow-y-auto overflow-x-hidden"
  style={{
    scrollbarWidth: 'thin',
    scrollbarColor: '#d1d5db #f3f4f6'
  }}
>
            {filteredInventoryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {state.searchQuery || state.selectedCategory !== 'All Categories' 
                  ? 'No items found matching your filters.' 
                  : 'No inventory items found. Add products to get started.'}
              </div>
            ) : (
              filteredInventoryData.map((item) => (
                <div 
  key={item.id} 
  data-item-id={item.id}
  className={`grid items-center py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
    state.highlightedItemId === item.id ? 'bg-blue-50 border-blue-200' : ''
  }`} 
  style={{ gridTemplateColumns: '220px 140px 150px 90px 110px 110px 120px 116px' }}
>
                  <div className="pl-6 flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-8 h-8 bg-gray-200 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="pl-1 text-sm text-gray-600">{item.category}</div>
                  <div className="px-3 text-sm text-gray-600">{item.lastUpdated}</div>
                  <div className="pl-6 text-sm text-gray-900">{item.quantity}</div>
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
      {state.showEditModal && state.productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] w-[727px] h-[700px] max-h-[90vh] overflow-hidden">
            <div 
              className="p-6 h-full overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
                >
            <h3 className="mb-6 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Edit Product</h3>
            
            <div className="space-y-6">
              {/* Form Fields */}
              {[
                { label: 'Product category', value: state.productToEdit.category, field: 'category', placeholder: 'Start typing...', helper: 'To add a category, press enter after typing the name' },
                { label: 'Product name', value: state.productToEdit.name, field: 'name', placeholder: 'Enter product name...' },
                { label: 'Product model', value: state.productToEdit.model || '', field: 'model', placeholder: 'Start typing...' }
              ].map(({ label, value, field, placeholder, helper }) => (
                <div key={field}>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, [field]: e.target.value } })}
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
                  {state.productToEdit.image && <Image src={state.productToEdit.image} alt="Preview" width={100} height={100} className="border border-[#E2E4E9] rounded-[10px] object-cover" />}
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
                    value={state.productToEdit.unitCost ? formatNumberWithCommas(state.productToEdit.unitCost.toString()) : ''}
                    onChange={(e) => handleNumericInput('unitCost', e)}
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
                    value={state.productToEdit.profitPercentage || ''}
                    onChange={(e) => handleNumericInput('profitPercentage', e)}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">%</span>
                </div>
              </div>

              {/* Calculated Base Price */}
              <div>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Base Price (Auto-calculated)</label>
                <div className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-gray-50 flex items-center">
                  <span className="text-gray-700 font-medium">
                    {formatCurrency((state.productToEdit.unitCost || 0) * (1 + (state.productToEdit.profitPercentage || 0) / 100))}
                  </span>
                </div>
              </div>

              {/* Quantity and Low Stock */}
              {[
                { label: 'Quantity', value: state.productToEdit.quantity, field: 'quantity' },
                { label: 'Indicate low-stock', value: state.productToEdit.lowStockThreshold || 8, field: 'lowStockThreshold' }
              ].map(({ label, value, field }) => (
                <div key={field}>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, [field]: parseInt(e.target.value) || 0 } })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button onClick={closeModals} disabled={state.isUpdating} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={() => processAction('update')}
                disabled={state.isUpdating}
                className="w-[347px] h-9 rounded-lg p-2 bg-[#375DFB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {state.isUpdating ? (
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
         </div>
      )}

      {/* Delete Modal */}
      {state.showDeleteModal && state.productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
            
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {state.productToDelete.image ? (
                  <img src={state.productToDelete.image} alt={state.productToDelete.name} className="w-12 h-12 bg-gray-200 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{state.productToDelete.name}</p>
                  <p className="text-sm text-gray-500">Unit Cost: {formatCurrency(state.productToDelete.unitCost)}</p>
                  {state.productToDelete.basePrice && (
                    <p className="text-sm text-gray-500">Base Price: {formatCurrency(state.productToDelete.basePrice)}</p>
                  )}
                </div>
              </div>
              
              {state.productToDelete.quantity > 0 && (
  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
    <p className="text-sm text-orange-800">
      <strong>Warning:</strong> This product has {state.productToDelete.quantity} items remaining in stock.
    </p>
  </div>
)}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModals} disabled={state.isDeleting} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => processAction('delete')} disabled={state.isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {state.isDeleting ? (
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