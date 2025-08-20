// components/dashboard/SalesByProduct.tsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProductData {
  name: string;
  percentage: number;
  color: string;
  value?: number;
  salesCount?: number;
}

interface SalesByProductProps {
  period?: string;
}

interface ApiProductData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  salesCount: number;
}

interface ApiResponse {
  totalSales: number;
  totalProducts: number;
  topProduct: ApiProductData;
  products: ApiProductData[];
}

const SalesByProduct: React.FC<SalesByProductProps> = ({ period = 'today' }) => {
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback product data matching your Figma design
  const fallbackProductData: ProductData[] = [
    { name: 'Spark Plug - 26%', percentage: 26, color: '#FF6B6B' },
    { name: 'Spark Plug - 18%', percentage: 18, color: '#4ECDC4' },
    { name: 'Spark Plug - 16%', percentage: 16, color: '#45B7D1' },
    { name: 'Spark Plug - 14%', percentage: 14, color: '#96CEB4' },
    { name: 'Spark Plug - 12%', percentage: 12, color: '#FFEAA7' },
    { name: 'Spark Plug - 8%', percentage: 8, color: '#DDA0DD' },
    { name: 'Spark Plug - 5%', percentage: 5, color: '#98D8C8' },
    { name: 'Spark Plug - 3%', percentage: 3, color: '#A29BFE' }
  ];

  // Transform API data to component format
  const transformApiData = (apiData: ApiResponse): ProductData[] => {
    return apiData.products.map(product => ({
      name: `${product.name} - ${product.percentage}%`,
      percentage: product.percentage,
      color: product.color,
      value: product.value,
      salesCount: product.salesCount
    }));
  };

  // Fetch sales by product data from API
  const fetchSalesByProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/sales-by-product`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const apiData: ApiResponse = result.data;
        
        // Check if we have actual product data
        if (apiData.products && apiData.products.length > 0) {
          const transformedData = transformApiData(apiData);
          setProductData(transformedData);
        } else {
          // Use fallback data if API returns empty products
          setProductData(fallbackProductData);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching sales by product data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product sales data');
      // Use fallback data on error
      setProductData(fallbackProductData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSalesByProductData();
  }, []);

  // Chart data for the pie chart
  const chartData = productData.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
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

        <div className="flex-1 flex gap-6 pb-6">
          {/* Loading skeleton for product list */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeleton for pie chart */}
          <div className="w-32 h-32 flex-shrink-0">
            <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state (still shows fallback data)
  const isUsingFallbackData = productData === fallbackProductData || error;

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
          {isUsingFallbackData && (
            <span className="text-blue-500 text-sm ml-2 font-normal">
              (Sample data)
            </span>
          )}
        </h3>
        {error && !loading && (
          <p className="text-red-500 text-xs mt-1">
            Unable to load live data - showing sample
          </p>
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 flex gap-6 pb-6">
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
                  title={product.salesCount ? `${product.salesCount} sales` : undefined}
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