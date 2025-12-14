"use client";

import { Users, UserCheck, Loader, Calendar, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { settingsAPI, meetingAPI } from "@/app/services";
import Pagination from "@/app/components/common/Pagination";

interface Consultant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  assigned_meetings?: number;
  completed_meetings?: number;
}

export default function AssignedConsultantsPage() {
  const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const [usersResponse, meetingsResponse] = await Promise.all([
          settingsAPI.listUsers(),
          meetingAPI.getStats()
        ]);
        
        const users = (usersResponse as any)?.data || usersResponse || [];
        const meetingStats = (meetingsResponse as any)?.data || meetingsResponse;
        
        // Filter for admin users who can be consultants
        const adminUsers = Array.isArray(users) ? users.filter((user: any) => 
          user.is_staff || user.groups?.some((group: any) => 
            group.name?.toLowerCase().includes('admin') || 
            group.name?.toLowerCase().includes('consultant')
          )
        ) : [];
        
        setAllConsultants(adminUsers);
      } catch (err) {
        console.error('Failed to fetch consultants:', err);
        setError('Failed to load consultants');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Assigned Consultants</h1>
            <p className="text-gray-400">Manage consultant assignments</p>
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
          ) : (() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedConsultants = allConsultants.slice(startIndex, endIndex);
            
            return allConsultants.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <UserCheck size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Consultants Found</h3>
                <p className="text-gray-400">No consultants available at the moment</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    Showing {paginatedConsultants.length} of {allConsultants.length} consultant{allConsultants.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedConsultants.map((consultant) => (
                    <div key={consultant.id} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <UserCheck className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {consultant.first_name} {consultant.last_name}
                          </h3>
                          <p className="text-sm text-gray-400">Consultant</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4" />
                          <span>{consultant.email}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-white">
                              {consultant.assigned_meetings || 0}
                            </div>
                            <div className="text-xs text-gray-400">Assigned</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-white">
                              {consultant.completed_meetings || 0}
                            </div>
                            <div className="text-xs text-gray-400">Completed</div>
                          </div>
                        </div>
                        
                        <button className="w-full mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-colors">
                          View Assignments
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {allConsultants.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(allConsultants.length / itemsPerPage)}
                    totalItems={allConsultants.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newItemsPerPage) => {
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
