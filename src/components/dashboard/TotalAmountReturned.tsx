// components/dashboard/TotalAmountReturned.tsx
import React, { useState, useEffect } from 'react';

interface TotalAmountReturnedProps {
  period?: string;
}

interface ReturnItem {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundAmount: number;
  processedById?: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const TotalAmountReturned: React.FC<TotalAmountReturnedProps> = ({ period = 'today' }) => {
  const [returnedAmount, setReturnedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnCount, setReturnCount] = useState<number>(0);

  // Fallback amount
  const fallbackAmount = 20000;

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Calculate total refund amount from returns data
  const calculateTotalRefunds = (returns: ReturnItem[]): number => {
    return returns.reduce((total, returnItem) => {
      // Only count approved returns for the refund amount
      if (returnItem.status === 'APPROVED') {
        return total + returnItem.refundAmount;
      }
      return total;
    }, 0);
  };

  // Fetch returns data from API
  const fetchReturnsData = async () => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/returns`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const returns: ReturnItem[] = result.data;

        // Calculate total refund amount
        const totalRefunds = calculateTotalRefunds(returns);
        setReturnedAmount(totalRefunds);
        setReturnCount(returns.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching returns data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch returns data');
      // Use fallback data on error
      setReturnedAmount(fallbackAmount);
      setReturnCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReturnsData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Total amount returned
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

  // Determine if using fallback data
  const isUsingFallbackData = returnedAmount === fallbackAmount && error;

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Total amount returned
        {isUsingFallbackData && (
          <span className="text-blue-500 text-xs ml-1">(Sample)</span>
        )}
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
            {formatCurrency(returnedAmount)}
          </p>

          {/* Additional info for live data */}
          {!isUsingFallbackData && returnCount > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              From {returnCount} return{returnCount !== 1 ? 's' : ''}
            </div>
          )}

          {/* No returns message */}
          {!isUsingFallbackData && returnedAmount === 0 && (
            <div className="text-xs text-green-600 mt-1">
              No returns processed
            </div>
          )}
        </div>
      </div>

      {/* Period info and status */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
        {error && (
          <span className="text-red-500 ml-2">
            • Unable to load live data
          </span>
        )}
      </div>
    </div>
  );
};

export default TotalAmountReturned;