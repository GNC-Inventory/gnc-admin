// components/products/LowInStockCard.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowInStockCardProps {
  itemCount: number;
  period?: string;
}

const LowInStockCard: React.FC<LowInStockCardProps> = ({ 
  itemCount, 
  period = 'today' 
}) => {
  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title with warning icon */}
<div className="flex items-center gap-2 mb-4">
  <AlertTriangle className="w-4 h-4 text-red-500" />
  <h3 className="font-inter font-medium text-base leading-6 text-[#868C98]" style={{ letterSpacing: '-1.1%' }}>
    Low in stock
  </h3>
</div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Item Count */}
        <p 
          className="text-[#0A0D14] font-semibold mb-2"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '48px',
            lineHeight: '56px',
            fontWeight: 600
          }}
        >
          {itemCount}
        </p>
        
        {/* Items label */}
        <p className="text-gray-500 text-sm">
          items
        </p>
      </div>
    </div>
  );
};

export default LowInStockCard;