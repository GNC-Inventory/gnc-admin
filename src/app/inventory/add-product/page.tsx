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
  unitCost: number;
  profitPercentage: number;
  basePrice: number;
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
  basePrice: number;
  amount: number;
  image: string;
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
    category: '', model: '', image: '', unitCost: 0, profitPercentage: 0, basePrice: 0, quantity: 16, lowStock: 8
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const handleSelectProduct = () => {
    if (!currentProduct.category || !currentProduct.model || currentProduct.unitCost <= 0 || currentProduct.profitPercentage < 0) {
      alert('Please fill in all required fields (category, model, unit cost, and profit percentage)');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: `${currentProduct.category} ${currentProduct.model}`,
      ...currentProduct
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setCurrentProduct({ category: '', model: '', image: '', unitCost: 0, profitPercentage: 0, basePrice: 0, quantity: 16, lowStock: 8 });
  };

  const handleAddToInventory = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product to add to inventory');
      return;
    }

    setIsSubmitting(true);
    try {
      const getResponse = await fetch('/.netlify/functions/inventory');
      let existingInventory: InventoryItem[] = [];
      
      if (getResponse.ok) {
        const result = await getResponse.json();
        if (result.success) existingInventory = result.data || [];
      }

      const newItems: InventoryItem[] = selectedProducts.map(product => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product: product.name,
        category: product.category,
        dateAdded: getCurrentDateTime(),
        stockLeft: product.quantity,
        unitCost: product.unitCost,
        basePrice: product.basePrice,
        amount: product.basePrice * product.quantity,
        image: product.image
      }));

      const updatedInventory = [...existingInventory, ...newItems];

      const updateResponse = await fetch('/.netlify/functions/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: updatedInventory })
      });

      const result = await updateResponse.json();
      if (!result.success) throw new Error(result.error);

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
      reader.onload = (e) => setCurrentProduct(prev => ({ ...prev, image: e.target?.result as string }));
      reader.readAsDataURL(file);
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

  const total = selectedProducts.reduce((sum, product) => sum + (product.basePrice * product.quantity), 0);

  const ProductItem = ({ product }: { product: Product }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center bg-white border border-[#E2E4E9] rounded w-6 h-5 px-1 py-0.5">
            <span className="text-gray-600 text-xs">{product.quantity}</span>
          </div>
          <button onClick={() => setSelectedProducts(prev => prev.filter(p => p.id !== product.id))} className="text-gray-400 hover:text-gray-600 text-xs">×</button>
        </div>
        <div className="flex items-center gap-3">
          {product.image && <Image src={product.image} alt={product.name} width={32} height={32} className="rounded object-cover" />}
          <div>
            <p className="text-[#0A0D14] text-sm font-medium">{product.name}</p>
            <p className="text-gray-600 text-xs">{formatCurrency(product.basePrice)}</p>
          </div>
        </div>
      </div>
      <button onClick={() => setSelectedProducts(prev => prev.filter(p => p.id !== product.id))} className="text-gray-400 hover:text-red-500">
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
        <div className="w-[377px] h-[764px] bg-white rounded-[32px] p-6">
          <h3 className="text-[#0A0D14] font-medium text-sm leading-5 mb-6 font-inter tracking-[-0.6%]">
            Add selected products
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
                {currentProduct.image && <Image src={currentProduct.image} alt="Preview" width={100} height={100} className="border border-[#E2E4E9] rounded-[10px] object-cover" />}
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
                  value={currentProduct.unitCost ? formatNumberWithCommas(currentProduct.unitCost.toString()) : ''}
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
                  value={currentProduct.profitPercentage || ''}
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
                <span className="text-gray-700 font-medium">{formatCurrency(currentProduct.basePrice)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">
                  Calculation: ₦{currentProduct.unitCost.toLocaleString()} × (1 + {currentProduct.profitPercentage}%) = {formatCurrency(currentProduct.basePrice)}
                </span>
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