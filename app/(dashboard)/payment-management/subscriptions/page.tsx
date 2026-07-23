"use client";

import React, { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Calendar, ShieldCheck, Download, LayoutGrid } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

export default function SubscriptionsManagementPage() {
  const { t, formatCurrency } = useLanguageStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/subscriptions/management/`);
        if (response.ok) {
          const result = await response.json();
          setData(result.data || result);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (!data?.subscriptions) return;
    
    const headers = ["Client", "Plan", "Status", "Yield", "Last Payment"];
    const rows = data.subscriptions.map((sub: any) => [
      sub.client_name,
      sub.plan_name,
      sub.status,
      sub.last_payment_amount,
      sub.last_payment_date || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscriptions_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative">
        <div className="absolute inset-0 bg-background -z-10" />
        <div className="p-8 animate-pulse space-y-8">
           <div className="h-12 bg-white/5 rounded-2xl w-1/3" />
           <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-white relative">
      <div className="fixed inset-0 bg-background -z-10">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Users size={14} />
              {t('subscriptions.lifecycle')}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              {t('subscriptions.title').split('&')[0]} <span className="text-primary italic">&</span> {t('subscriptions.title').split('&')[1]}
            </h1>
            <p className="text-slate-400 max-w-xl text-sm font-medium">
              {t('subscriptions.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
             <button 
               onClick={handleExportCSV}
               className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 transition-all"
             >
               <Download size={14} /> {t('subscriptions.export_csv')}
             </button>
          </div>
        </div>

        {/* Analytics Grid */}
        {data?.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { label: t('subscriptions.total_active'), value: data.analytics.total_subscriptions, icon: Users, color: 'text-blue-400' },
               { label: t('subscriptions.revenue_mrr'), value: formatCurrency(data.analytics.total_mrr || 0), icon: TrendingUp, color: 'text-emerald-400' },
               { label: t('subscriptions.activation'), value: `${data.analytics.activation_rate}%`, icon: ShieldCheck, color: 'text-purple-400' },
               { label: t('subscriptions.churn_rate'), value: `${data.analytics.churn_rate}%`, icon: Calendar, color: 'text-rose-400' }
             ].map((stat, i) => (
                <div key={i} className="bg-card/30 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                     <stat.icon size={80} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
               </div>
             ))}
          </div>
        )}

        {/* Plan Distribution */}
        <div className="space-y-4">
           <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
             <LayoutGrid size={16} /> {t('subscriptions.plan_distribution')}
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data?.plan_distribution && Object.entries(data.plan_distribution).map(([plan, details]: [string, any]) => (
                <div key={plan} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex justify-between items-center">
                     {plan}
                     <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{details.percentage}%</span>
                   </h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('subscriptions.active_seats')}</span>
                         <span className="text-xl font-black text-white">{details.subscriber_count}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('subscriptions.monthly_yield')}</span>
                         <span className="text-xl font-black text-emerald-400">{formatCurrency(details.monthly_revenue)}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* List Areas */}
        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden">
           <div className="p-8 border-b border-white/5">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('subscriptions.recent_activity')}</h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5">
                       <th className="py-6 px-8">{t('subscriptions.client')}</th>
                       <th className="py-6 px-8">{t('subscriptions.current_plan')}</th>
                       <th className="py-6 px-8">{t('subscriptions.status')}</th>
                       <th className="py-6 px-8 text-right">{t('subscriptions.yield')}</th>
                       <th className="py-6 px-8 text-right">{t('subscriptions.last_payment')}</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {data?.subscriptions && data.subscriptions.slice(0, 10).map((sub: any) => (
                      <tr key={sub.subscription_id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="py-6 px-8">
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{sub.client_name}</p>
                         </td>
                         <td className="py-6 px-8">
                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{sub.plan_name}</span>
                         </td>
                         <td className="py-6 px-8">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              sub.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                               {sub.status}
                            </span>
                         </td>
                         <td className="py-6 px-8 text-right">
                            <span className="text-sm font-black text-white">{formatCurrency(sub.last_payment_amount)}</span>
                         </td>
                         <td className="py-6 px-8 text-right">
                            <span className="text-xs text-slate-500">{sub.last_payment_date ? new Date(sub.last_payment_date).toLocaleDateString() : 'N/A'}</span>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
