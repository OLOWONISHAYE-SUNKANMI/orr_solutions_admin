"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, TrendingUp, Users, Calendar, AlertCircle, CheckCircle, Clock, Download } from "lucide-react";

interface BillingStats {
  total_revenue: number;
  pending_amount: number;
  completed_transactions: number;
  pending_transactions: number;
  monthly_revenue: number[];
  recent_revenue: number;
  total_customers: number;
  active_subscriptions: number;
}

interface BillingHistory {
  id: number;
  reference_id: string;
  transaction_date: string;
  client_name: string;
  client_email: string;
  payment_method: string;
  amount: string;
  status: string;
  billing_title: string;
  currency: string;
  plan: string;
  users: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

export default function PaymentsBillingPage() {
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchBillingData();
  }, [filters]);

  const fetchBillingData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);

      console.log('Fetching billing data...');
      const [statsRes, historyRes] = await Promise.all([
        fetch('https://orr-backend.orr.solutions/admin-portal/v1/billing-history/stats/'),
        fetch(`https://orr-backend.orr.solutions/admin-portal/v1/billing-history/?${queryParams}`)
      ]);
      
      console.log('Stats response status:', statsRes.status);
      console.log('History response status:', historyRes.status);
      
      if (statsRes.ok && historyRes.ok) {
        const stats = await statsRes.json();
        const history = await historyRes.json();
        console.log('Stats data:', stats);
        console.log('History data:', history);
        // Extract data from the nested response structure
        setBillingStats(stats.data || stats);
        setBillingHistory(history.data || history);
      } else {
        console.error('API Error:', statsRes.status, historyRes.status);
        if (!statsRes.ok) {
          const statsError = await statsRes.text();
          console.error('Stats error:', statsError);
        }
        if (!historyRes.ok) {
          const historyError = await historyRes.text();
          console.error('History error:', historyError);
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('paid')) return <CheckCircle className="text-green-400" size={16} />;
    if (status.toLowerCase().includes('pending')) return <Clock className="text-yellow-400" size={16} />;
    if (status.toLowerCase().includes('failed')) return <AlertCircle className="text-red-400" size={16} />;
    return <Clock className="text-gray-400" size={16} />;
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('paid')) return 'text-green-400';
    if (status.toLowerCase().includes('pending')) return 'text-yellow-400';
    if (status.toLowerCase().includes('failed')) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Payments & Billing</h1>
            <p className="text-gray-400">Financial transactions and billing overview</p>
          </div>

          {/* Billing Statistics */}
          {billingStats && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Financial Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <DollarSign className="text-green-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">${(billingStats.total_revenue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Clock className="text-yellow-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Pending Amount</h3>
                  <p className="text-2xl font-bold text-yellow-400">${(billingStats.pending_amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <CheckCircle className="text-blue-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Completed Transactions</h3>
                  <p className="text-2xl font-bold text-blue-400">{billingStats.completed_transactions || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Users className="text-purple-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Active Subscriptions</h3>
                  <p className="text-2xl font-bold text-purple-400">{billingStats.active_subscriptions || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Filter Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={filters.start_date} 
                  onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input 
                  type="date" 
                  value={filters.end_date} 
                  onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Billing History */}
          {billingHistory && Array.isArray(billingHistory) && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Invoice ID</th>
                        <th className="text-left text-white py-3">Client</th>
                        <th className="text-left text-white py-3">Amount</th>
                        <th className="text-left text-white py-3">Status</th>
                        <th className="text-left text-white py-3">Date</th>
                        <th className="text-left text-white py-3">Plan</th>
                        <th className="text-left text-white py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.slice(0, 10).map((transaction) => (
                        <tr key={transaction.reference_id} className="border-b border-white/5">
                          <td className="text-gray-300 py-3 font-mono text-sm">
                            {transaction.reference_id.substring(0, 12)}...
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{transaction.client_name}</div>
                              <div className="text-gray-400 text-sm">{transaction.client_email}</div>
                            </div>
                          </td>
                          <td className="text-green-400 py-3 font-bold">
                            ${parseFloat(transaction.amount).toFixed(2)} {transaction.currency}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              <span className={`text-sm ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </td>
                          <td className="text-gray-400 py-3">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="text-blue-400 py-3 text-sm">{transaction.plan}</td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              {transaction.invoice_pdf && (
                                <a 
                                  href={transaction.invoice_pdf} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Download PDF"
                                >
                                  <Download size={16} />
                                </a>
                              )}
                              {transaction.hosted_invoice_url && (
                                <a 
                                  href={transaction.hosted_invoice_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300"
                                  title="View Invoice"
                                >
                                  <CreditCard size={16} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Revenue Chart Placeholder */}
          {billingStats?.monthly_revenue && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Monthly Revenue Trend</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-12 gap-2 h-32">
                  {billingStats.monthly_revenue && billingStats.monthly_revenue.map((revenue, index) => {
                    const maxRevenue = Math.max(...billingStats.monthly_revenue);
                    const height = maxRevenue > 0 ? ((revenue || 0) / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col items-center justify-end">
                        <div 
                          className="bg-green-400 w-full rounded-t" 
                          style={{ height: `${height}%` }}
                          title={`Month ${index + 1}: $${(revenue || 0).toFixed(2)}`}
                        ></div>
                        <span className="text-xs text-gray-400 mt-1">{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-gray-400 text-sm mt-2">Monthly Revenue (Current Year)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
