// components/dashboard/SalesCard.tsx
import React, { useState, useEffect } from 'react';

interface SalesCardProps {
  amount?: number; // Made optional since we'll fetch from API
  period?: string;
}

interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  totalProducts: number;
  totalUsers: number;
  todaySales: number;
  growth: {
    sales: number;
    transactions: number;
    products: number;
  };
}

const SalesCard: React.FC<SalesCardProps> = ({ 
  amount,
  period = 'today' 
}) => {
  const [salesData, setSalesData] = useState<number>(amount || 0);
  const [loading, setLoading] = useState(!amount); // Only load if no amount provided
  const [error, setError] = useState<string | null>(null);
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);

  // Format number with Nigerian Naira symbol and commas
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Fetch dashboard stats from API
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
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
        const data: DashboardStats = result.data;
        setSalesData(data.totalSales);
        setGrowthPercentage(data.growth.sales);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales data');
      // Fallback to provided amount or 0
      setSalesData(amount || 0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount (only if no amount provided)
  useEffect(() => {
    if (!amount) {
      fetchDashboardStats();
    }
  }, [amount]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Sales
        </h3>
        <div className="flex-1 flex items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (error && !amount) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Sales
        </h3>
        <div className="flex-1 flex items-center">
          <p className="text-red-500 text-sm">
            Unable to load sales data
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {period}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Sales
      </h3>
      
      {/* Amount */}
      <div className="flex-1 flex items-center">
        <div className="flex flex-col">
          <p 
            className="text-[#0A0D14] font-semibold"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 600
            }}
          >
            {formatCurrency(salesData)}
          </p>
          
          {/* Growth indicator (only show if we have growth data) */}
          {!amount && growthPercentage !== 0 && (
            <div className={`text-xs mt-1 flex items-center ${
              growthPercentage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {growthPercentage > 0 ? '↗' : '↘'}
              </span>
              {Math.abs(growthPercentage)}%
            </div>
          )}
        </div>
      </div>
      
      {/* Period info */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
      </div>
    </div>
  );
};

export default SalesCard;