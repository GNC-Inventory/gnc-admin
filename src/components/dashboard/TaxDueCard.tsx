// components/dashboard/TaxDueCard.tsx
import React, { useState, useEffect } from 'react';

interface TaxDueCardProps {
  amount?: number; // Made optional since we'll fetch from API
  period?: string;
  taxRate?: number; // Optional tax rate override
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

const TaxDueCard: React.FC<TaxDueCardProps> = ({ 
  amount,
  period = 'today',
  taxRate = 7.5 // Default Nigerian VAT rate
}) => {
  const [taxDueAmount, setTaxDueAmount] = useState<number>(amount || 0);
  const [loading, setLoading] = useState(!amount); // Only load if no amount provided
  const [error, setError] = useState<string | null>(null);

  // Format number with Nigerian Naira symbol and commas
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Calculate tax due from total sales
  const calculateTaxDue = (totalSales: number, rate: number): number => {
    return Math.round((totalSales * rate) / 100);
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
        const calculatedTax = calculateTaxDue(data.totalSales, taxRate);
        setTaxDueAmount(calculatedTax);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tax data');
      // Fallback to provided amount or 0
      setTaxDueAmount(amount || 0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount (only if no amount provided)
  useEffect(() => {
    if (!amount) {
      fetchDashboardStats();
    }
  }, [amount, taxRate]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Tax due
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
          Tax due
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
        Tax due
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
            {formatCurrency(taxDueAmount)}
          </p>
          
          {/* Tax rate indicator for calculated value */}
          {!amount && (
            <div className="text-xs text-orange-600 mt-1">
              {taxRate}% VAT on total sales
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

export default TaxDueCard;