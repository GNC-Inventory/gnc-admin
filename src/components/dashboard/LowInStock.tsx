// components/dashboard/LowInStock.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowInStockProps {
  period?: string;
}

const LowInStock: React.FC<LowInStockProps> = ({ period = 'today' }) => {
  // Sample low stock data
  const lowStockCount = 25;
  const itemsText = 'Items';

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title with warning icon */}
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-gray-600 text-sm font-medium">
          Low in stock
        </h3>
      </div>
      
      {/* Count */}
      <div className="flex-1 flex flex-col justify-center">
        <p 
          className="text-[#0A0D14] font-semibold mb-1"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: 600
          }}
        >
          {lowStockCount}
        </p>
        <p className="text-gray-500 text-sm">
          {itemsText}
        </p>
      </div>
    </div>
  );
};

export default LowInStock;