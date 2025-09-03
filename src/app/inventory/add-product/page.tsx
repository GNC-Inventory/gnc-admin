'use client';

import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  category: string;
  model: string;
  image: string;
  cost: number;
  quantity: number;
  lowStock: number;
}

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  dateAdded: string;
  stockLeft: number;
  unitCost: number;
  amount: number;
  image: string;
}

// Number formatting helper functions
const formatNumberWithCommas = (value: string): string => {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Handle multiple decimal points - keep only the first one
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas to integer part
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return with decimal part if it exists
  if (decimalPart !== undefined) {
    return `${formatted}.${decimalPart}`;
  }
  
  return formatted;
};

const parseFormattedNumber = (value: string): number => {
  // Remove commas and parse as float
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    category: '',
    model: '',
    image: '',
    cost: 0,
    quantity: 16,
    lowStock: 8
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load selected products from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedProducts');
    if (saved) setSelectedProducts(JSON.parse(saved));
  }, []);

  // Save selected products to localStorage when changed
  useEffect(() => {
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const formatCurrency = (value: number) => `₦ ${value.toLocaleString()}`;

  const getCurrentDateTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const handleSelectProduct = () => {
    if (!currentProduct.category || !currentProduct.model || currentProduct.cost <= 0) {
      alert('Please fill in all required fields (category, model, and cost)');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: `${currentProduct.category} ${currentProduct.model}`,
      category: currentProduct.category,
      model: currentProduct.model,
      image: currentProduct.image,
      cost: currentProduct.cost,
      quantity: currentProduct.quantity,
      lowStock: currentProduct.lowStock
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setCurrentProduct({ category: '', model: '', image: '', cost: 0, quantity: 16, lowStock: 8 });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleAddToInventory = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product to add to inventory');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get existing inventory
      const getResponse = await fetch('/.netlify/functions/inventory');
      let existingInventory: InventoryItem[] = [];
      
      if (getResponse.ok) {
        const result = await getResponse.json();
        if (result.success) existingInventory = result.data || [];
      }

      // Convert selected products to inventory items
      const newItems: InventoryItem[] = selectedProducts.map(product => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product: product.name,
        category: product.category,
        dateAdded: getCurrentDateTime(),
        stockLeft: product.quantity,
        unitCost: product.cost,
        amount: product.cost * product.quantity,
        image: product.image
      }));

      const updatedInventory = [...existingInventory, ...newItems];

      // Save to Netlify function
      const updateResponse = await fetch('/.netlify/functions/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: updatedInventory })
      });

      const result = await updateResponse.json();
      if (!result.success) throw new Error(result.error);

      // Backup to localStorage
      localStorage.setItem('inventoryData', JSON.stringify(updatedInventory));
      localStorage.removeItem('selectedProducts');
      setSelectedProducts([]);

      alert(`Successfully added ${selectedProducts.length} product(s) to inventory!`);
      setTimeout(() => router.push('/inventory'), 1000);

    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (field: 'quantity' | 'lowStock', value: number) => {
    if (value >= 0) setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentProduct(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const total = selectedProducts.reduce((sum, product) => sum + (product.cost * product.quantity), 0);

  return (
    <div className="bg-gray-50 min-h-full p-8">
      <div className="flex gap-8">
        {/* Left Section - Selected Products */}
        <div className="w-[377px] h-[764px] bg-white rounded-[32px] p-6">
          <h3 className="text-[#0A0D14] font-medium text-sm leading-5 mb-6 font-inter tracking-[-0.6%]">
            Add selected products
          </h3>
          
          <div className="space-y-4 mb-6">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center bg-white border border-[#E2E4E9] rounded w-6 h-5 px-1 py-0.5">
                      <span className="text-gray-600 text-xs">{product.quantity}</span>
                    </div>
                    <button onClick={() => handleRemoveProduct(product.id)} className="text-gray-400 hover:text-gray-600 text-xs">×</button>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={32} 
                        height={32} 
                        className="rounded object-cover" 
                      />
                    )}
                    <div>
                      <p className="text-[#0A0D14] text-sm font-medium">{product.name}</p>
                      <p className="text-gray-600 text-xs">{formatCurrency(product.cost)}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleRemoveProduct(product.id)} className="text-gray-400 hover:text-red-500">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12.5C11 13.3284 10.3284 14 9.5 14H6.5C5.67157 14 5 13.3284 5 12.5V4H4.5C4.22386 4 4 3.77614 4 3.5C4 3.22386 4.22386 3 4.5 3H6V2.5Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ))}
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
        <div className="w-[727px] h-[764px] bg-white rounded-[32px] pt-6 pr-6 pl-6">
          <h3 className="mb-6 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Select products</h3>

          <div className="space-y-6">
            {/* Product category */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product category</label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">To add a category, press enter after typing the name</span>
              </div>
            </div>

            {/* Product model */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product model</label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {currentProduct.image && (
                  <Image 
                    src={currentProduct.image} 
                    alt="Preview" 
                    width={100} 
                    height={100} 
                    className="border border-[#E2E4E9] rounded-[10px] object-cover" 
                  />
                )}
              </div>
            </div>

            {/* Product cost - Updated with number formatting */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Product cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={currentProduct.cost ? formatNumberWithCommas(currentProduct.cost.toString()) : ''}
                  onChange={(e) => {
                    const formattedValue = formatNumberWithCommas(e.target.value);
                    const numericValue = parseFormattedNumber(formattedValue);
                    
                    // Update the input display with formatted value
                    e.target.value = formattedValue;
                    
                    // Store the clean numeric value
                    handleInputChange('cost', numericValue);
                  }}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter
                    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode === 67 && e.ctrlKey === true) ||
                        (e.keyCode === 86 && e.ctrlKey === true) ||
                        (e.keyCode === 88 && e.ctrlKey === true)) {
                      return;
                    }
                    // Ensure that it is a number or decimal point and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                        (e.keyCode < 96 || e.keyCode > 105) && 
                        e.keyCode !== 190 && e.keyCode !== 110) {
                      e.preventDefault();
                    }
                  }}
                  className="w-[342px] h-10 rounded-[10px] pl-8 pr-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Quantity</label>
              <input
                type="number"
                value={currentProduct.quantity}
                onChange={(e) => handleQuantityChange('quantity', parseInt(e.target.value) || 0)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Indicate low-stock */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">Indicate low-stock</label>
              <input
                type="number"
                value={currentProduct.lowStock}
                onChange={(e) => handleQuantityChange('lowStock', parseInt(e.target.value) || 0)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Select product button */}
            <div className="pt-20">
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