// components/dashboard/AverageSalesCard.tsx
import React, { useState, useEffect } from 'react';

interface AverageSalesCardProps {
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

const AverageSalesCard: React.FC<AverageSalesCardProps> = ({
  amount,
  period = 'today'
}) => {
  const [averageSales, setAverageSales] = useState<number>(amount || 0);
  const [loading, setLoading] = useState(!amount); // Only load if no amount provided
  const [error, setError] = useState<string | null>(null);

  // Format number with Nigerian Naira symbol and commas
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Calculate average sales from total sales and transactions
  const calculateAverageSales = (totalSales: number, totalTransactions: number): number => {
    if (totalTransactions === 0) return 0;
    return Math.round(totalSales / totalTransactions);
  };

  // Fetch dashboard stats from API
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prefer API key auth (bypasses JWT expiry issues); fall back to JWT
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (process.env.NEXT_PUBLIC_API_KEY) {
        headers['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication credentials available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data: DashboardStats = result.data;
        const avgSales = calculateAverageSales(data.totalSales, data.totalTransactions);
        setAverageSales(avgSales);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch average sales data');
      // Fallback to provided amount or 0
      setAverageSales(amount || 0);
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
          Average sales
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
          Average sales
        </h3>
        <div className="flex-1 flex items-center">
          <p className="text-red-500 text-sm">
            Unable to load data
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
        Average sales
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
            {formatCurrency(averageSales)}
          </p>

          {/* Info indicator for calculated value */}
          {!amount && (
            <div className="text-xs text-blue-600 mt-1">
              Calculated from total sales
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

export default AverageSalesCard;