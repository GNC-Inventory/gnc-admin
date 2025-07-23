// components/dashboard/TotalAmountReturned.tsx
import React from 'react';

interface TotalAmountReturnedProps {
  period?: string;
}

const TotalAmountReturned: React.FC<TotalAmountReturnedProps> = ({ period = 'today' }) => {
  // Sample returned amount data
  const returnedAmount = 20000;

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Total amount returned
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
          {formatCurrency(returnedAmount)}
        </p>
      </div>
      
      {/* Optional period info */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
      </div>
    </div>
  );
};

export default TotalAmountReturned;