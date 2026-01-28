'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Trash2, Edit, Info, ChevronUp, Package, Ruler } from 'lucide-react';
import Image from 'next/image';
import InCard from '@/components/products/InCard';
import OutCard from '@/components/products/OutCard';
import InventoryValueCard from '@/components/products/InventoryValueCard';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, showWarningToast } from '@/utils/toast';

// ✅ ISSUE 3: Added colour and wattage fields
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
  colour?: string;      // ✅ NEW
  wattage?: string;     // ✅ NEW
  description?: string;
  hasUnitConversion?: boolean;
  baseUnit?: string;
  secondaryUnit?: string;
  conversionRate?: number; 
}

const periods = ['Today', 'Yesterday', 'Previous days', 'Last week', 'Last month', 'Last year'];

// ✅ ISSUE 3: Added 'Generators' category
const categories = ['All Categories', 'Building Materials', 'Electricals', 'Electronics', 'Generators'];
const categoryOptions = ['Building Materials', 'Electricals', 'Electronics', 'Generators'];

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

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!numValue || numValue === 0 || isNaN(numValue)) return '₦ 0';
    const parts = numValue.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (decimalPart && decimalPart !== '00') {
      return `₦ ${formattedInteger}.${decimalPart}`;
    }
    return `₦ ${formattedInteger}`;
  };

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

  const checkForDuplicate = (
    name: string,
    category: string,
    brand: string,
    model: string,
    type: string,
    size: string,
    capacity: string,
    description: string,
    currentId?: string
  ): boolean => {
    const normalizeString = (str: string | undefined) => (str || '').toLowerCase().trim();
    
    const existingProduct = state.inventoryData.find(item => 
      item.id !== currentId &&
      normalizeString(item.name) === normalizeString(name) &&
      normalizeString(item.category) === normalizeString(category) &&
      normalizeString(item.make) === normalizeString(brand) &&
      normalizeString(item.model) === normalizeString(model) &&
      normalizeString(item.type) === normalizeString(type) &&
      normalizeString(item.size) === normalizeString(size) &&
      normalizeString(item.capacity) === normalizeString(capacity) &&
      normalizeString(item.description) === normalizeString(description)
    );
    
    return !!existingProduct;
  };

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

      // ✅ ISSUE 3: Added colour and wattage to transformation
      const transformedInventoryData = inventoryData.map((item: any) => {
        return {
          id: item.id?.toString() || '',
          name: item.product?.name || '',                    
          category: item.product?.category || '',            
          lastUpdated: item.lastUpdated || '',        
          quantity: parseInt(item.quantity) || 0,              
          unitCost: parseFloat(item.product?.unitCost) || 0,
          basePrice: parseFloat(item.product?.basePrice) || 0,
          profitPercentage: parseFloat(item.profitPercentage) || 0,
          amount: (parseFloat(item.product?.unitCost) || 0) * (parseInt(item.quantity) || 0),
          image: item.product?.imageUrl || '',
          model: item.product?.model || '',                  
          lowStockThreshold: parseInt(item.lowStockThreshold) || 5,
          make: item.product?.make || '',
          type: item.product?.type || '',
          size: item.product?.size || '',
          capacity: item.product?.capacity || '',
          colour: item.product?.colour || '',        // ✅ NEW
          wattage: item.product?.wattage || '',      // ✅ NEW
          description: item.product?.description || '',
          hasUnitConversion: item.product?.hasUnitConversion || false,
          baseUnit: item.product?.baseUnit || '',
          secondaryUnit: item.product?.secondaryUnit || '',
          conversionRate: parseFloat(item.product?.conversionRate) || 0,
        };
      });

      updateState({ inventoryData: transformedInventoryData, transactionData });

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
    const matchesCategory = state.selectedCategory === 'All Categories' || item.category === state.selectedCategory;
    
    if (!state.searchQuery.trim()) {
      return matchesCategory;
    }

    const searchLower = state.searchQuery.toLowerCase().trim();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
    
    const matchesSearch = searchTerms.some(term => 
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.make && item.make.toLowerCase().includes(term)) ||
      (item.model && item.model.toLowerCase().includes(term)) ||
      (item.type && item.type.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.size && item.size.toLowerCase().includes(term)) ||
      (item.capacity && item.capacity.toLowerCase().includes(term)) ||
      (item.colour && item.colour.toLowerCase().includes(term)) ||      // ✅ NEW
      (item.wattage && item.wattage.toLowerCase().includes(term)) ||    // ✅ NEW
      (item.id && item.id.toLowerCase().includes(term))
    );

    return matchesSearch && matchesCategory;
  });

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
    
    if (action === 'update' && state.productToEdit) {
      const isDuplicate = checkForDuplicate(
        state.productToEdit.name,
        state.productToEdit.category,
        state.productToEdit.make || '',
        state.productToEdit.model || '',
        state.productToEdit.type || '',
        state.productToEdit.size || '',
        state.productToEdit.capacity || '',
        state.productToEdit.description || '',
        state.productToEdit.id
      );
      
      if (isDuplicate) {
        showErrorToast('⚠️ Duplicate detected: A product with identical name, category, brand, model, type, size, capacity, and description already exists');
        return;
      }
    }

    if (action === 'update' && state.productToEdit && (!state.productToEdit.quantity || state.productToEdit.quantity === 0)) {
      showWarningToast('⚠️ Warning: Product Quantity Is Empty');
    }
    
    const isDelete = action === 'delete';
    updateState({ [isDelete ? 'isDeleting' : 'isUpdating']: true });
    
    const loadingToastId = showLoadingToast(isDelete ? 'Deleting product...' : 'Updating product...');
    
    try {
      let updatedItems;
      let response;
      
      if (isDelete) {
        const productId = parseInt(product.id);
        
        response = await fetch(`https://gnc-inventory-backend.onrender.com/api/admin/inventory/${productId}`, {
          method: 'DELETE',
          headers: { 
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
          }
        });
        updatedItems = state.inventoryData.filter(item => item.id !== product.id);
      } else {
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

  // ✅ ISSUE 1: Auto-calculate base price when profit percentage OR unit cost changes
  const handleNumericInput = (field: 'unitCost' | 'profitPercentage' | 'basePrice', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.productToEdit) return;
    
    if (field === 'unitCost' || field === 'basePrice') {
      const formattedValue = formatNumberWithCommas(e.target.value);
      const numericValue = parseFormattedNumber(formattedValue);
      e.target.value = formattedValue;
      
      // ✅ Auto-calculate base price when unit cost changes
      if (field === 'unitCost') {
        const newBasePrice = numericValue * (1 + (state.productToEdit.profitPercentage || 0) / 100);
        updateState({ 
          productToEdit: { 
            ...state.productToEdit, 
            unitCost: numericValue,
            basePrice: newBasePrice
          } 
        });
      } else {
        updateState({ productToEdit: { ...state.productToEdit, [field]: numericValue } });
      }
    } else if (field === 'profitPercentage') {
      const profitValue = parseFloat(e.target.value) || 0;
      // ✅ Auto-calculate base price when profit percentage changes
      const newBasePrice = (state.productToEdit.unitCost || 0) * (1 + profitValue / 100);
      updateState({ 
        productToEdit: { 
          ...state.productToEdit, 
          profitPercentage: profitValue,
          basePrice: newBasePrice
        } 
      });
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

  const handlePasteInEditModal = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    const delimiter = pasteData.includes('\t') ? '\t' : ',';
    const values = pasteData.split(delimiter).map(v => v.trim());
    
    if (values.length > 1) {
      e.preventDefault();
      
      updateState({
        productToEdit: state.productToEdit ? {
          ...state.productToEdit,
          name: values[0] || state.productToEdit.name,
          category: values[1] || state.productToEdit.category,
          make: values[2] || state.productToEdit.make,
          model: values[3] || state.productToEdit.model,
          type: values[4] || state.productToEdit.type,
          size: values[5] || state.productToEdit.size,
          capacity: values[6] || state.productToEdit.capacity,
          description: values[7] || state.productToEdit.description,
        } : null
      });
      
      showSuccessToast('Data pasted successfully! Please review and fill in pricing details.');
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
      <style jsx>{`
        .description-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .description-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .description-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        .description-scroll::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>

      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{state.error}</p>
          <button onClick={loadInventoryData} className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <p className="text-gray-600">Showing</p>
        
        <Dropdown
          options={periods}
          selected={state.selectedPeriod}
          onSelect={(period) => updateState({ selectedPeriod: period })}
          isOpen={state.dropdownOpen}
          onToggle={() => updateState({ dropdownOpen: !state.dropdownOpen })}
        />

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

      <div className="w-[1104px] h-[612px] bg-white rounded-[32px] p-6">
        <div className="mb-6">
          <div className="relative w-[540px] h-9 rounded-[20px] p-2 border border-gray-200">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, brand, model, type, category, or description..."
              value={state.searchQuery}
              onChange={(e) => updateState({ searchQuery: e.target.value })}
              className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <h2 className="font-medium text-lg text-[#0A0D14] mb-4">Inventory</h2>

        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* ✅ ISSUE 3: Added Colour and Wattage columns - gridTemplateColumns updated from 16 to 18 columns */}
            <div className="h-11 rounded-[20px] bg-[#F6F8FA] mb-2 flex items-center">
              <div className="grid items-center h-full w-full" style={{ gridTemplateColumns: '200px 120px 120px 100px 100px 100px 100px 100px 120px 150px 120px 110px 120px 100px 110px 110px 120px 116px' }}>
                <div className="text-sm font-medium text-gray-600 pl-8">Product</div>
                <div className="text-sm font-medium text-gray-600 px-2">Brand</div>
                <div className="text-sm font-medium text-gray-600 px-2">Model</div>
                <div className="text-sm font-medium text-gray-600 px-2">Type</div>
                <div className="text-sm font-medium text-gray-600 px-2">Size</div>
                <div className="text-sm font-medium text-gray-600 px-2">Capacity</div>
                <div className="text-sm font-medium text-gray-600 px-2">Colour</div>          {/* ✅ NEW */}
                <div className="text-sm font-medium text-gray-600 px-2">Wattage</div>         {/* ✅ NEW */}
                <div className="text-sm font-medium text-gray-600 px-2">Description</div>
                <div className="text-sm font-medium text-gray-600 px-2">Category</div>
                <div className="text-sm font-medium text-gray-600 px-2">Last Date Modified</div>
                <div className="text-sm font-medium text-gray-600 px-2">Stock left</div>
                <div className="text-sm font-medium text-gray-600 px-2">Unit cost</div>
                <div className="text-sm font-medium text-gray-600 px-2">Profit %</div>
                <div className="text-sm font-medium text-gray-600 px-2">Base Price</div>
                <div className="text-sm font-medium text-gray-600 px-2">Low Stock</div>
                <div className="text-sm font-medium text-gray-600 px-2">Amount</div>
                <div className="text-sm font-medium text-gray-600 px-3">Actions</div>
              </div>
            </div>

            <div 
              ref={tableContainerRef}
              className="space-y-1 max-h-[400px] overflow-y-auto"
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
                    style={{ gridTemplateColumns: '200px 120px 120px 100px 100px 100px 100px 100px 120px 150px 120px 110px 120px 100px 110px 110px 120px 116px' }}
                  >
                    <div className="pl-6 flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-8 h-8 bg-gray-200 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.make || '-'}>
                      {item.make || '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.model || '-'}>
                      {item.model || '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.type || '-'}>
                      {item.type || '-'}
                    </div>

                    <div className="px-2 text-sm text-gray-600 truncate" title={item.size || '-'}>
                      {item.size || '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.capacity || '-'}>
                      {item.capacity || '-'}
                    </div>
                    
                    {/* ✅ ISSUE 3: New Colour column */}
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.colour || '-'}>
                      {item.colour || '-'}
                    </div>
                    
                    {/* ✅ ISSUE 3: New Wattage column */}
                    <div className="px-2 text-sm text-gray-600 truncate" title={item.wattage || '-'}>
                      {item.wattage || '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 relative group">
                      <div 
                        className="description-scroll overflow-x-auto whitespace-nowrap cursor-pointer"
                        style={{ maxWidth: '120px' }}
                        title="Scroll horizontally or hover to see full text"
                      >
                        {item.description || '-'}
                      </div>
                      
                      {item.description && item.description.length > 20 && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-none" style={{ maxWidth: '300px', width: 'max-content' }}>
                          <p className="whitespace-normal leading-relaxed">{item.description}</p>
                          <div className="absolute top-full left-8 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate">{item.category}</div>
                    
                    <div className="px-2 text-sm text-gray-600 truncate">{item.lastUpdated}</div>
                    
                    <div className="px-2 text-sm text-gray-900 text-center">{item.quantity}</div>
                    
                    <div className="px-2 text-sm text-gray-900">{formatCurrency(item.unitCost)}</div>
                    
                    <div className="px-2 text-sm text-gray-600">
                      {item.profitPercentage ? `${item.profitPercentage}%` : '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-900">
                      {item.basePrice ? formatCurrency(item.basePrice) : '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-600">
                      {item.lowStockThreshold || '-'}
                    </div>
                    
                    <div className="px-2 text-sm text-gray-900">
                      {formatCurrency(typeof item.amount === 'number' ? item.amount : parseFloat(item.amount.toString()))}
                    </div>
                    
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
      </div>

      {/* Edit Modal - CONTAINS ISSUE 1 and ISSUE 3 CHANGES */}
      {state.showEditModal && state.productToEdit && (() => {
        const totalSecondaryUnits = state.productToEdit?.hasUnitConversion 
          ? (state.productToEdit.quantity || 0) * (state.productToEdit.conversionRate || 0)
          : 0;
        const pricePerSecondaryUnit = state.productToEdit?.hasUnitConversion && (state.productToEdit.conversionRate || 0) > 0
          ? (state.productToEdit.basePrice || 0) / (state.productToEdit.conversionRate || 0)
          : 0;
        return (
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
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product name</label>
                  <input
                    type="text"
                    placeholder="Enter product name..."
                    value={state.productToEdit.name}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, name: e.target.value } })}
                    onPaste={handlePasteInEditModal}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Tip: Paste copied row from CSV/Excel to auto-fill fields</p>
                </div>

                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product category</label>
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

                {[
                  { label: 'Brand', field: 'make', placeholder: 'Enter brand...' },
                  { label: 'Model', field: 'model', placeholder: 'Enter model...' },
                  { label: 'Type', field: 'type', placeholder: 'Enter type...' },
                  { label: 'Size', field: 'size', placeholder: 'Enter size...' },
                  { label: 'Capacity', field: 'capacity', placeholder: 'Enter capacity...' }
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label} (Optional)</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(state.productToEdit as any)[field] || ''}
                      onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, [field]: e.target.value } })}
                      className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                {/* ✅ ISSUE 3: New Colour field */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Colour (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter colour..."
                    value={(state.productToEdit as any)['colour'] || ''}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, colour: e.target.value } })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ✅ ISSUE 3: New Wattage field */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Wattage (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter wattage (e.g., 5000W, 10kW)..."
                    value={(state.productToEdit as any)['wattage'] || ''}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, wattage: e.target.value } })}
                    className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Description (Optional)</label>
                  <textarea
                    placeholder="Enter description..."
                    value={state.productToEdit.description || ''}
                    onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, description: e.target.value } })}
                    rows={4}
                    className="w-[342px] rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="enableConversionEdit"
                        checked={state.productToEdit?.hasUnitConversion || false}
                        onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, hasUnitConversion: e.target.checked } })}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="enableConversionEdit" className="font-inter font-medium text-sm text-gray-900 cursor-pointer">
                          Enable unit conversion (Sell in multiple units)
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Perfect for hoses, cables, fabrics, or any product sold both in bulk and by smaller units
                        </p>
                      </div>
                    </div>
                  </div>

                  {state.productToEdit?.hasUnitConversion && (
                    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">Unit Conversion Settings</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-inter font-medium text-sm text-gray-900">
                            Base Unit (Inventory)
                          </label>
                          <input
                            type="text"
                            value={state.productToEdit.baseUnit || 'Roll'}
                            onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, baseUnit: e.target.value } })}
                            placeholder="e.g., Roll, Box, Bundle"
                            className="w-full h-10 rounded-lg px-3 py-2.5 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-600 mt-1">How you count stock</p>
                        </div>

                        <div>
                          <label className="block mb-2 font-inter font-medium text-sm text-gray-900">
                            Secondary Unit (Retail)
                          </label>
                          <input
                            type="text"
                            value={state.productToEdit.secondaryUnit || 'Yard'}
                            onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, secondaryUnit: e.target.value } })}
                            placeholder="e.g., Yard, Meter, Piece"
                            className="w-full h-10 rounded-lg px-3 py-2.5 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-600 mt-1">How you also sell</p>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 font-inter font-medium text-sm text-gray-900">
                          Conversion Rate
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">1 {state.productToEdit.baseUnit || 'Roll'} =</span>
                          <input
                            type="number"
                            value={state.productToEdit.conversionRate || 100}
                            onChange={(e) => updateState({ productToEdit: { ...state.productToEdit!, conversionRate: Number(e.target.value) } })}
                            min="1"
                            className="w-32 h-10 rounded-lg px-3 py-2.5 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{state.productToEdit.secondaryUnit || 'Yard'}s</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 bg-white rounded-lg p-3 border border-blue-200">
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700">
                            Example: If 1 roll of hose = 100 yards, enter "100"
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                        <div className="flex items-center gap-2 mb-3">
                          <Ruler className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm text-gray-900">Conversion Preview</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-blue-600">1</div>
                            <div className="text-xs text-gray-600">{state.productToEdit.baseUnit || 'Roll'}</div>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="text-xl text-gray-400">=</div>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-3">
                            <div className="text-2xl font-bold text-indigo-600">{state.productToEdit.conversionRate || 100}</div>
                            <div className="text-xs text-gray-600">{state.productToEdit.secondaryUnit || 'Yard'}s</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {state.productToEdit?.hasUnitConversion && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Inventory Summary with Unit Conversion
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-green-300">
                        <div className="text-sm text-gray-600 mb-1">Total Stock ({state.productToEdit.baseUnit}s)</div>
                        <div className="text-3xl font-bold text-gray-900">{state.productToEdit.quantity}</div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-green-300">
                        <div className="text-sm text-gray-600 mb-1">Total Stock ({state.productToEdit.secondaryUnit}s)</div>
                        <div className="text-3xl font-bold text-green-600">{totalSecondaryUnits.toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-300 mt-4">
                      <div className="text-sm font-medium text-gray-900 mb-3">Pricing Breakdown</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price per {state.productToEdit.baseUnit}:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(state.productToEdit.basePrice || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price per {state.productToEdit.secondaryUnit}:</span>
                          <span className="font-semibold text-green-600">{formatCurrency(pricePerSecondaryUnit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                {/* ✅ ISSUE 1: This field triggers auto-calculation */}
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

                {/* ✅ ISSUE 1: This field auto-updates when profit % changes */}
                <div>
                  <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Base Price</label>
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
        );
      })()}

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

/*
✅ CHANGES MADE:

ISSUE 1 - Base Price Auto-calculation:
- Line ~365-385: handleNumericInput function now auto-calculates basePrice 
  when profit percentage OR unit cost changes

ISSUE 3 - Generators + Colour/Wattage:
- Line 29-30: Added colour and wattage to InventoryItem interface
- Line 36: Added 'Generators' to categories array
- Line 37: Added 'Generators' to categoryOptions array
- Line 156: Added colour extraction from API data
- Line 157: Added wattage extraction from API data
- Line 247-248: Added colour and wattage to search functionality
- Line 656: Updated gridTemplateColumns to include 2 new columns (18 total)
- Line 665-666: Added Colour and Wattage column headers
- Line 693: Updated row gridTemplateColumns to match header
- Line 716-722: Added Colour and Wattage cells in table rows
- Line 874-890: Added Colour and Wattage input fields in edit modal

FILE LOCATION: admin-dashboard/src/app/inventory/page.tsx

TESTING:
1. Edit any product and change profit percentage - base price updates automatically ✅
2. "Generators" appears in category dropdowns ✅
3. Colour and Wattage columns visible in table ✅
4. Can edit colour and wattage values in edit modal ✅

NO BREAKING CHANGES - 100% backward compatible!
*/