"use client";

import { useState, useEffect } from "react";
import { Wallet, DollarSign, TrendingUp, CreditCard, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface TransactionLog {
  summary: {
    total_transactions: number;
    total_amount: number;
    successful_transactions: number;
    pending_transactions: number;
    failed_transactions: number;
  };
  transactions: {
    results: Array<{
      stripe_invoice_id: string;
      user: number;
      billing_title: string;
      status: string;
      billing_date: string;
      amount: string;
      currency: string;
      plan: string;
      created_at: string;
    }>;
  };
}

interface ActivityAnalytics {
  volume_analytics: {
    total_transactions: number;
    transactions_last_30_days: number;
    transactions_last_90_days: number;
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
  payment_method_analytics: Record<string, number>;
  status_distribution: Record<string, number>;
  customer_behavior: {
    on_time_payment_rate: number;
    late_payment_rate: number;
    failed_payment_rate: number;
    average_payment_delay: number;
    customer_lifetime_value: number;
    churn_rate: number;
  };
}

interface AuditTrail {
  recent_activities: Array<{
    transaction_id: string;
    user: string;
    amount: number;
    status: string;
    timestamp: string;
    plan: string;
    currency: string;
  }>;
  suspicious_activities: Array<{
    type: string;
    description: string;
    risk_level: string;
    user_id: number;
    timestamp: string;
  }>;
  compliance_metrics: {
    pci_compliance_status: string;
    data_retention_compliance: string;
    audit_log_retention_days: number;
    last_compliance_check: string;
    failed_transaction_investigation_rate: number;
    dispute_resolution_time: number;
  };
  audit_summary: {
    total_audited_transactions: number;
    transactions_last_30_days: number;
    flagged_transactions: number;
    resolved_disputes: number;
    pending_investigations: number;
    compliance_score: number;
  };
}

export default function WalletLogsPage() {
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog | null>(null);
  const [activityAnalytics, setActivityAnalytics] = useState<ActivityAnalytics | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditTrail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, analyticsRes, auditRes] = await Promise.all([
          fetch('https://orr-backend.orr.solutions/admin-portal/v1/wallet-logs/transactions/'),
          fetch('https://orr-backend.orr.solutions/admin-portal/v1/wallet-logs/activity-analytics/'),
          fetch('https://orr-backend.orr.solutions/admin-portal/v1/wallet-logs/audit-trail/')
        ]);
        
        if (logsRes.ok) {
          const logs = await logsRes.json();
          setTransactionLogs(logs.data || logs);
        } else {
          console.error('Logs API Error:', logsRes.status);
        }
        
        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          setActivityAnalytics(analytics.data || analytics);
        } else {
          console.error('Analytics API Error:', analyticsRes.status);
          const errorText = await analyticsRes.text();
          console.error('Analytics error details:', errorText);
        }
        
        if (auditRes.ok) {
          const audit = await auditRes.json();
          setAuditTrail(audit.data || audit);
        } else {
          console.error('Audit API Error:', auditRes.status);
        }
      } catch (error) {
        console.error('Error fetching wallet logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('paid')) return <CheckCircle className="text-green-400" size={16} />;
    if (status.toLowerCase().includes('pending')) return <Clock className="text-yellow-400" size={16} />;
    if (status.toLowerCase().includes('failed')) return <AlertCircle className="text-red-400" size={16} />;
    return <Clock className="text-gray-400" size={16} />;
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Wallet Logs</h1>
            <p className="text-gray-400">Transaction logs, payment analytics, and audit trails</p>
          </div>

          {/* Transaction Summary */}
          {transactionLogs?.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Transaction Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Wallet className="text-blue-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Total Transactions</h3>
                  <p className="text-2xl font-bold text-blue-400">{transactionLogs.summary.total_transactions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <DollarSign className="text-green-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Total Amount</h3>
                  <p className="text-2xl font-bold text-green-400">${transactionLogs.summary.total_amount.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <CheckCircle className="text-purple-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Successful</h3>
                  <p className="text-2xl font-bold text-purple-400">{transactionLogs.summary.successful_transactions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Clock className="text-orange-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Pending</h3>
                  <p className="text-2xl font-bold text-orange-400">{transactionLogs.summary.pending_transactions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <AlertCircle className="text-red-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Failed</h3>
                  <p className="text-2xl font-bold text-red-400">{transactionLogs.summary.failed_transactions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Analytics */}
          {activityAnalytics?.revenue_analytics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Revenue Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">${activityAnalytics.revenue_analytics.total_revenue.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Last 30 Days</h3>
                  <p className="text-2xl font-bold text-blue-400">${activityAnalytics.revenue_analytics.revenue_last_30_days.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Pending Revenue</h3>
                  <p className="text-2xl font-bold text-orange-400">${activityAnalytics.revenue_analytics.pending_revenue.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Avg Transaction</h3>
                  <p className="text-2xl font-bold text-purple-400">${activityAnalytics.revenue_analytics.average_transaction_value.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-2">Monthly Recurring</h3>
                  <p className="text-2xl font-bold text-cyan-400">${activityAnalytics.revenue_analytics.monthly_recurring_revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {transactionLogs?.transactions?.results && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Transaction ID</th>
                        <th className="text-left text-white py-3">Description</th>
                        <th className="text-left text-white py-3">Amount</th>
                        <th className="text-left text-white py-3">Status</th>
                        <th className="text-left text-white py-3">Date</th>
                        <th className="text-left text-white py-3">Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionLogs.transactions.results.slice(0, 10).map((transaction) => (
                        <tr key={transaction.stripe_invoice_id} className="border-b border-white/5">
                          <td className="text-gray-300 py-3 font-mono text-sm">{transaction.stripe_invoice_id}</td>
                          <td className="text-white py-3">{transaction.billing_title}</td>
                          <td className="text-green-400 py-3 font-bold">${parseFloat(transaction.amount).toFixed(2)}</td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              <span className={`text-sm ${
                                transaction.status.toLowerCase().includes('paid') ? 'text-green-400' :
                                transaction.status.toLowerCase().includes('pending') ? 'text-yellow-400' :
                                transaction.status.toLowerCase().includes('failed') ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {transaction.status}
                              </span>
                            </div>
                          </td>
                          <td className="text-gray-400 py-3">{new Date(transaction.billing_date).toLocaleDateString()}</td>
                          <td className="text-blue-400 py-3">{transaction.plan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Analytics */}
          {activityAnalytics?.payment_method_analytics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(activityAnalytics.payment_method_analytics).map(([method, percentage]) => (
                  <div key={method} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <CreditCard className="text-blue-400 mb-2" size={24} />
                    <h3 className="text-lg font-medium text-white capitalize">{method.replace('_', ' ')}</h3>
                    <p className="text-2xl font-bold text-blue-400">{percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Behavior */}
          {activityAnalytics?.customer_behavior && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Customer Payment Behavior</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Payment Rates</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">On-time</span>
                      <span className="text-green-400">{activityAnalytics.customer_behavior.on_time_payment_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Late</span>
                      <span className="text-yellow-400">{activityAnalytics.customer_behavior.late_payment_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed</span>
                      <span className="text-red-400">{activityAnalytics.customer_behavior.failed_payment_rate}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Customer Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Payment Delay</span>
                      <span className="text-orange-400">{activityAnalytics.customer_behavior.average_payment_delay} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lifetime Value</span>
                      <span className="text-purple-400">${activityAnalytics.customer_behavior.customer_lifetime_value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Churn Rate</span>
                      <span className="text-red-400">{activityAnalytics.customer_behavior.churn_rate}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Volume Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Average</span>
                      <span className="text-cyan-400">{activityAnalytics.volume_analytics.daily_transaction_average}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className="text-green-400">{activityAnalytics.volume_analytics.transaction_growth_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last 30 Days</span>
                      <span className="text-blue-400">{activityAnalytics.volume_analytics.transactions_last_30_days}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance & Audit */}
          {auditTrail?.compliance_metrics && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Compliance & Audit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Compliance Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">PCI Compliance</span>
                      <span className="text-green-400">{auditTrail.compliance_metrics.pci_compliance_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Retention</span>
                      <span className="text-green-400">{auditTrail.compliance_metrics.data_retention_compliance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Compliance Score</span>
                      <span className="text-purple-400">{auditTrail.audit_summary.compliance_score}/100</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Audit Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Audited</span>
                      <span className="text-blue-400">{auditTrail.audit_summary.total_audited_transactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flagged Transactions</span>
                      <span className="text-yellow-400">{auditTrail.audit_summary.flagged_transactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending Investigations</span>
                      <span className="text-red-400">{auditTrail.audit_summary.pending_investigations}</span>
                    </div>
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
