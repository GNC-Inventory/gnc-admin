'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface Return {
  id: number;
  transactionId: number;
  productId: number;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  processedAt?: Date;
}

interface ReturnMetrics {
  totalReturns: number;
  totalRefunds: number;
  pendingReturns: number;
  averageRefund: number;
}

const ReturnsManagementPage = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [metrics, setMetrics] = useState<ReturnMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  useEffect(() => {
    fetchReturns();
    fetchMetrics();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/returns${query}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReturns(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/returns/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.success ? data.data : null);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleApprove = async (returnId: number) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchReturns();
        fetchMetrics();
        setSelectedReturn(null);
      }
    } catch (error) {
      console.error('Error approving return:', error);
    }
  };

  const handleReject = async (returnId: number, reason: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchReturns();
        fetchMetrics();
        setSelectedReturn(null);
      }
    } catch (error) {
      console.error('Error rejecting return:', error);
    }
  };

  const filteredReturns = returns.filter(r =>
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.transactionId.toString().includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns Management</h1>
          <p className="text-gray-600">Handle product returns and refunds.</p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Returns</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalReturns}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{metrics.totalRefunds.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.pendingReturns}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg Refund</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{metrics.averageRefund.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading returns...</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No returns found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {returnItem.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{returnItem.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ₦{returnItem.refundAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {returnItem.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(returnItem.status)}`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(returnItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {returnItem.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Process Return Modal */}
        {selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Process Return</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium text-gray-900">{selectedReturn.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Refund Amount</p>
                  <p className="font-medium text-gray-900">₦{selectedReturn.refundAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-gray-900">{selectedReturn.reason}</p>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={() => handleApprove(selectedReturn.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedReturn.id, 'Rejected by admin')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="w-5 h-5 inline mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsManagementPage;