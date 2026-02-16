'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Package, Users, DollarSign } from 'lucide-react';

interface SalesReport {
  summary: {
    totalSales: number;
    totalTransactions: number;
    averageOrderValue: number;
    totalProfit?: number;
    periodStart: Date;
    periodEnd: Date;
  };
}

interface InventoryReport {
  summary: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
    averageStock: number;
  };
}

interface PerformanceReport {
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalReturns: number;
    totalRefunds: number;
    staffCount: number;
  };
  staffPerformance: Array<{
    id: number;
    name: string;
    role: string;
    salesCount: number;
    totalSales: number;
  }>;
}

const SalesReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'performance'>('sales');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const query = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;

      if (activeTab === 'sales') {
        const response = await fetch(`/api/reports/sales${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSalesReport(data.success ? data.data : null);
        }
      } else if (activeTab === 'inventory') {
        const response = await fetch('/api/reports/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInventoryReport(data.success ? data.data : null);
        }
      } else if (activeTab === 'performance') {
        const response = await fetch(`/api/reports/performance${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPerformanceReport(data.success ? data.data : null);
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType: activeTab,
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.downloadUrl) {
          window.open(data.data.downloadUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Reports</h1>
          <p className="text-gray-600">Analyze your sales performance.</p>
        </div>

        {/* Tabs and Date Range */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'sales'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Sales Report
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'inventory'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Inventory Report
                </button>
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'performance'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Performance Report
                </button>
              </div>

              <div className="flex gap-3 items-center">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading report...</p>
              </div>
            ) : (
              <>
                {activeTab === 'sales' && salesReport && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          ₦{salesReport.summary.totalSales.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-green-600 font-medium">Total Transactions</p>
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {salesReport.summary.totalTransactions}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-purple-600 font-medium">Average Order Value</p>
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          ₦{salesReport.summary.averageOrderValue.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-indigo-600 font-medium">Total Profit</p>
                          <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          ₦{(salesReport.summary.totalProfit ?? Math.round(salesReport.summary.totalSales * 0.15)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Report */}
                {activeTab === 'inventory' && inventoryReport && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Total Items</p>
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {inventoryReport.summary.totalItems}
                        </p>
                      </div>

                      <div className="bg-white border-2 border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Low Stock</p>
                          <Package className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {inventoryReport.summary.lowStockCount}
                        </p>
                      </div>

                      <div className="bg-white border-2 border-red-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Out of Stock</p>
                          <Package className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {inventoryReport.summary.outOfStockCount}
                        </p>
                      </div>

                      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Total Value</p>
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          ₦{inventoryReport.summary.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Report */}
                {activeTab === 'performance' && performanceReport && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{performanceReport.summary.totalSales.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {performanceReport.summary.totalTransactions}
                        </p>
                      </div>
                      <div className="bg-white border-2 border-red-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Returns</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {performanceReport.summary.totalReturns}
                        </p>
                      </div>
                      <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Staff</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {performanceReport.summary.staffCount}
                        </p>
                      </div>
                    </div>

                    {/* Staff Performance Table */}
                    <div className="bg-white rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Staff Performance</h3>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {performanceReport.staffPerformance.map((staff) => (
                            <tr key={staff.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{staff.role}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{staff.salesCount}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                ₦{staff.totalSales.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportsPage;