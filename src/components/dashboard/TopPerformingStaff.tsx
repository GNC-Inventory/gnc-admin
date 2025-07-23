// components/dashboard/TopPerformingStaff.tsx
import React from 'react';

interface StaffData {
  name: string;
  amount: number;
  salesCount: number;
  avatar?: string;
}

interface TopPerformingStaffProps {
  period?: string;
}

const TopPerformingStaff: React.FC<TopPerformingStaffProps> = ({ period = 'today' }) => {
  // Sample staff data matching your Figma design
  const staffData: StaffData = {
    name: 'Joseph Okoye',
    amount: 124000,
    salesCount: 23
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Top performing staff
      </h3>
      
      {/* Staff Info */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {getInitials(staffData.name)}
            </span>
          </div>
          
          {/* Name */}
          <div className="flex-1 min-w-0">
            <p 
              className="text-[#0A0D14] font-medium truncate"
              style={{
                fontFamily: 'Geist, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: 500
              }}
            >
              {staffData.name}
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-1">
          <p 
            className="text-[#0A0D14] font-semibold"
            style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: '16px',
              lineHeight: '20px',
              fontWeight: 600
            }}
          >
            {formatCurrency(staffData.amount)}
          </p>
          <p className="text-gray-500 text-xs">
            {staffData.salesCount} sales
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopPerformingStaff;