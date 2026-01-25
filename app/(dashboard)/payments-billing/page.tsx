"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, Users, Calendar, AlertCircle, CheckCircle, Clock, Download, RefreshCw, Search } from "lucide-react";

interface SubscriptionData {
  subscriptions: Array<{
    subscription_id: string;
    client_name: string;
    client_email: string;
    plan_name: string;
    is_active: boolean;
    created_date: string;
    current_period_end: string | null;
    status: string;
    last_payment_date: string | null;
    last_payment_amount: number;
    last_payment_status: string;
    total_paid: number;
    days_until_renewal: number | null;
  }>;
  analytics: {
    total_subscriptions: number;
    active_subscriptions: number;
    inactive_subscriptions: number;
    activation_rate: number;
    monthly_growth_rate: number;
    churn_rate: number;
    average_subscription_length: number;
  };
  plan_distribution: Record<string, {
    subscriber_count: number;
    monthly_revenue: number;
    percentage: number;
  }>;
  billing_health: {
    payment_success_rate: number;
    payment_failure_rate: number;
    outstanding_invoices: number;
    overdue_payments: number;
    total_outstanding_amount: number;
  };
  upcoming_renewals: Array<{
    subscription_id: string;
    client_name: string;
    client_email: string;
    plan_name: string;
    renewal_date: string;
    days_until_renewal: number;
    estimated_amount: number;
    payment_method_status: string;
  }>;
}

export default function PaymentsBillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      console.log('Fetching subscription data...');
      const response = await fetch('https://orr-backend.orr.solutions/admin-portal/v1/subscriptions/management/');
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        // Extract data from nested response if needed
        setSubscriptionData(data.data || data);
      } else {
        console.error('API Error:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'active') return 'text-green-400';
    if (status.toLowerCase() === 'inactive') return 'text-red-400';
    return 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase() === 'active') return <CheckCircle className="text-green-400" size={16} />;
    if (status.toLowerCase() === 'inactive') return <AlertCircle className="text-red-400" size={16} />;
    return <Clock className="text-gray-400" size={16} />;
  };

  const filteredSubscriptions = subscriptionData?.subscriptions.filter(sub => {
    const matchesSearch = sub.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || sub.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) || [];

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Payments & Billing</h1>
              <p className="text-gray-400">Subscription management and billing overview</p>
            </div>
            <button 
              onClick={fetchSubscriptionData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Analytics Overview */}
          {subscriptionData?.analytics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Users className="text-blue-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Total Subscriptions</h3>
                  <p className="text-2xl font-bold text-blue-400">{subscriptionData.analytics.total_subscriptions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <CheckCircle className="text-green-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Active Subscriptions</h3>
                  <p className="text-2xl font-bold text-green-400">{subscriptionData.analytics.active_subscriptions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <DollarSign className="text-purple-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Activation Rate</h3>
                  <p className="text-2xl font-bold text-purple-400">{subscriptionData.analytics.activation_rate}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <AlertCircle className="text-orange-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Churn Rate</h3>
                  <p className="text-2xl font-bold text-orange-400">{subscriptionData.analytics.churn_rate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing Health */}
          {subscriptionData?.billing_health && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Billing Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Success Rate</h3>
                  <p className="text-2xl font-bold text-green-400">{subscriptionData.billing_health.payment_success_rate}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Failure Rate</h3>
                  <p className="text-2xl font-bold text-red-400">{subscriptionData.billing_health.payment_failure_rate}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Outstanding</h3>
                  <p className="text-2xl font-bold text-yellow-400">{subscriptionData.billing_health.outstanding_invoices}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Overdue</h3>
                  <p className="text-2xl font-bold text-red-400">{subscriptionData.billing_health.overdue_payments}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Outstanding Amount</h3>
                  <p className="text-2xl font-bold text-orange-400">${subscriptionData.billing_health.total_outstanding_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by client name, email, or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">All Subscriptions ({filteredSubscriptions.length})</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white py-3">Client</th>
                      <th className="text-left text-white py-3">Plan</th>
                      <th className="text-left text-white py-3">Status</th>
                      <th className="text-left text-white py-3">Last Payment</th>
                      <th className="text-left text-white py-3">Total Paid</th>
                      <th className="text-left text-white py-3">Next Renewal</th>
                      <th className="text-left text-white py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.subscription_id} className="border-b border-white/5">
                        <td className="py-3">
                          <div>
                            <div className="text-white font-medium">{subscription.client_name}</div>
                            <div className="text-gray-400 text-sm">{subscription.client_email}</div>
                          </div>
                        </td>
                        <td className="text-blue-400 py-3">{subscription.plan_name}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <span className={`text-sm ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          {subscription.last_payment_date ? (
                            <div>
                              <div className="text-white">${subscription.last_payment_amount.toFixed(2)}</div>
                              <div className="text-gray-400 text-sm">
                                {new Date(subscription.last_payment_date).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No payments</span>
                          )}
                        </td>
                        <td className="text-green-400 py-3 font-bold">${subscription.total_paid.toFixed(2)}</td>
                        <td className="py-3">
                          {subscription.current_period_end ? (
                            <div>
                              <div className="text-white">
                                {new Date(subscription.current_period_end).toLocaleDateString()}
                              </div>
                              {subscription.days_until_renewal !== null && (
                                <div className="text-gray-400 text-sm">
                                  {subscription.days_until_renewal} days
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                            <button className="text-purple-400 hover:text-purple-300 text-sm">
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Upcoming Renewals */}
          {subscriptionData?.upcoming_renewals && subscriptionData.upcoming_renewals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Renewals</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptionData.upcoming_renewals.map((renewal) => (
                    <div key={renewal.subscription_id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{renewal.client_name}</h3>
                        <span className="text-orange-400 text-sm">{renewal.days_until_renewal} days</span>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">{renewal.client_email}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400">{renewal.plan_name}</span>
                        <span className="text-green-400 font-bold">${renewal.estimated_amount.toFixed(2)}</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Renews: {new Date(renewal.renewal_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}