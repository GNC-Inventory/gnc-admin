// components/dashboard/TotalReturnedItems.tsx
import React from 'react';

interface TotalReturnedItemsProps {
  period?: string;
}

const TotalReturnedItems: React.FC<TotalReturnedItemsProps> = ({ period = 'today' }) => {
  // Sample returned items data
  const returnedItemsCount = 4;

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Total returned items
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
          {returnedItemsCount}
        </p>
      </div>
      
      {/* Optional period info */}
      <div className="text-xs text-gray-500 mt-2">
        {period}
      </div>
    </div>
  );
};

export default TotalReturnedItems;