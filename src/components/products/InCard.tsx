// components/products/InCard.tsx
import React from 'react';

interface InCardProps {
  itemCount: number;
  totalValue: number;
  period?: string;
}

const InCard: React.FC<InCardProps> = ({ 
  itemCount, 
  totalValue, 
  period = 'today' 
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
<h3 
  style={{
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '-1.1%',
    color: '#868C98'
  }}
  className="mb-4"
>
  In
</h3>
      
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
        <p className="text-gray-500 text-sm mb-4">
          items
        </p>
        
        {/* Total Value */}
        <p 
          className="text-[#0A0D14] font-semibold"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '20px',
            lineHeight: '24px',
            fontWeight: 600
          }}
        >
          {formatCurrency(totalValue)}
        </p>
      </div>
    </div>
  );
};

export default InCard;