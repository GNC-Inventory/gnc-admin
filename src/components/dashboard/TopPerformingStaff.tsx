// components/dashboard/TopPerformingStaff.tsx
import React, { useState, useEffect } from 'react';

interface StaffData {
  id: string;
  name: string;
  amount: number;
  salesCount: number;
  avatar?: string;
  role?: string;
}

interface TopPerformingStaffProps {
  period?: string;
}

const TopPerformingStaff: React.FC<TopPerformingStaffProps> = ({
  period = 'today'
}) => {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦ ${value.toLocaleString()}`;
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get avatar background color
  const getAvatarColor = (name: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Fetch top performing staff
  const fetchTopPerformingStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prefer API key auth (bypasses JWT expiry issues); fall back to JWT
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (process.env.NEXT_PUBLIC_API_KEY) {
        headers['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication credentials available');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/top-performing-staff?limit=1`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const staff = result.data[0];
        setStaffData({
          id: staff.id,
          name: staff.name,
          amount: staff.salesAmount,
          salesCount: staff.salesCount,
          avatar: staff.avatar,
          role: staff.role
        });
      } else {
        // No staff data available
        setStaffData(null);
      }
    } catch (err) {
      console.error('Error fetching top performing staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setStaffData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPerformingStaff();
  }, [period]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Top performing staff
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!staffData) {
    return (
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-gray-600 text-sm font-medium mb-3">
          Top performing staff
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 text-sm">
            {error ? 'Unable to load live data' : 'No sales data yet'}
          </div>
        </div>
      </div>
    );
  }

  const avatarColor = getAvatarColor(staffData.name);

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
              <p className="text-gray-400 text-xs truncate capitalize">
                {staffData.role.toLowerCase()}
              </p>
            )}
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