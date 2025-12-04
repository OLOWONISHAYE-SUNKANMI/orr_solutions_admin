"use client";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  MoreVertical,
  Wallet,
  Loader,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { billingAPI, BillingHistoryItem, PaymentStats } from "@/app/services";

const navCategories = ["All", "Savings", "Income", "Expenses"];

export default function PaymentManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [transactions, setTransactions] = useState<BillingHistoryItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch billing history with optional filter
      const filters: Record<string, any> = {};
      if (selectedCategory !== "All") {
        filters.type = selectedCategory.toLowerCase();
      }
      
      const [historyData, statsData] = await Promise.all([
        billingAPI.getHistory(filters).catch(() => []),
        billingAPI.getStats().catch(() => null),
      ]);
      
      setTransactions((historyData as BillingHistoryItem[]) || []);
      setStats((statsData as PaymentStats) || null);
    } catch (err: any) {
      console.warn("Payment data fetch failed:", err);
      setError(err.message || "Failed to load payment data");
      // Set empty data instead of crashing
      setTransactions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert("CSV export functionality coming soon");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "cancelled":
      case "refunded":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden star flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col gap-6 md:gap-8">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-400 text-sm">{error} - Showing empty data</p>
                </div>
                <button 
                  onClick={fetchData}
                  className="bg-red-500/30 hover:bg-red-500/40 text-red-300 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Transactions History
            </h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-white bg-primary p-2 md:p-3 rounded-xl text-sm md:text-base text-center sm:text-left">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 md:gap-3">
                <button 
                  onClick={handleExportCSV}
                  className="text-white bg-primary p-2 md:p-3 rounded-xl text-sm md:text-base flex items-center justify-center gap-2 hover:bg-primary/80 transition-all"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button className="text-white bg-primary p-2 md:p-3 rounded-xl text-sm md:text-base hover:bg-primary/80 transition-all">
                  Download Invoices
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white/10 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0">
                    <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-primary m-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-400">Total Revenue</p>
                    <p className="font-bold text-xl md:text-3xl truncate">${stats?.total_revenue || "0.00"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0">
                    <Wallet className="w-4 h-4 md:w-6 md:h-6 text-primary m-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-400">Pending Amount</p>
                    <p className="font-bold text-xl md:text-3xl truncate">${stats?.pending_amount || "0.00"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0">
                    <ArrowDown className="w-4 h-4 md:w-6 md:h-6 text-primary m-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-400">Completed</p>
                    <p className="font-bold text-xl md:text-3xl truncate">{stats?.completed_transactions || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-white/20 w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0">
                    <ArrowUp className="w-4 h-4 md:w-6 md:h-6 text-primary m-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-gray-400">Pending</p>
                    <p className="font-bold text-xl md:text-3xl truncate">{stats?.pending_transactions || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg">
              <div  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 gap-2">
                <div className="flex items-center overflow-x-auto">
                  {navCategories.map((category, index) => (
                    <div
                      onClick={() => setSelectedCategory(category)}
                      key={index}
                      className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-lg cursor-pointer whitespace-nowrap ${
                        selectedCategory === category
                          ? "text-primary border-b-2 border-primary font-bold"
                          : ""
                      }`}
                    >
                      {category}
                    </div>
                  ))}
                </div>

                <div className="text-sm md:text-lg px-3 sm:px-0">Status: All</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm">Ref ID</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm hidden sm:table-cell">Transaction Date</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm">From</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm hidden md:table-cell">Type</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm">Amount</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm">Status</th>
                      <th className="text-left p-2 md:p-3 text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-4">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center">
                          <p className="text-gray-400 text-sm md:text-base">No transactions found</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((row, index) => (
                        <tr key={row.id || index} className="border-b border-[#0ec277]">
                          <td className="py-3 px-2 md:py-4 md:px-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <span className="text-white text-xs md:text-sm">{row.reference_id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 md:py-4 md:px-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2 md:gap-3">
                              <span className="text-white text-xs md:text-sm">
                                {formatDate(row.transaction_date)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2 md:py-4 md:px-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-white/20 w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-base flex-shrink-0">
                                {row.client_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{row.client_name}</span>
                                <span className="text-xs text-gray-400 truncate">{row.client_email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 md:py-4 md:px-4 hidden md:table-cell">
                            <span className="text-white/70 text-xs md:text-sm">{row.payment_method}</span>
                          </td>

                          <td className="py-3 px-2 md:py-4 md:px-4">
                            <span className="rounded text-xs md:text-sm font-semibold">${row.amount}</span>
                          </td>
                          <td className="py-3 px-2 md:py-4 md:px-4">
                            <span
                              className={`rounded text-xs md:text-sm px-1.5 py-0.5 md:p-2 capitalize ${getStatusColor(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 md:py-4 md:px-4">
                            <div className="flex justify-end">
                              <MoreVertical size={18} className="md:w-6 md:h-6 cursor-pointer hover:text-primary transition-colors" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
