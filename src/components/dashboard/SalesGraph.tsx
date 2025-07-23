// components/dashboard/SalesGraph.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface SalesGraphProps {
  period?: string;
}

const SalesGraph: React.FC<SalesGraphProps> = ({ period = 'today' }) => {
  // Sample data that matches the pattern in your Figma design
  const salesData = [
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
              bottom: 10,
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
              domain={[0, 100000]}
              ticks={[0, 20000, 40000, 60000, 80000, 100000]}
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