// components/dashboard/TransactionsCard.tsx
import React from 'react';

interface TransactionsCardProps {
  count: number;
  period?: string;
}

const TransactionsCard: React.FC<TransactionsCardProps> = ({ 
  count, 
  period = 'today' 
}) => {
  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Transactions
      </h3>
      
      {/* Count */}
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
          {count}
        </p>
      </div>
      
      {/* Optional period info */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
      </div>
    </div>
  );
};

export default TransactionsCard;