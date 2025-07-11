'use client'

import { useState } from 'react'
import { Search, Bell } from 'lucide-react'

export default function Navbar() {
  const [currentPage, setCurrentPage] = useState('Dashboard')

  return (
    <nav className="w-full h-[88px] bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          {/* Placeholder for logo - replace with actual logo */}
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">
          Apex Manager
        </span>
      </div>

      {/* Right side - Search and Notification */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 bg-white rounded-lg p-2.5 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="w-10 h-10 bg-white rounded-lg p-2.5 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          New Sale
        </button>
      </div>
    </nav>
  )
}