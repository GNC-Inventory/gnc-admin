// components/dashboard/TaxDueCard.tsx
import React from 'react';

interface TaxDueCardProps {
  amount: number;
  period?: string;
}

const TaxDueCard: React.FC<TaxDueCardProps> = ({ 
  amount, 
  period = 'today' 
}) => {
  // Format number with Nigerian Naira symbol and commas
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Tax due
      </h3>
      
      {/* Amount */}
      <div className="flex-1 flex items-center">
        <p 
          className="text-[#0A0D14] font-semibold"
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: 600
          }}
        >
          {formatCurrency(amount)}
        </p>
      </div>
      
      {/* Optional period info */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
      </div>
    </div>
  );
};

export default TaxDueCard;