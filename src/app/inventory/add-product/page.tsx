'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  model: string;
  cost: number;
  quantity: number;
  lowStock: number;
}

const AddProductPage: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    category: '',
    model: '',
    cost: 0,
    quantity: 16,
    lowStock: 8
  });

  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  const handleSelectProduct = () => {
    // Validate that required fields are filled
    if (!currentProduct.category || !currentProduct.model || currentProduct.cost <= 0) {
      alert('Please fill in all required fields (category, model, and cost)');
      return;
    }

    // Create new product
    const newProduct: Product = {
      id: Date.now().toString(), // Simple ID generation
      name: `${currentProduct.category} ${currentProduct.model}`,
      category: currentProduct.category,
      model: currentProduct.model,
      cost: currentProduct.cost,
      quantity: currentProduct.quantity,
      lowStock: currentProduct.lowStock
    };

    // Add to selected products
    setSelectedProducts(prev => [...prev, newProduct]);

    // Reset form
    setCurrentProduct({
      category: '',
      model: '',
      cost: 0,
      quantity: 16,
      lowStock: 8
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleQuantityChange = (field: 'quantity' | 'lowStock', value: number) => {
    if (value >= 0) {
      setCurrentProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentProduct(prev => ({ ...prev, [field]: value }));
  };

  const total = selectedProducts.reduce((sum, product) => sum + (product.cost * product.quantity), 0);

  return (
    <div className="bg-gray-50 min-h-full p-8">
      <div className="flex gap-8">
        {/* Left Section - Add selected products */}
        <div className="w-[377px] h-[764px] bg-white rounded-[32px] p-6">
          <h3 className="text-[#0A0D14] font-medium text-sm leading-5 mb-6 font-inter tracking-[-0.6%]">
            Add selected products
          </h3>
          
          {/* Product List */}
          <div className="space-y-4 mb-6">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm">{product.quantity}</span>
                  <div>
                    <p className="text-[#0A0D14] text-sm font-medium">{product.name}</p>
                    <p className="text-gray-600 text-xs">{formatCurrency(product.cost)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveProduct(product.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 12L12 4M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[#0A0D14] font-medium">Total</span>
              <span className="text-[#0A0D14] font-medium">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-[#375DFB] text-white py-3 rounded-[10px] font-medium text-sm hover:bg-blue-700 transition-colors">
              Add to inventory
            </button>
            <button className="w-full bg-gray-100 text-gray-600 py-3 rounded-[10px] font-medium text-sm hover:bg-gray-200 transition-colors">
              Select product
            </button>
          </div>
        </div>

        {/* Right Section - Select products */}
        <div className="w-[727px] h-[764px] bg-white rounded-[32px] pt-6 pr-6 pl-6 opacity-100">
          {/* Header */}
          <h3 className="mb-6 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
            Select products
          </h3>

          <div className="space-y-6">
            {/* Product category */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Product category
              </label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-gray-400" />
                <span className="font-sora text-xs leading-4 text-[#525866]">
                  To add a category, press enter after typing the name
                </span>
              </div>
            </div>

            {/* Product model */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Product model
              </label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Product cost */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Product cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={currentProduct.cost || ''}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  className="w-[342px] h-10 rounded-[10px] pl-8 pr-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Quantity
              </label>
              <input
                type="number"
                value={currentProduct.quantity}
                onChange={(e) => handleQuantityChange('quantity', parseInt(e.target.value) || 0)}
                className="w-[342px] h-10 rounded-[10px] px-3 py-2.5 border border-[#E2E4E9] bg-white shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Indicate low-stock */}
            <div>
              <label className="block mb-2 font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-[#0A0D14]">
                Indicate low-stock
              </label>
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
                <span className="font-inter font-medium text-sm leading-5 tracking-[-0.6%] text-center text-[#375DFB]">
                  Select product
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;