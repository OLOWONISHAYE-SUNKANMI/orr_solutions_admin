"use client";

import { DollarSign, CreditCard, TrendingUp, Users, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { billingAPI, BillingHistoryItem } from "@/app/services";
import type { PaymentStats } from "@/app/services";
import Pagination from "@/app/components/common/Pagination";

export default function BillingCreditOverviewPage() {
  const [stats, setStats] = useState<any[]>([
    { label: "Total Revenue", value: "€0.00", icon: DollarSign, color: "text-green-400" },
    { label: "Active Subscriptions", value: "0", icon: Users, color: "text-blue-400" },
    { label: "Pending Payments", value: "€0.00", icon: CreditCard, color: "text-orange-400" },
    { label: "Completed Transactions", value: "0", icon: TrendingUp, color: "text-purple-400" },
  ]);
  const [allTransactions, setAllTransactions] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const [statsResponse, transactionsResponse] = await Promise.all([
          billingAPI.getAllPaymentStats(),
          billingAPI.getAllPayments({})
        ]);
        
        // Handle API response structure
        console.log('Stats Response:', statsResponse);
        console.log('Transactions Response:', transactionsResponse);
        
        const statsData = (statsResponse as any)?.data || statsResponse;
        const transactionsData = (transactionsResponse as any)?.data || transactionsResponse;
        
        console.log('Processed Stats Data:', statsData);
        console.log('Processed Transactions Data:', transactionsData);
        
        setStats([
          { label: "Total Revenue", value: `$${statsData.total_revenue || "0.00"}`, icon: DollarSign, color: "text-green-400" },
          { label: "Active Subscriptions", value: statsData.active_subscriptions || "0", icon: Users, color: "text-blue-400" },
          { label: "Pending Payments", value: `$${statsData.pending_amount || "0.00"}`, icon: CreditCard, color: "text-orange-400" },
          { label: "Completed Transactions", value: statsData.completed_transactions || "0", icon: TrendingUp, color: "text-purple-400" },
        ]);
        
        // Ensure transactionsData is an array
        const transactions = Array.isArray(transactionsData) ? transactionsData : [];
        console.log('Final transactions array:', transactions);
        setAllTransactions(transactions);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
        setError("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
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
                {(() => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
                  
                  return allTransactions.length === 0 ? (
                    <p className="text-gray-400">No recent transactions found</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {paginatedTransactions.map((transaction, index) => (
                          <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{transaction.client_name || 'Unknown Client'}</p>
                                <p className="text-gray-400 text-sm">{transaction.reference_id}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">${transaction.amount}</p>
                              <p className={`text-sm capitalize ${
                                transaction.status === 'completed' ? 'text-green-400' :
                                transaction.status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {transaction.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(allTransactions.length / itemsPerPage)}
                        totalItems={allTransactions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                          setItemsPerPage(newItemsPerPage);
                          setCurrentPage(1);
                        }}
                      />
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
