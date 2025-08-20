// components/dashboard/SalesGraph.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface SalesGraphProps {
  period?: string;
  days?: number; // Optional parameter for API
}

interface SalesDataPoint {
  time: string;
  value: number;
}

const SalesGraph: React.FC<SalesGraphProps> = ({ 
  period = 'today',
  days = 7 
}) => {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample fallback data that matches the pattern in your Figma design
  const fallbackSalesData: SalesDataPoint[] = [
    { time: '7:15', value: 20000 },
    { time: '8:15', value: 25000 },
    { time: '9:15', value: 30000 },
    { time: '10:15', value: 35000 },
    { time: '11:15', value: 40000 },
    { time: '12:15', value: 45000 },
    { time: '13:15', value: 42000 },
    { time: '14:15', value: 48000 },
    { time: '15:15', value: 52000 },
    { time: '16:15', value: 58000 },
    { time: '17:15', value: 35000 },
    { time: '18:15', value: 80000 },
  ];

  // Format Y-axis values
  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return `₦ ${(value / 1000).toFixed(0)}k`;
    }
    return `₦ ${value}`;
  };

  // Calculate dynamic Y-axis domain based on data
  const calculateYAxisDomain = (data: SalesDataPoint[]) => {
    if (data.length === 0) return [0, 100000];
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    // Add some padding
    const padding = (maxValue - minValue) * 0.1;
    const domain = [
      Math.max(0, Math.floor((minValue - padding) / 10000) * 10000),
      Math.ceil((maxValue + padding) / 10000) * 10000
    ];
    
    return domain;
  };

  // Fetch sales chart data from API
  const fetchSalesChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/sales-chart?days=${days}`, {
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
        // Check if we have actual data
        if (Array.isArray(result.data) && result.data.length > 0) {
          setSalesData(result.data);
        } else {
          // Use fallback data if API returns empty array
          setSalesData(fallbackSalesData);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching sales chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales chart data');
      // Use fallback data on error
      setSalesData(fallbackSalesData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSalesChartData();
  }, [days]);

  // Calculate Y-axis domain based on current data
  const yAxisDomain = calculateYAxisDomain(salesData);

  // Generate Y-axis ticks dynamically
  const generateYAxisTicks = (domain: number[]) => {
    const [min, max] = domain;
    const step = (max - min) / 5;
    return Array.from({ length: 6 }, (_, i) => min + (step * i));
  };

  const yAxisTicks = generateYAxisTicks(yAxisDomain);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h3 
            className="text-[#0A0D14] font-medium mb-1"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              fontWeight: 500
            }}
          >
            Sales
          </h3>
          <p className="text-gray-500 text-sm">
            Sales performance over time
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '180px' }}>
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              <div className="h-2 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h3 
            className="text-[#0A0D14] font-medium mb-1"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              fontWeight: 500
            }}
          >
            Sales
          </h3>
          <p className="text-gray-500 text-sm">
            Sales performance over time
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '180px' }}>
          <div className="text-center">
            <p className="text-red-500 text-sm mb-2">Unable to load chart data</p>
            <p className="text-gray-400 text-xs">Showing sample data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6">
        <h3 
          className="text-[#0A0D14] font-medium mb-1"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: 500
          }}
        >
          Sales
        </h3>
        <p className="text-gray-500 text-sm">
          Sales performance over time
          {salesData === fallbackSalesData && (
            <span className="text-blue-500 ml-1">(Sample data)</span>
          )}
        </p>
      </div>

      {/* Chart Container */}
      <div className="flex-1" style={{ minHeight: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={salesData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 25,
            }}
          >
            <XAxis 
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#9CA3AF',
                fontFamily: 'Inter, sans-serif'
              }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 12, 
                fill: '#9CA3AF',
                fontFamily: 'Inter, sans-serif'
              }}
              tickFormatter={formatYAxisValue}
              domain={yAxisDomain}
              ticks={yAxisTicks}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: '#3B82F6',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesGraph;