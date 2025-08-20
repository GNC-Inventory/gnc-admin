// components/dashboard/TopPerformingStaff.tsx
import React, { useState, useEffect } from 'react';

interface StaffData {
  id: number;
  name: string;
  amount: number;
  salesCount: number;
  avatar?: string;
  role?: string;
  growthPercentage?: number;
  joinDate?: string;
}

interface TopPerformingStaffProps {
  period?: string;
  limit?: number;
}

const TopPerformingStaff: React.FC<TopPerformingStaffProps> = ({ 
  period = 'today',
  limit = 1 
}) => {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback staff data matching your Figma design
  const fallbackStaffData: StaffData = {
    id: 1,
    name: 'Joseph Okoye',
    amount: 124000,
    salesCount: 23,
    role: 'Sales Associate'
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get avatar background color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green  
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16'  // lime
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Fetch top performing staff data from API
  const fetchTopPerformingStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/top-performing-staff?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Check if we have actual staff data
        if (Array.isArray(result.data) && result.data.length > 0) {
          // Get the top performer (first in the array)
          const topStaff = result.data[0];
          setStaffData(topStaff);
        } else {
          // Use fallback data if API returns empty array
          setStaffData(fallbackStaffData);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching top performing staff data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff data');
      // Use fallback data on error
      setStaffData(fallbackStaffData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTopPerformingStaff();
  }, [limit]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Top performing staff
        </h3>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            
            {/* Name skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="space-y-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>
      </div>
    );
  }

  // Error state or no data
  if (!staffData) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Top performing staff
        </h3>
        
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm text-center">
            {error ? 'Unable to load data' : 'No staff data available'}
          </p>
        </div>
      </div>
    );
  }

  const isUsingFallbackData = staffData === fallbackStaffData || error;
  const avatarColor = getAvatarColor(staffData.name);

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Title */}
      <h3 className="text-gray-600 text-sm font-medium mb-3">
        Top performing staff
        {isUsingFallbackData && (
          <span className="text-blue-500 text-xs ml-1">(Sample)</span>
        )}
      </h3>
      
      {/* Staff Info */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {staffData.avatar ? (
              <img 
                src={staffData.avatar} 
                alt={staffData.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {getInitials(staffData.name)}
              </span>
            )}
          </div>
          
          {/* Name and Role */}
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
            {staffData.role && (
              <p className="text-gray-400 text-xs truncate">
                {staffData.role}
              </p>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
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
            
            {/* Growth indicator */}
            {staffData.growthPercentage && staffData.growthPercentage !== 0 && (
              <span className={`text-xs ${
                staffData.growthPercentage > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {staffData.growthPercentage > 0 ? '+' : ''}{staffData.growthPercentage}%
              </span>
            )}
          </div>
          
          <p className="text-gray-500 text-xs">
            {staffData.salesCount} sales
          </p>
          
          {/* Join date if available */}
          {staffData.joinDate && (
            <p className="text-gray-400 text-xs">
              Joined {new Date(staffData.joinDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPerformingStaff;