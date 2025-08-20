// components/dashboard/TotalReturnedItems.tsx
import React, { useState, useEffect } from 'react';

interface TotalReturnedItemsProps {
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

const TotalReturnedItems: React.FC<TotalReturnedItemsProps> = ({ period = 'today' }) => {
  const [returnedItemsCount, setReturnedItemsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<{
    approved: number;
    pending: number;
    rejected: number;
  }>({ approved: 0, pending: 0, rejected: 0 });

  // Fallback count
  const fallbackCount = 4;

  // Calculate total returned items quantity from returns data
  const calculateTotalItems = (returns: ReturnItem[]) => {
    const total = returns.reduce((sum, returnItem) => sum + returnItem.quantity, 0);
    
    // Calculate status breakdown
    const breakdown = returns.reduce((acc, returnItem) => {
      acc[returnItem.status.toLowerCase() as keyof typeof acc] += returnItem.quantity;
      return acc;
    }, { approved: 0, pending: 0, rejected: 0 });

    return { total, breakdown };
  };

  // Fetch returns data from API
  const fetchReturnsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/returns`, {
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
        const returns: ReturnItem[] = result.data;
        const { total, breakdown } = calculateTotalItems(returns);
        
        setReturnedItemsCount(total);
        setStatusBreakdown(breakdown);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching returns data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch returns data');
      // Use fallback data on error
      setReturnedItemsCount(fallbackCount);
      setStatusBreakdown({ approved: 2, pending: 1, rejected: 1 });
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
          Total returned items
        </h3>
        
        <div className="flex-1 flex items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Loading...
        </div>
      </div>
    );
  }

  // Determine if using fallback data
  const isUsingFallbackData = returnedItemsCount === fallbackCount && error;

  // Generate status text
  const getStatusText = () => {
    if (isUsingFallbackData) return null;
    
    if (returnedItemsCount === 0) {
      return <span className="text-green-600">No items returned</span>;
    }

    const statusParts = [];
    if (statusBreakdown.approved > 0) {
      statusParts.push(`${statusBreakdown.approved} approved`);
    }
    if (statusBreakdown.pending > 0) {
      statusParts.push(`${statusBreakdown.pending} pending`);
    }
    if (statusBreakdown.rejected > 0) {
      statusParts.push(`${statusBreakdown.rejected} rejected`);
    }

    return statusParts.length > 0 ? (
      <span className="text-blue-600">{statusParts.join(', ')}</span>
    ) : null;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Total returned items
        {isUsingFallbackData && (
          <span className="text-blue-500 text-xs ml-1">(Sample)</span>
        )}
      </h3>
      
      {/* Count */}
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
            {returnedItemsCount}
          </p>
          
          {/* Status breakdown */}
          {getStatusText() && (
            <div className="text-xs mt-1">
              {getStatusText()}
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

export default TotalReturnedItems;