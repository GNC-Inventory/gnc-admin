// components/Navbar.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Plus } from 'lucide-react';

// Define page configurations
const pageConfigs = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'View your recent activities.',
    showNewSaleButton: true,
    buttonText: '+ Add Product'
  },
  '/inventory': {
    title: 'Inventory Management',
    subtitle: 'Full control of stock and item-level data.',
    showNewSaleButton: true,
    buttonText: '+ Add Product'
  },
  '/inventory/add-product': {
    title: 'Add a product',
    subtitle: 'Build your inventory. Ensure your data entry is correct before saving.',
    showNewSaleButton: true,
    buttonText: '+ New product'
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'View and manage all transactions.',
    showNewSaleButton: true,
    buttonText: '+ New Transaction'
  },
  '/returns': {
    title: 'Returns Management',
    subtitle: 'Handle product returns and refunds.',
    showNewSaleButton: true,
    buttonText: '+ Process Return'
  },
  '/sales-reports': {
    title: 'Sales Reports',
    subtitle: 'Analyze your sales performance.',
    showNewSaleButton: false,
    buttonText: '+ Generate Report'
  },
  '/user-management': {
    title: 'User Management',
    subtitle: 'Manage users and their access',
    showNewSaleButton: true,  // ✅ CHANGED TO TRUE - Show Add User button in Navbar
    buttonText: '+ Add User'
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Configure your application settings.',
    showNewSaleButton: false,
    buttonText: '+ Add Setting'
  },
  '/support': {
    title: 'Support',
    subtitle: 'Get help and contact support.',
    showNewSaleButton: true,
    buttonText: '+ New Ticket'
  }
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get current page config or default to dashboard
  const currentConfig = pageConfigs[pathname as keyof typeof pageConfigs] || pageConfigs['/dashboard'];

  const handleButtonClick = () => {
    // Add specific actions based on current page
    switch(pathname) {
      case '/dashboard':
        router.push('/inventory/add-product');
        break;
      case '/inventory':
        router.push('/inventory/add-product');
        break;
      case '/inventory/add-product':
        // Could add functionality to reset form or add another product
        break;
      case '/transactions':
        // Add transaction functionality here
        break;
      case '/user-management':
        // Trigger Add User modal
        // This will be handled via a custom event
        window.dispatchEvent(new Event('openCreateUserModal'));
        break;
      default:
        router.push('/inventory/add-product');
    }
  };

  const handleSearch = () => {
    // Add search functionality here
  };

  const handleNotification = () => {
    // Add notification functionality here
  };

  return (
    <div 
      className="flex items-center justify-between bg-white border-b border-gray-200"
      style={{ 
        width: '1168px',
        height: '88px',
        left: '272px',
        borderBottomWidth: '1px',
        gap: '12px',
        opacity: 1,
        paddingTop: '20px',
        paddingRight: '32px',
        paddingBottom: '20px',
        paddingLeft: '32px',
        background: '#FFFFFF'
      }}
    >
      {/* Left Section - Title and Subtitle */}
      <div 
        className="flex flex-col gap-1 flex-1"
        style={{ 
          maxWidth: '874px',
          height: '48px'
        }}
      >
        <h4 
          className="text-[#0A0D14] font-semibold"
          style={{
            height: '24px',
            fontFamily: 'Geist, sans-serif',
            fontWeight: 600,  // ✅ CHANGED FROM 500 TO 600 - Bolder text
            fontSize: '18px',
            lineHeight: '24px',
            letterSpacing: '-1.5%'
          }}
        >
          {currentConfig.title}
        </h4>
        <p 
          className="text-[#525866]"
          style={{
            height: '20px',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.6%'
          }}
        >
          {currentConfig.subtitle}
        </p>
      </div>

      {/* Right Section - Icons and Button */}
      <div className="flex items-center gap-4">
        {/* Search Icon */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
          style={{
            width: '20px',
            height: '20px'
          }}
        >
          <Search 
            className="text-gray-600 hover:text-gray-800"
            style={{
              width: '15.235px',
              height: '15.235px'
            }}
          />
        </button>

        {/* Notification Icon */}
        <button
          onClick={handleNotification}
          className="relative flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
          style={{
            width: '20px',
            height: '20px'
          }}
        >
          <Bell 
            className="text-gray-600 hover:text-gray-800"
            style={{
              width: '15px',
              height: '15.75px'
            }}
          />
          {/* Notification dot */}
          <div 
            className="absolute -top-1 -right-1 bg-red-500 border-2 border-white rounded-full"
            style={{
              width: '4px',
              height: '4px'
            }}
          />
        </button>

        {/* Action Button */}
        {currentConfig.showNewSaleButton && (
          <button
            onClick={handleButtonClick}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-3 py-2.5 flex items-center gap-1 transition-colors font-medium text-sm"
            style={{
              width: '114px',
              height: '40px',
              gap: '4px',
              padding: '10px'
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium">
              {currentConfig.buttonText.replace('+ ', '')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar; 