// components/Sidebar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  RotateCcw,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const mainMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      name: 'Inventory',
      icon: Package,
      href: '/inventory'
    },
    {
      name: 'Transactions',
      icon: CreditCard,
      href: '/transactions'
    },
    {
      name: 'Returns Management',
      icon: RotateCcw,
      href: '/returns'
    },
    {
      name: 'Sales Reports',
      icon: BarChart3,
      href: '/sales-reports'
    },
    {
      name: 'User Management',
      icon: Users,
      href: '/user-management'
    }
  ];

  const otherMenuItems = [
    {
      name: 'Settings',
      icon: Settings,
      href: '/settings'
    },
    {
      name: 'Support',
      icon: HelpCircle,
      href: '/support'
    }
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'AD';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return 'Admin User';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="w-[272px] min-h-screen max-w-[272px] 2xl:w-[320px] 2xl:max-w-[320px] bg-white border-r border-[#E2E4E9] flex flex-col" style={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-6">
        <div className="w-8 h-8 relative">
          <Image
            src="/logo.png"
            alt="GNC Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">GNC Manager</h1>
      </div>

      {/* Horizontal line */}
      <div className="border-b border-[#E2E4E9] mx-8"></div>

      {/* Main Section */}
      <div className="flex-1 px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-2">
            MAIN
          </p>
          <nav className="space-y-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Other Section */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-2">
            OTHER
          </p>
          <nav className="space-y-2">
            {otherMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-[#E2E4E9] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {getUserInitials()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getFullName()}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'admin@example.com'}
            </p>
            {user?.role && (
              <p className="text-xs text-blue-600 font-medium">
                {user.role}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;