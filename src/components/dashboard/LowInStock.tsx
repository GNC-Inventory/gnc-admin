// components/dashboard/LowInStock.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowInStockProps {
  period?: string;
  threshold?: number;
}

interface LowStockItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  locationName: string;
  urgencyLevel: 'critical' | 'warning';
  reorderPoint: number;
  lastUpdated: string;
}

interface ApiResponse {
  totalLowStockItems: number;
  criticalItems: number;
  warningItems: number;
  items: LowStockItem[];
}

const LowInStock: React.FC<LowInStockProps> = ({
  period = 'today',
  threshold = 10
}) => {
  const [lowStockData, setLowStockData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback data
  const fallbackData: ApiResponse = {
    totalLowStockItems: 25,
    criticalItems: 8,
    warningItems: 17,
    items: []
  };

  // Get appropriate icon color based on urgency
  const getIconColor = (data: ApiResponse | null) => {
    if (!data) return 'text-red-500';

    if (data.criticalItems > 0) return 'text-red-500';
    if (data.warningItems > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  // Get urgency text
  const getUrgencyText = (data: ApiResponse | null) => {
    if (!data) return 'Items';

    if (data.criticalItems > 0) {
      return `Items (${data.criticalItems} critical)`;
    }
    if (data.warningItems > 0) {
      return `Items (${data.warningItems} warning)`;
    }
    return 'Items';
  };

  // Fetch low stock alerts from API
  const fetchLowStockAlerts = async () => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/low-stock-alerts?threshold=${threshold}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const apiData: ApiResponse = result.data;
        setLowStockData(apiData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      // Use fallback data on error
      setLowStockData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchLowStockAlerts();
  }, [threshold]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-gray-300 animate-pulse" />
          <h3 className="text-gray-600 text-sm font-medium">
            Low in stock
          </h3>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-1 w-16" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
        </div>
      </div>
    );
  }

  // Ensure we have data (fallback or real)
  const data = lowStockData || fallbackData;
  const isUsingFallbackData = lowStockData === fallbackData || error;
  const iconColor = getIconColor(data);
  const urgencyText = getUrgencyText(data);

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title with warning icon */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
        <h3 className="text-gray-600 text-sm font-medium">
          Low in stock
          {isUsingFallbackData && (
            <span className="text-blue-500 text-xs ml-1">(Sample)</span>
          )}
        </h3>
      </div>

      {/* Count */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <p
            className="text-[#0A0D14] font-semibold"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 600
            }}
          >
            {data.totalLowStockItems}
          </p>

          {/* Urgency indicator */}
          {data.criticalItems > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              Critical
            </span>
          )}
        </div>

        <p className="text-gray-500 text-sm">
          {urgencyText}
        </p>

        {/* Additional info */}
        {data.criticalItems === 0 && data.warningItems === 0 && data.totalLowStockItems === 0 && (
          <p className="text-green-600 text-xs mt-1">
            All items well stocked
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-1">
            Unable to load live data
          </p>
        )}
      </div>
    </div>
  );
};

export default LowInStock;