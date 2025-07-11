'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  RotateCcw, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle 
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

const mainMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Returns Management', href: '/returns', icon: RotateCcw },
  { name: 'Sales Reports', href: '/sales-reports', icon: FileText },
  { name: 'User Management', href: '/user-management', icon: Users },
]

const otherMenuItems: MenuItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Support', href: '/support', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[272px] h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Main Menu Section */}
      <div className="pt-6 px-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          MAIN
        </h3>
        <nav className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Other Menu Section */}
      <div className="mt-8 px-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          OTHER
        </h3>
        <nav className="space-y-1">
          {otherMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}