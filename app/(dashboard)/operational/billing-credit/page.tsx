"use client";

import { DollarSign, CreditCard, TrendingUp, Users, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { billingAPI } from "@/app/services";
import type { PaymentStats } from "@/app/services";

export default function BillingCreditOverviewPage() {
  const [stats, setStats] = useState<any[]>([
    { label: "Total Revenue", value: "€0.00", icon: DollarSign, color: "text-green-400" },
    { label: "Active Subscriptions", value: "0", icon: Users, color: "text-blue-400" },
    { label: "Pending Payments", value: "€0.00", icon: CreditCard, color: "text-orange-400" },
    { label: "Completed Transactions", value: "0", icon: TrendingUp, color: "text-purple-400" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingStats = async () => {
      try {
        setLoading(true);
        const data = await billingAPI.getStats() as PaymentStats;
        
        setStats([
          { label: "Total Revenue", value: data.total_revenue || "€0.00", icon: DollarSign, color: "text-green-400" },
          { label: "Pending Payments", value: data.pending_amount || "€0.00", icon: CreditCard, color: "text-orange-400" },
          { label: "Completed Transactions", value: data.completed_transactions || "0", icon: TrendingUp, color: "text-purple-400" },
          { label: "Pending Transactions", value: data.pending_transactions || "0", icon: Users, color: "text-blue-400" },
        ]);
      } catch (err) {
        console.error("Failed to fetch billing stats:", err);
        setError("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingStats();
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Billing & Credit Overview</h1>
            <p className="text-gray-400">Financial summary and credit status</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`${stat.color} w-8 h-8`} />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
                <p className="text-gray-400">Transaction history will be displayed here</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
