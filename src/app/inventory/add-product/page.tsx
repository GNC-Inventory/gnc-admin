'use client';

import React, { useState, useEffect } from 'react';
import { Info, Package, Ruler} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast, showWarningToast } from '@/utils/toast';

interface Product {
  id: string;
  name: string;
  category: string;
  make: string;
  model: string;
  type: string;
  size: string;
  capacity: string;
  description: string;
  image: string;
  imageFile?: File;
  unitCost: number;
  profitPercentage: number;
  basePrice: number;
  quantity: number;
  lowStock: number;
  // ADD THESE THREE NEW LINES:
  hasUnitConversion?: boolean;
  baseUnit?: string;
  secondaryUnit?: string;
  conversionRate?: number;
}

const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  const formatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts[1] !== undefined ? `${formatted}.${parts[1]}` : formatted;
};

const parseFormattedNumber = (value: string): number => parseFloat(value.replace(/,/g, '')) || 0;

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    category: '',
    name: '',
    make: '',
    model: '',
    type: '',
    size: '',
    capacity: '',
    description: '',
    image: '',
    unitCost: 0,
    profitPercentage: 0,
    basePrice: 0,
    quantity: 16,
    lowStock: 8,
    hasUnitConversion: false,
    baseUnit: 'Roll',
    secondaryUnit: 'Yard',
    conversionRate: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingInventory, setExistingInventory] = useState<Product[]>([]);

  const categoryOptions = [
    'Building Materials',
    'Electricals',
    'Electronics'
  ];

  // ENHANCED: Load existing inventory for duplicate checking
  useEffect(() => {
    const loadExistingInventory = async () => {
      try {
        const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
          headers: { 
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const transformedData = result.data.map((item: any) => ({
              id: item.id?.toString() || '',
              name: item.product?.name || '',
              category: item.product?.category || '',
              make: item.product?.make || '',
              model: item.product?.model || '',
              type: item.product?.type || '',
              size: item.product?.size || '',
              capacity: item.product?.capacity || '',
              description: item.product?.description || '',
              image: item.product?.imageUrl || '',
              unitCost: parseFloat(item.product?.unitCost) || 0,
              profitPercentage: parseFloat(item.profitPercentage) || 0,
              basePrice: parseFloat(item.product?.basePrice) || 0,
              quantity: parseInt(item.quantity) || 0,
              lowStock: parseInt(item.lowStockThreshold) || 8,
              hasUnitConversion: item.product?.hasUnitConversion || false,
              baseUnit: item.product?.baseUnit || '',
              secondaryUnit: item.product?.secondaryUnit || '',
              conversionRate: parseFloat(item.product?.conversionRate) || 0
            }));
            setExistingInventory(transformedData);
          }
        }
      } catch (error) {
        console.error('Failed to load existing inventory:', error);
      }
    };

    loadExistingInventory();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('selectedProducts');
    if (saved) setSelectedProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    const calculatedBasePrice = currentProduct.unitCost * (1 + currentProduct.profitPercentage / 100);
    setCurrentProduct(prev => ({ ...prev, basePrice: calculatedBasePrice }));
  }, [currentProduct.unitCost, currentProduct.profitPercentage]);

  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString();
  };

  // ENHANCED: Comprehensive duplicate check - ALL fields must match 100%
  const checkForDuplicate = (
    name: string,
    category: string,
    brand: string,
    model: string,
    type: string,
    size: string,
    capacity: string,
    description: string
  ): { isDuplicate: boolean; location: 'inventory' | 'selection' | null } => {
    const normalizeString = (str: string | undefined) => (str || '').toLowerCase().trim();
    
    // Check against existing inventory
    const existsInInventory = existingInventory.find(item => 
      normalizeString(item.name) === normalizeString(name) &&
      normalizeString(item.category) === normalizeString(category) &&
      normalizeString(item.make) === normalizeString(brand) &&
      normalizeString(item.model) === normalizeString(model) &&
      normalizeString(item.type) === normalizeString(type) &&
      normalizeString(item.size) === normalizeString(size) &&
      normalizeString(item.capacity) === normalizeString(capacity) &&
      normalizeString(item.description) === normalizeString(description)
    );

    if (existsInInventory) {
      return { isDuplicate: true, location: 'inventory' };
    }

    // Check against currently selected products
    const existsInSelection = selectedProducts.find(item => 
      normalizeString(item.name) === normalizeString(name) &&
      normalizeString(item.category) === normalizeString(category) &&
      normalizeString(item.make) === normalizeString(brand) &&
      normalizeString(item.model) === normalizeString(model) &&
      normalizeString(item.type) === normalizeString(type) &&
      normalizeString(item.size) === normalizeString(size) &&
      normalizeString(item.capacity) === normalizeString(capacity) &&
      normalizeString(item.description) === normalizeString(description)
    );

    if (existsInSelection) {
      return { isDuplicate: true, location: 'selection' };
    }

    return { isDuplicate: false, location: null };
  };

  const handleSelectProduct = () => {
    if (!currentProduct.category || !currentProduct.name || currentProduct.unitCost <= 0 || currentProduct.profitPercentage < 0) {
      showErrorToast('Please fill in required fields: category, name, unit cost, and profit percentage');
      return;
    }

    // ENHANCED: Check for duplicates before adding
    const duplicateCheck = checkForDuplicate(
      currentProduct.name,
      currentProduct.category,
      currentProduct.make,
      currentProduct.model,
      currentProduct.type,
      currentProduct.size,
      currentProduct.capacity,
      currentProduct.description
    );

    if (duplicateCheck.isDuplicate) {
      const locationText = duplicateCheck.location === 'inventory' 
        ? 'already exists in inventory' 
        : 'is already in your current selection';
      showErrorToast(`⚠️ Duplicate detected: A product with identical name, category, brand, model, type, size, capacity, and description ${locationText}`);
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: currentProduct.name,
      category: currentProduct.category,
      make: currentProduct.make,
      model: currentProduct.model,
      type: currentProduct.type,
      size: currentProduct.size,
      capacity: currentProduct.capacity,
      description: currentProduct.description,
      image: currentProduct.image,
      unitCost: currentProduct.unitCost,
      profitPercentage: currentProduct.profitPercentage,
      basePrice: currentProduct.basePrice,
      quantity: currentProduct.quantity,
      lowStock: currentProduct.lowStock,
      hasUnitConversion: currentProduct.hasUnitConversion,
      baseUnit: currentProduct.hasUnitConversion ? currentProduct.baseUnit : undefined,
      secondaryUnit: currentProduct.hasUnitConversion ? currentProduct.secondaryUnit : undefined,
      conversionRate: currentProduct.hasUnitConversion ? currentProduct.conversionRate : undefined
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setCurrentProduct({
      category: '',
      name: '',
      make: '',
      model: '',
      type: '',
      size: '',
      capacity: '',
      description: '',
      image: '',
      unitCost: 0,
      profitPercentage: 0,
      basePrice: 0,
      quantity: 16,
      lowStock: 8,
      hasUnitConversion: false,
      baseUnit: 'Roll',
      secondaryUnit: 'Yard',
      conversionRate: 100
    });
    showSuccessToast(`${newProduct.name} added to selection`);
  };

  const handleAddToInventory = async () => {
    if (selectedProducts.length === 0) {
      showWarningToast('Please select at least one product to add to inventory');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = showLoadingToast(`Adding ${selectedProducts.length} product(s) to inventory...`);
    
    try {
      // Add each product to backend
      const addedProducts = [];
      
      for (const product of selectedProducts) {
        try {
        console.log('=== ADD PRODUCT API DEBUG ===');
console.log('API Key check:', process.env.NEXT_PUBLIC_API_KEY ? 'EXISTS' : 'MISSING');
console.log('API Key value:', process.env.NEXT_PUBLIC_API_KEY ? 'SET' : 'EMPTY');
console.log('Request headers:', {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'EMPTY'
});

const response = await fetch('https://gnc-inventory-backend.onrender.com/api/admin/inventory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
  },
  body: JSON.stringify({
    name: product.name,
    category: product.category,
    make: product.make,
    model: product.model,
    type: product.type,
    size: product.size,
    capacity: product.capacity,
    description: product.description,
    image: product.image, // This sends the base64 string
    unit_cost: product.unitCost,
    base_price: product.basePrice,
    stock_quantity: product.quantity,
    low_stock_threshold: product.lowStock,
    has_unit_conversion: product.hasUnitConversion || false,
    base_unit: product.baseUnit || null,
    secondary_unit: product.secondaryUnit || null,
    conversion_rate: product.conversionRate || null,
    locationId: 1
  })
});

console.log('Response status:', response.status);
console.log('Response URL:', response.url);

if (!response.ok) {
  const errorText = await response.text();
  console.error('API Error Details:', errorText);
  console.error('Request body sent:', JSON.stringify({
    name: product.name,
    category: product.category,
    make: product.make,
    model: product.model,
    type: product.type,
    size: product.size,
    capacity: product.capacity,
    description: product.description,
    unit_cost: product.unitCost,
    base_price: product.basePrice,
    stock_quantity: product.quantity,
    low_stock_threshold: product.lowStock,
    locationId: 1
  }, null, 2));
  throw new Error(`API returned ${response.status}: ${errorText}`);
}

const result = await response.json();
console.log('API Success Response:', result);

if (result.success) {
  addedProducts.push(product);
  console.log(`Successfully added: ${product.name}`);
} else {
  throw new Error(result.error || 'Failed to add product');
}

        } catch (error) {
          console.error(`Failed to add ${product.name}:`, error);
          showErrorToast(`Failed to add ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      dismissToast(loadingToastId);

      if (addedProducts.length > 0) {
        setSelectedProducts([]);
        localStorage.removeItem('selectedProducts');
        showSuccessToast(`Successfully added ${addedProducts.length} product(s) to inventory!`);
        setTimeout(() => router.push('/inventory'), 1000);
      } else {
        showErrorToast('No products were added successfully');
      }

    } catch (error) {
      dismissToast(loadingToastId);
      showErrorToast(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (field: 'quantity' | 'lowStock', value: number) => {
    if (value >= 0) setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // For now, store the file object instead of base64
    // We'll send the actual file to the backend
    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentProduct(prev => ({ 
        ...prev, 
        image: e.target?.result as string // Keep base64 for preview
      }));
    };
    reader.readAsDataURL(file);
    
    // Also store the file object for upload
    setCurrentProduct(prev => ({ 
      ...prev, 
      imageFile: file // Add this new field
    }));
  }
};

  const handleNumericInput = (field: 'unitCost' | 'profitPercentage', e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'unitCost') {
      const formattedValue = formatNumberWithCommas(e.target.value);
      const numericValue = parseFormattedNumber(formattedValue);
      e.target.value = formattedValue;
      handleInputChange(field, numericValue);
    } else {
      handleInputChange(field, parseFloat(e.target.value) || 0);
    }
  };

  const removeProduct = (productId: string) => {
    const product = selectedProducts.find(p => p.id === productId);
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    if (product) {
      showSuccessToast(`${product.name} removed from selection`);
    }
  };

  const total = selectedProducts.reduce((sum, product) => sum + (product.basePrice * product.quantity), 0);

  const totalSecondaryUnits = currentProduct.hasUnitConversion 
  ? currentProduct.quantity * currentProduct.conversionRate 
  : 0;
  const pricePerSecondaryUnit = currentProduct.hasUnitConversion && currentProduct.conversionRate > 0
  ? currentProduct.basePrice / currentProduct.conversionRate
  : 0;

  const ProductItem = ({ product }: { product: Product }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center bg-white border border-[#E2E4E9] rounded w-6 h-5 px-1 py-0.5">
            <span className="text-gray-600 text-xs">{product.quantity}</span>
          </div>
          <button onClick={() => removeProduct(product.id)} className="text-gray-400 hover:text-gray-600 text-xs">×</button>
        </div>
        <div className="flex items-center gap-3">
          {product.image && <Image src={product.image} alt={product.name} width={32} height={32} className="rounded object-cover" />}
          {product.hasUnitConversion && (
          <p className="text-blue-600 text-xs">
            {product.quantity} {product.baseUnit}s = {(product.quantity * (product.conversionRate || 0)).toFixed(0)} {product.secondaryUnit}s
          </p>
           )}
          <div>
            <p className="text-[#0A0D14] text-sm font-medium">{product.name}</p>
            <p className="text-gray-600 text-xs">{product.make} {product.model}</p>
            <p className="text-gray-600 text-xs">{formatCurrency(product.basePrice)}</p>
          </div>
        </div>
      </div>
      <button onClick={() => removeProduct(product.id)} className="text-gray-400 hover:text-red-500">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12.5C11 13.3284 10.3284 14 9.5 14H6.5C5.67157 14 5 13.3284 5 12.5V4H4.5C4.22386 4 4 3.77614 4 3.5C4 3.22386 4.22386 3 4.5 3H6V2.5Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-full p-8">
      <div className="flex gap-8">
        {/* Left Section - Selected Products */}
        <div className="w-[377px] h-[764px] bg-white rounded-[32px] p-6 overflow-y-auto">
          <h3 className="text-[#0A0D14] font-medium text-sm leading-5 mb-6 font-inter tracking-[-0.6%]">
            Save newly added products
          </h3>
          
          <div className="space-y-4 mb-6">
            {selectedProducts.map((product) => <ProductItem key={product.id} product={product} />)}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[#0A0D14] font-medium">Total</span>
              <span className="text-[#0A0D14] font-medium">{formatCurrency(total)}</span>
            </div>
          </div>

          <button 
            onClick={handleAddToInventory}
            disabled={isSubmitting || selectedProducts.length === 0}
            className="w-full bg-[#375DFB] text-white py-3 rounded-[10px] font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding to inventory...' : 'Add to inventory'}
          </button>
        </div>

        {/* Right Section - Product Form */}
        <div className="w-[727px] h-[764px] bg-white rounded-[32px] pt-6 pr-6 pl-6 overflow-y-auto">
          <h3 className="mb-6 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Select products</h3>

          <div className="space-y-6">
            {/* Category Dropdown */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Product category
              </label>
              <select
                value={currentProduct.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Fields - All accepting any characters including decimals */}
            {[
              { label: 'Product name', field: 'name', placeholder: 'Enter product name...', required: true },
              { label: 'Brand', field: 'make', placeholder: 'Enter Brand (e.g., Samsung, Dangote)...', required: false },
              { label: 'Model', field: 'model', placeholder: 'Enter model (e.g., S21, X500)...', required: false },
              { label: 'Type', field: 'type', placeholder: 'Enter type (e.g., LED, Concrete)...', required: false },
              { label: 'Size', field: 'size', placeholder: 'Enter size (e.g., 2.5 inches, 10mm)...', required: false },
              { label: 'Capacity', field: 'capacity', placeholder: 'Enter capacity (e.g., 1.5L, 50kg)...', required: false }
            ].map(({ label, field, placeholder, required }) => (
              <div key={field}>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                  {label}{required ? '' : ' (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={currentProduct[field as keyof typeof currentProduct] as string}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(field === 'size' || field === 'capacity') && (
                  <div className="flex items-center gap-2 mt-1">
                    <Info className="w-3 h-3 text-gray-400" />
                    <span className="font-sora text-xs leading-4 text-[#525866]">
                      You can enter decimals (e.g., {field === 'size' ? '2.5 inches, 10.5mm' : '1.5L, 0.75kg'})
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Description Field - Larger textarea with helper text */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Description (Optional)
              </label>
              <textarea
                placeholder="Enter detailed product description (supports all characters including decimals, e.g., '2.5mm thickness')..."
                value={currentProduct.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-[342px] rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
              <div className="flex items-center gap-2 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">
                  Accepts all text including numbers and decimals
                </span>
              </div>
            </div>

            {/* Product image */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product image (Optional)</label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {currentProduct.image && <Image src={currentProduct.image} alt="Preview" width={100} height={100} className="border border-[#E2E4E9] rounded-[10px] object-cover" />}
              </div>
            </div>

            {/* NEW: Unit Conversion Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="enableConversion"
                    checked={currentProduct.hasUnitConversion}
                    onChange={(e) => handleInputChange('hasUnitConversion', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="enableConversion" className="font-inter font-medium text-sm text-gray-900 cursor-pointer">
                      Enable unit conversion (Sell in multiple units)
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Perfect for hoses, cables, fabrics, or any product sold both in bulk and by smaller units
                    </p>
                  </div>
                </div>
              </div>

              {currentProduct.hasUnitConversion && (
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
                        value={currentProduct.baseUnit}
                        onChange={(e) => handleInputChange('baseUnit', e.target.value)}
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
                        value={currentProduct.secondaryUnit}
                        onChange={(e) => handleInputChange('secondaryUnit', e.target.value)}
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
                      <span className="text-sm text-gray-600">1 {currentProduct.baseUnit} =</span>
                      <input
                        type="number"
                        value={currentProduct.conversionRate}
                        onChange={(e) => handleInputChange('conversionRate', Number(e.target.value))}
                        min="1"
                        className="w-32 h-10 rounded-lg px-3 py-2.5 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{currentProduct.secondaryUnit}s</span>
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
                        <div className="text-xs text-gray-600">{currentProduct.baseUnit}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-xl text-gray-400">=</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-indigo-600">{currentProduct.conversionRate}</div>
                        <div className="text-xs text-gray-600">{currentProduct.secondaryUnit}s</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Inventory Summary */}
            {currentProduct.hasUnitConversion && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Inventory Summary with Unit Conversion
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="text-sm text-gray-600 mb-1">Total Stock ({currentProduct.baseUnit}s)</div>
                    <div className="text-3xl font-bold text-gray-900">{currentProduct.quantity}</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="text-sm text-gray-600 mb-1">Total Stock ({currentProduct.secondaryUnit}s)</div>
                    <div className="text-3xl font-bold text-green-600">{totalSecondaryUnits}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-300 mt-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">Pricing Breakdown</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per {currentProduct.baseUnit}:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(currentProduct.basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per {currentProduct.secondaryUnit}:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(pricePerSecondaryUnit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unit Cost */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Unit Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={currentProduct.unitCost ? formatNumberWithCommas(currentProduct.unitCost.toString()) : ''}
                  onChange={(e) => handleNumericInput('unitCost', e)}
                  onKeyDown={(e) => {
                    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && e.ctrlKey)) return;
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) e.preventDefault();
                  }}
                  className="w-[342px] h-10 rounded-[10px] pl-8 pr-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">Supports decimals (e.g., 1,250.50)</span>
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
                  value={currentProduct.profitPercentage || ''}
                  onChange={(e) => handleNumericInput('profitPercentage', e)}
                  className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">%</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">Enter profit margin as percentage (e.g., 25 or 25.5 for 25.5%)</span>
              </div>
            </div>

            {/* Calculated Base Price Display */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Base Price (Auto-calculated)</label>
              <div className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-gray-50 flex items-center">
                <span className="text-gray-700 font-medium">{formatCurrency(currentProduct.basePrice)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">
                  Calculation: ₦{currentProduct.unitCost.toLocaleString()} × (1 + {currentProduct.profitPercentage}%) = {formatCurrency(currentProduct.basePrice)}
                </span>
              </div>
            </div>

            {/* Quantity and Low Stock Fields */}
            {[
              { label: 'Quantity', value: currentProduct.quantity, field: 'quantity' },
              { label: 'Indicate low-stock', value: currentProduct.lowStock, field: 'lowStock' }
            ].map(({ label, value, field }) => (
              <div key={field}>
                <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleQuantityChange(field as 'quantity' | 'lowStock', parseInt(e.target.value) || 0)}
                  className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Select product button */}
            <div className="pt-4">
              <button 
                onClick={handleSelectProduct}
                className="w-[347px] h-9 rounded-lg p-2 bg-[#EBF1FF] flex items-center justify-center hover:bg-[#DDE7FF] transition-colors"
              >
                <span className="font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-center text-[#375DFB]">Select product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;