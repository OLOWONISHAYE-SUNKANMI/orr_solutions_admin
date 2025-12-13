"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

export default function ProRataApprovalsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8002/admin-portal/v1/prorata-approvals/requests/');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('API Error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching pro-rata data:', error);
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Pro-rata Approvals</h1>
            <p className="text-gray-400">Billing adjustments and approval management</p>
          </div>

          {/* Statistics */}
          {data?.statistics && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Clock className="text-orange-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Pending</h3>
                  <p className="text-2xl font-bold text-orange-400">{data.statistics.pending_requests}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <CheckCircle className="text-green-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Approved</h3>
                  <p className="text-2xl font-bold text-green-400">{data.statistics.approved_requests}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <XCircle className="text-red-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Rejected</h3>
                  <p className="text-2xl font-bold text-red-400">{data.statistics.rejected_requests}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <DollarSign className="text-blue-400 mb-2" size={24} />
                  <h3 className="text-lg font-medium text-white">Pending Amount</h3>
                  <p className="text-2xl font-bold text-blue-400">${data.statistics.total_prorata_amount_pending}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pending Requests */}
          {data?.pending_requests && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Pending Requests</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="space-y-4">
                  {data.pending_requests.map((request: any) => (
                    <div key={request.request_id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-medium">{request.client_name}</h3>
                          <p className="text-gray-400 text-sm">{request.client_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">${request.prorata_amount}</p>
                          <p className="text-gray-400 text-sm">{request.request_type}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-300 text-sm">{request.reason}</p>
                          <p className="text-gray-500 text-xs">Requested: {new Date(request.requested_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Decisions */}
          {data?.recent_decisions && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Recent Decisions</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="space-y-3">
                  {data.recent_decisions.map((decision: any) => (
                    <div key={decision.request_id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                      <div>
                        <p className="text-white">{decision.client_name}</p>
                        <p className="text-gray-400 text-sm">{decision.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          decision.decision === 'approved' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {decision.decision.toUpperCase()}
                        </p>
                        <p className="text-gray-400 text-sm">${decision.prorata_amount}</p>
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
