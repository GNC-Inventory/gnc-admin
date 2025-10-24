'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Trash2, Edit, Info, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import InCard from '@/components/products/InCard';
import OutCard from '@/components/products/OutCard';
import InventoryValueCard from '@/components/products/InventoryValueCard';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '@/utils/toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  lastUpdated: string;
  quantity: number;
  unitCost: number;
  basePrice?: number;
  profitPercentage?: number;
  amount: number | string;
  image?: string;
  model?: string;
  lowStockThreshold?: number;
  make?: string;      
  type?: string;
  size?: string;       
  capacity?: string;  
  description?: string; 
}

const periods = ['Today', 'Yesterday', 'Previous days', 'Last week', 'Last month', 'Last year'];
const categories = ['All Categories', 'Building Materials', 'Electricals', 'Electronics'];
const categoryOptions = ['Building Materials', 'Electricals', 'Electronics'];

const Inventory: React.FC = () => {
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

  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;
  const formatNumberWithCommas = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
  };
  const parseFormattedNumber = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

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
      
      setTimeout(() => {
        updateState({ highlightedItemId: null });
      }, 3000);
    }, 100);
  };

  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

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

      if (!inventoryResponse.ok || !transactionResponse.ok) {
        const localInventory = localStorage.getItem('inventoryData');
        const localTransactions = localStorage.getItem('transactionData');
        if (localInventory) inventoryData = JSON.parse(localInventory);
        if (localTransactions) transactionData = JSON.parse(localTransactions);
      }

const transformedInventoryData = inventoryData.map((item: any) => {
  console.log('Transforming item:', item);
  console.log('Item image data:', item.product?.imageUrl);
  return {
    id: item.id?.toString() || '',
    name: item.product?.name || '',                    
    category: item.product?.category || '',            
    lastUpdated: item.lastUpdated || '',        
    quantity: item.quantity || 0,              
    unitCost: item.product?.unitCost || 0,
    basePrice: item.product?.basePrice || 0,
    profitPercentage: item.profitPercentage || 0,
    amount: (item.product?.unitCost || 0) * (item.quantity || 0),
    image: item.product?.imageUrl || '',
    model: item.product?.model || '',                  
    lowStockThreshold: item.lowStockThreshold || 5,
    make: item.product?.make || '',
    type: item.product?.type || '',
    size: item.product?.size || '',
    capacity: item.product?.capacity || '',
    description: item.product?.description || '',
  };
});

console.log('Transformed data:', transformedInventoryData);

updateState({ inventoryData: transformedInventoryData, transactionData });
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

  const filteredInventoryData = state.inventoryData.filter(item => {
  const matchesSearch = item.name ? item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) : false;
  const matchesCategory = state.selectedCategory === 'All Categories' || item.category === state.selectedCategory;
  return matchesSearch && matchesCategory;
});

console.log('Raw inventory data:', state.inventoryData);
console.log('Filtered inventory data:', filteredInventoryData);
console.log('Search query:', state.searchQuery);
console.log('Selected category:', state.selectedCategory);
console.log('First filtered item:', filteredInventoryData[0]);

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
    totalValue: categoryFilteredData.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0),
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
        // Use manually edited basePrice if available, otherwise calculate it
        const basePrice = product.basePrice || (product.unitCost * (1 + (product.profitPercentage || 0) / 100));
        
        const updatedProduct = {
          ...product,
          basePrice: basePrice,
          amount: product.unitCost * product.quantity
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
  body: JSON.stringify(updatedProduct)
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

  const handleNumericInput = (field: 'unitCost' | 'profitPercentage' | 'basePrice', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.productToEdit) return;
    
    if (field === 'unitCost' || field === 'basePrice') {
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
          {lowStockItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToItem(item.id)}
              className="w-full p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{item.quantity}</p>
                  <p className="text-xs text-gray-500">in stock</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const lowStockItems = state.inventoryData.filter(item => item.quantity <= (item.lowStockThreshold || 5));

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora text-[32px] font-bold leading-[40.32px] text-left text-[#0A0D14]">
          Inventory
        </h1>
        <button 
          onClick={() => window.location.href = '/inventory/add-product'}
          className="bg-[#375DFB] text-white font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-center px-3.5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <InCard itemCount={stats.totalItems} totalValue={stats.totalValue} />
        <OutCard itemCount={stats.totalItemsSold} totalValue={stats.totalSalesRevenue} />
        <InventoryValueCard itemCount={stats.totalItems} totalValue={stats.currentInventoryValue} />
        <div className="bg-white rounded-[32px] border border-[#E2E4E9] shadow-sm">
          <LowStockDropdown lowStockItems={lowStockItems} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={state.searchQuery}
            onChange={(e) => updateState({ searchQuery: e.target.value })}
            className="w-full sm:w-[342px] pl-10 pr-4 py-2.5 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-3">
          <Dropdown
            options={categories}
            selected={state.selectedCategory}
            onSelect={(category) => updateState({ selectedCategory: category })}
            isOpen={state.categoryDropdownOpen}
            onToggle={() => updateState({ categoryDropdownOpen: !state.categoryDropdownOpen })}
          />
        </div>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className="bg-white rounded-[32px] border border-[#E2E4E9] overflow-hidden shadow-sm">
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredInventoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E4E9]">
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">PRODUCTS</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">CATEGORY</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">LAST UPDATED</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">UNIT COST</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">BASE PRICE</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">QTY</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">AMOUNT</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-xs leading-4 tracking-[0.5px] text-[#525866]">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventoryData.map((item) => (
                  <tr 
                    key={item.id} 
                    data-item-id={item.id}
                    className={`border-b border-[#E2E4E9] hover:bg-gray-50 transition-colors ${
                      state.highlightedItemId === item.id ? 'bg-blue-50 animate-pulse' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <span className="font-inter font-medium text-sm leading-5 text-[#0A0D14]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-inter text-sm leading-5 text-[#525866]">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-inter text-sm leading-5 text-[#525866]">
                        {new Date(item.lastUpdated).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-inter font-medium text-sm leading-5 text-[#0A0D14]">
                        {formatCurrency(item.unitCost)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-inter font-medium text-sm leading-5 text-[#0A0D14]">
                        {item.basePrice ? formatCurrency(item.basePrice) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-inter font-medium text-sm leading-5 ${
                        item.quantity <= (item.lowStockThreshold || 5) ? 'text-red-600' : 'text-[#0A0D14]'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-inter font-medium text-sm leading-5 text-[#0A0D14]">
                        {formatCurrency(typeof item.amount === 'number' ? item.amount : parseFloat(item.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('edit', item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('delete', item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {state.showEditModal && state.productToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="font-inter font-semibold text-2xl leading-8 text-[#0A0D14] mb-6">Edit Product</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product Name</label>
                  <input
                    type="text"
                    value={state.productToEdit.name}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, name: e.target.value } })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Category</label>
                  <select
                    value={state.productToEdit.category}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, category: e.target.value } })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Fields */}
                {[
                  { label: 'Make', field: 'make' },
                  { label: 'Model', field: 'model' },
                  { label: 'Type', field: 'type' },
                  { label: 'Size', field: 'size' },
                  { label: 'Capacity', field: 'capacity' }
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label} (Optional)</label>
                    <input
                      type="text"
                      value={(state.productToEdit as any)[field] || ''}
                      onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, [field]: e.target.value } })}
                      className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Description (Optional)</label>
                  <textarea
                    value={state.productToEdit.description || ''}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, description: e.target.value } })}
                    rows={4}
                    className="w-[342px] rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

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
                      value={state.productToEdit.profitPercentage || ''}
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

                {/* Base Price (Editable) */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                    Base Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={state.productToEdit.basePrice ? formatNumberWithCommas(state.productToEdit.basePrice.toString()) : ''}
                      onChange={(e) => handleNumericInput('basePrice', e)}
                      onKeyDown={(e) => {
                        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && e.ctrlKey)) return;
                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) e.preventDefault();
                      }}
                      className="w-[342px] h-10 rounded-[10px] pl-8 pr-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span className="font-sora text-xs leading-4 text-[#525866]">
                      Auto-calculated: {formatCurrency((state.productToEdit.unitCost || 0) * (1 + (state.productToEdit.profitPercentage || 0) / 100))}
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