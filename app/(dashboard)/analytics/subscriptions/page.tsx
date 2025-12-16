"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

export default function SubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/subscriptions/management/');
        if (response.ok) {
          const result = await response.json();
          setData(result.data || result);
        } else {
          console.error('API Error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Subscriptions</h1>
            <p className="text-gray-400">Client subscriptions and plan management</p>
          </div>

          {/* Analytics */}
          {data?.analytics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Users className="text-blue-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Total Subscriptions</h3>
                  <p className="text-2xl font-bold text-blue-400">{data.analytics.total_subscriptions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <TrendingUp className="text-green-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Active</h3>
                  <p className="text-2xl font-bold text-green-400">{data.analytics.active_subscriptions}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <DollarSign className="text-purple-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Activation Rate</h3>
                  <p className="text-2xl font-bold text-purple-400">{data.analytics.activation_rate}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Calendar className="text-orange-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Churn Rate</h3>
                  <p className="text-2xl font-bold text-orange-400">{data.analytics.churn_rate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Distribution */}
          {data?.plan_distribution && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Plan Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(data.plan_distribution).map(([plan, details]: [string, any]) => (
                  <div key={plan} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-3 capitalize">{plan}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subscribers</span>
                        <span className="text-blue-400">{details.subscriber_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Revenue</span>
                        <span className="text-green-400">${details.monthly_revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Percentage</span>
                        <span className="text-purple-400">{details.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Subscriptions */}
          {data?.subscriptions && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Subscriptions</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white py-3">Client</th>
                        <th className="text-left text-white py-3">Plan</th>
                        <th className="text-left text-white py-3">Status</th>
                        <th className="text-left text-white py-3">Last Payment</th>
                        <th className="text-left text-white py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.subscriptions.slice(0, 10).map((sub: any) => (
                        <tr key={sub.subscription_id} className="border-b border-white/5">
                          <td className="text-gray-300 py-3">{sub.client_name}</td>
                          <td className="text-blue-400 py-3">{sub.plan_name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              sub.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="text-gray-400 py-3">
                            {sub.last_payment_date ? new Date(sub.last_payment_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="text-green-400 py-3 font-bold">${sub.last_payment_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Renewals */}
          {data?.upcoming_renewals && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Upcoming Renewals</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="space-y-3">
                  {data.upcoming_renewals.map((renewal: any) => (
                    <div key={renewal.subscription_id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                      <div>
                        <p className="text-white">{renewal.client_name}</p>
                        <p className="text-gray-400 text-sm">{renewal.plan_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">${renewal.estimated_amount}</p>
                        <p className="text-gray-400 text-sm">{renewal.days_until_renewal} days</p>
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
