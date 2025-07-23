// components/dashboard/SalesByProduct.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProductData {
  name: string;
  percentage: number;
  color: string;
}

interface SalesByProductProps {
  period?: string;
}

const SalesByProduct: React.FC<SalesByProductProps> = ({ period = 'today' }) => {
  // Product data matching your Figma design
  const productData: ProductData[] = [
    { name: 'Spark Plug - 26%', percentage: 26, color: '#FF6B6B' },
    { name: 'Spark Plug - 18%', percentage: 18, color: '#4ECDC4' },
    { name: 'Spark Plug - 16%', percentage: 16, color: '#45B7D1' },
    { name: 'Spark Plug - 14%', percentage: 14, color: '#96CEB4' },
    { name: 'Spark Plug - 12%', percentage: 12, color: '#FFEAA7' },
    { name: 'Spark Plug - 8%', percentage: 8, color: '#DDA0DD' },
    { name: 'Spark Plug - 5%', percentage: 5, color: '#98D8C8' },
    { name: 'Spark Plug - 3%', percentage: 3, color: '#A29BFE' }
  ];

  // Chart data for the pie chart
  const chartData = productData.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-4">
        <h3 
          className="text-[#0A0D14] font-medium"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: 500
          }}
        >
          Sales by product
        </h3>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex gap-6">
        {/* Left Side - Product List */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {productData.map((product, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Color Indicator */}
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: product.color }}
                />
                {/* Product Name */}
                <span 
                  className="text-gray-700 text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px'
                  }}
                >
                  {product.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Pie Chart */}
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesByProduct;