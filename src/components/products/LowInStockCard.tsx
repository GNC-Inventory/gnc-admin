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
        {/* Item Count and Items label - inline */}
<div className="flex items-baseline gap-2 mb-2">
  <p className="font-geist font-medium text-[32px] leading-[40px] text-[#0A0D14]">
    {itemCount}
  </p>
  <span className="font-inter font-medium text-base leading-6 text-[#868C98]" style={{ letterSpacing: '-1.1%' }}>
    items
  </span>
</div>
      </div>
    </div>
  );
};

export default LowInStockCard;