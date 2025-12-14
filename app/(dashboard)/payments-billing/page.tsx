"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, CreditCard, AlertCircle, Calendar } from "lucide-react";

interface BillingOverview {
  revenue_metrics: {
    total_revenue: number;
    monthly_revenue: number;
    revenue_growth: number;
    average_revenue_per_user: number;
    monthly_recurring_revenue: number;
    annual_recurring_revenue: number;
  };
  subscription_metrics: {
    total_subscriptions: number;
    active_subscriptions: number;
    inactive_subscriptions: number;
    subscription_growth: number;
    churn_rate: number;
    retention_rate: number;
  };
  payment_metrics: {
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    payment_success_rate: number;
    average_transaction_value: number;
  };
  top_customers: Array<{
    email: string;
    name: string;
    total_revenue: number;
    transaction_count: number;
  }>;
}

interface PaymentAnalytics {
  volume_analytics: {
    total_transactions: number;
    transactions_last_30_days: number;
    daily_transaction_average: number;
    transaction_growth_rate: number;
  };
  revenue_analytics: {
    total_revenue: number;
    revenue_last_30_days: number;
    pending_revenue: number;
    average_transaction_value: number;
    monthly_recurring_revenue: number;
  };
  status_distribution: Record<string, number>;
  customer_behavior: {
    on_time_payment_rate: number;
    failed_payment_rate: number;
    customer_lifetime_value: number;
    churn_rate: number;
  };
}

export default function PaymentsBillingPage() {
  const [billingData, setBillingData] = useState<BillingOverview | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billingRes, paymentRes] = await Promise.all([
          fetch('http://127.0.0.1:8002/admin-portal/v1/billing-overview/'),
          fetch('http://127.0.0.1:8002/admin-portal/v1/wallet-logs/activity-analytics/')
        ]);
        
        if (billingRes.ok && paymentRes.ok) {
          const billing = await billingRes.json();
          const payment = await paymentRes.json();
          setBillingData(billing.data || billing);
          setPaymentData(payment.data || payment);
        } else {
          console.error('API Error:', billingRes.status, paymentRes.status);
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Payments & Billing</h1>
            <p className="text-gray-400">Financial transactions and billing overview</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && billingData && (
            <div className="space-y-8">
              {/* Revenue Metrics */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Revenue Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Total Revenue</h3>
                      <DollarSign className="text-green-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {formatCurrency(billingData.revenue_metrics.total_revenue)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">All-time revenue</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Monthly Revenue</h3>
                      <Calendar className="text-blue-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-blue-400">
                      {formatCurrency(billingData.revenue_metrics.monthly_revenue)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      <span className={billingData.revenue_metrics.revenue_growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {billingData.revenue_metrics.revenue_growth >= 0 ? '+' : ''}{billingData.revenue_metrics.revenue_growth}%
                      </span> from last month
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">MRR</h3>
                      <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-purple-400">
                      {formatCurrency(billingData.revenue_metrics.monthly_recurring_revenue)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Monthly Recurring Revenue</p>
                  </div>
                </div>
              </div>

              {/* Subscription Metrics */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Subscription Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Active</h3>
                      <Users className="text-green-400" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      {billingData.subscription_metrics.active_subscriptions}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {billingData.subscription_metrics.total_subscriptions} total
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Growth</h3>
                      <TrendingUp className="text-blue-400" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {billingData.subscription_metrics.subscription_growth}%
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Monthly growth</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Churn</h3>
                      <AlertCircle className="text-orange-400" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-orange-400">
                      {billingData.subscription_metrics.churn_rate}%
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Customer churn</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Retention</h3>
                      <Users className="text-green-400" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                      {billingData.subscription_metrics.retention_rate}%
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Customer retention</p>
                  </div>
                </div>
              </div>

              {/* Payment Performance */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Payment Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Success Rate</h3>
                      <CreditCard className="text-green-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {billingData.payment_metrics.payment_success_rate}%
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {billingData.payment_metrics.successful_payments} successful
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Failed Payments</h3>
                      <AlertCircle className="text-red-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-red-400">
                      {billingData.payment_metrics.failed_payments}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Require attention</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Avg Transaction</h3>
                      <DollarSign className="text-blue-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-blue-400">
                      {formatCurrency(billingData.payment_metrics.average_transaction_value)}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Average value</p>
                  </div>
                </div>
              </div>

              {/* Top Customers */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Top Customers</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white py-3">Customer</th>
                          <th className="text-left text-white py-3">Total Revenue</th>
                          <th className="text-left text-white py-3">Transactions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.top_customers.slice(0, 5).map((customer, index) => (
                          <tr key={index} className="border-b border-white/5">
                            <td className="text-gray-300 py-3">
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-gray-400">{customer.email}</p>
                              </div>
                            </td>
                            <td className="text-green-400 py-3 font-bold">
                              {formatCurrency(customer.total_revenue)}
                            </td>
                            <td className="text-blue-400 py-3">
                              {customer.transaction_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && paymentData && (
            <div className="space-y-8">
              {/* Volume Analytics */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Transaction Volume</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-2">Total</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      {paymentData.volume_analytics.total_transactions}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-2">Last 30 Days</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {paymentData.volume_analytics.transactions_last_30_days}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-2">Daily Average</h3>
                    <p className="text-2xl font-bold text-purple-400">
                      {paymentData.volume_analytics.daily_transaction_average}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-2">Growth Rate</h3>
                    <p className={`text-2xl font-bold ${paymentData.volume_analytics.transaction_growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {paymentData.volume_analytics.transaction_growth_rate >= 0 ? '+' : ''}{paymentData.volume_analytics.transaction_growth_rate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Behavior */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Customer Payment Behavior</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Payment Success</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">On-time Rate</span>
                        <span className="text-green-400">{paymentData.customer_behavior.on_time_payment_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Failed Rate</span>
                        <span className="text-red-400">{paymentData.customer_behavior.failed_payment_rate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Customer Value</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lifetime Value</span>
                        <span className="text-blue-400">{formatCurrency(paymentData.customer_behavior.customer_lifetime_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Churn Rate</span>
                        <span className="text-orange-400">{paymentData.customer_behavior.churn_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Payment Status Distribution</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(paymentData.status_distribution).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <p className="text-2xl font-bold text-white">{count}</p>
                        <p className="text-sm text-gray-400 capitalize">{status.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}