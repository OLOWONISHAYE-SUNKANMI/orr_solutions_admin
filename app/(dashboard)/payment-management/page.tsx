"use client";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  MoreVertical,
  Wallet,
  Download,
} from "lucide-react";
import { DashboardSkeleton } from "@/app/components/ui/SkeletonPresets";
import { useState, useEffect } from "react";
import { billingAPI, BillingHistoryItem, PaymentStats } from "@/app/services";
import { useLanguageStore } from "@/store/languageStore";

export default function PaymentManagementPage() {
  const { t, language } = useLanguageStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [transactions, setTransactions] = useState<BillingHistoryItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navCategories = ["All", "Savings", "Income", "Expenses"];

  useEffect(() => {
    fetchData();
  }, [selectedCategory, language, t]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: Record<string, any> = {};
      if (selectedCategory !== "All") {
        filters.type = selectedCategory.toLowerCase();
      }
      
      const [historyData, statsData] = await Promise.all([
        billingAPI.getAllPayments(filters).catch(() => []),
        billingAPI.getAllPaymentStats().catch(() => null),
      ]);
      
      setTransactions((historyData as BillingHistoryItem[]) || []);
      setStats((statsData as PaymentStats) || null);
    } catch (err: any) {
      console.warn("Payment data fetch failed:", err);
      setError(t('analytics.error_fetch'));
      setTransactions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { 
      month: "short", 
      day: "numeric", 
      year: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-500 border border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30";
      case "cancelled":
      case "refunded":
        return "bg-red-500/20 text-red-500 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                  <p className="text-red-400 text-sm font-bold uppercase tracking-tight">{error}</p>
                </div>
                <button 
                  onClick={fetchData}
                  className="bg-red-500/30 hover:bg-red-500/40 text-red-300 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300"
                >
                  {t('settings.profile_section.save')}
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight italic">
                  {t('payment_mgmt.title')}
                </h1>
                <p className="text-gray-500 text-[10px] md:text-sm mt-1 uppercase tracking-[0.2em] font-bold">
                  {t('payment_mgmt.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="text-primary bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl text-xs md:text-sm font-mono font-bold text-center">
                  {new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <button className="text-white bg-primary hover:bg-primary/80 px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                  <Download size={16} />
                  {t('payment_mgmt.download_invoices')}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 hover:border-primary/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{t('payment_mgmt.total_revenue')}</p>
                    <p className="font-black text-xl md:text-2xl text-white truncate">${stats?.total_revenue || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 hover:border-orange-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{t('payment_mgmt.pending_amount')}</p>
                    <p className="font-black text-xl md:text-2xl text-white truncate">${stats?.pending_amount || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 hover:border-green-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDown className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{t('payment_mgmt.completed')}</p>
                    <p className="font-black text-xl md:text-2xl text-white truncate">{stats?.completed_transactions || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{t('payment_mgmt.pending')}</p>
                    <p className="font-black text-xl md:text-2xl text-white truncate">{stats?.pending_transactions || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Table */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 pt-4 gap-4 border-b border-white/10">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-8">
                  {navCategories.map((category, index) => (
                    <div
                      onClick={() => setSelectedCategory(category)}
                      key={index}
                      className={`pb-4 md:pb-5 text-[10px] md:text-xs uppercase tracking-[0.2em] cursor-pointer whitespace-nowrap transition-all duration-300 font-black ${
                        selectedCategory === category
                          ? "text-primary border-b-4 border-primary"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {category === "All" ? t('payment_mgmt.filters.all') : category}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] md:text-xs font-mono text-gray-400 mb-4 sm:mb-0 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {t('audit_logs.all_status')}: {t('payment_mgmt.filters.all')}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="bg-primary/10 border-b border-white/10">
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary">{t('payment_mgmt.table.ref_id')}</th>
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary hidden sm:table-cell">{t('payment_mgmt.table.date')}</th>
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary">{t('payment_mgmt.table.from')}</th>
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary hidden md:table-cell">{t('payment_mgmt.table.type')}</th>
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary">{t('payment_mgmt.table.amount')}</th>
                      <th className="text-left p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary">{t('payment_mgmt.table.status')}</th>
                      <th className="text-right p-4 text-[10px] md:text-xs uppercase tracking-widest font-black text-primary">{t('audit_logs.gdpr.title')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-20 text-center">
                          <Wallet size={48} className="text-white/5 mx-auto mb-4" />
                          <p className="text-gray-500 uppercase tracking-widest font-bold text-xs">{t('payment_mgmt.empty')}</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((row, index) => (
                        <tr key={row.id || index} className="hover:bg-white/5 transition-colors duration-200 group">
                          <td className="p-4">
                            <span className="text-white font-mono text-[10px] md:text-xs uppercase tracking-tighter opacity-80">{row.reference_id}</span>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                             <span className="text-gray-400 text-[10px] md:text-xs font-mono">{formatDate(row.transaction_date)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/20 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black text-primary flex-shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                {row.client_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs md:text-sm font-black text-white truncate max-w-[120px]">{row.client_name}</span>
                                <span className="text-[10px] text-gray-500 truncate font-mono">{row.client_email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-bold">{row.payment_method}</span>
                          </td>

                          <td className="p-4">
                            <span className="text-white text-xs md:text-sm font-black tracking-tight">${row.amount}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`rounded-lg text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 ${getStatusColor(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end">
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white">
                                <MoreVertical size={18} />
                              </button>
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
