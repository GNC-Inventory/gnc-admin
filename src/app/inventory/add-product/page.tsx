'use client';

import React, { useState } from 'react';
import { Info, Minus, Plus } from 'lucide-react';

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
          <h3 className="text-[#0A0D14] font-medium text-sm leading-5 mb-6" style={{ fontFamily: 'Inter', letterSpacing: '-0.6%' }}>
            Add selected products
          </h3>
          
          {/* Product List */}
          <div className="space-y-4 mb-6">
            {selectedProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm">{product.quantity}</span>
                  <div>
                    <p className="text-[#0A0D14] text-sm font-medium">{product.name}</p>
                    <p className="text-gray-600 text-xs">{formatCurrency(product.cost)}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-red-500">
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
            <button 
              className="w-full bg-[#375DFB] text-white py-3 rounded-[10px] font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Add to inventory
            </button>
            <button 
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-[10px] font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Select product
            </button>
          </div>
        </div>

        {/* Right Section - Select products */}
        <div 
          className="bg-white rounded-[32px]"
          style={{
            width: '727px',
            height: '764px',
            top: '112px',
            left: '681px',
            paddingTop: '24px',
            paddingRight: '24px',
            paddingLeft: '24px',
            opacity: 1
          }}
        >
          {/* Header */}
          <h3 
            className="mb-6"
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: '#0A0D14'
            }}
          >
            Select products
          </h3>

          <div className="space-y-6">
            {/* Product category */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14'
                }}
              >
                Product category
              </label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '342px',
                  height: '40px',
                  padding: '10px 10px 10px 12px',
                  gap: '8px',
                  background: '#FFFFFF'
                }}
              />
              <div className="flex items-center gap-2 mt-2">
                <Info 
                  className="text-gray-400"
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span 
                  style={{
                    fontFamily: 'Sora',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0%',
                    color: '#525866'
                  }}
                >
                  To add a category, press enter after typing the name
                </span>
              </div>
            </div>

            {/* Product model */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14'
                }}
              >
                Product model
              </label>
              <input
                type="text"
                placeholder="Start typing..."
                value={currentProduct.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '342px',
                  height: '40px',
                  padding: '10px 10px 10px 12px',
                  gap: '8px',
                  background: '#FFFFFF'
                }}
              />
            </div>

            {/* Product cost */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14'
                }}
              >
                Product cost
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={currentProduct.cost || ''}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                  className="border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                  style={{
                    width: '342px',
                    height: '40px',
                    padding: '10px 10px 10px 12px'
                  }}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs text-gray-600">NGN</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14'
                }}
              >
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange('quantity', currentProduct.quantity - 1)}
                  className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={currentProduct.quantity}
                  onChange={(e) => handleQuantityChange('quantity', parseInt(e.target.value) || 0)}
                  className="border border-gray-200 rounded-[10px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    width: '60px',
                    height: '40px'
                  }}
                />
                <button
                  onClick={() => handleQuantityChange('quantity', currentProduct.quantity + 1)}
                  className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Indicate low-stock */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14'
                }}
              >
                Indicate low-stock
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange('lowStock', currentProduct.lowStock - 1)}
                  className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={currentProduct.lowStock}
                  onChange={(e) => handleQuantityChange('lowStock', parseInt(e.target.value) || 0)}
                  className="border border-gray-200 rounded-[10px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    width: '60px',
                    height: '40px'
                  }}
                />
                <button
                  onClick={() => handleQuantityChange('lowStock', currentProduct.lowStock + 1)}
                  className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Select product button */}
            <div className="pt-8">
              <button
                className="text-center rounded-[8px]"
                style={{
                  width: '347px',
                  height: '36px',
                  gap: '4px',
                  padding: '8px',
                  background: '#EBF1FF'
                }}
              >
                <span
                  style={{
                    width: '98px',
                    height: '20px',
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '-0.6%',
                    textAlign: 'center',
                    color: '#375DFB'
                  }}
                >
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