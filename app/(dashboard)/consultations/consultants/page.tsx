"use client";

import { Users, UserCheck, Loader, Calendar, Mail, Phone, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { settingsAPI, meetingAPI } from "@/app/services";
import { useIsSuperAdmin } from "@/lib/rbac/hooks";
import Pagination from "@/app/components/common/Pagination";
import { useLanguageStore } from "@/store/languageStore";
import ConsultantAssignmentsModal from "@/app/components/consultations/ConsultantAssignmentsModal";

interface Consultant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  assigned_meetings?: number;
  completed_meetings?: number;
}

export default function AssignedConsultantsPage() {
  const { t } = useLanguageStore();
  const isSuperAdmin = useIsSuperAdmin();
  const [allConsultants, setAllConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteConsultant = async (consultant: Consultant) => {
    if (confirm(`Are you absolutely sure you want to delete specialist/consultant ${consultant.first_name} ${consultant.last_name}? This will permanently remove their profile and login account.`)) {
      try {
        setLoading(true);
        setError(null);
        await settingsAPI.deletePlatformUser(consultant.id);
        setAllConsultants(prev => prev.filter(c => c.id !== consultant.id));
      } catch (err: any) {
        setError(err.message || "Failed to delete consultant user");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const [usersResponse, meetingsResponse] = await Promise.all([
          settingsAPI.listUsers(),
          meetingAPI.listMeetings({})
        ]);

        const users = (usersResponse as any)?.data || usersResponse || [];
        const meetingsData = Array.isArray(meetingsResponse) ? meetingsResponse : ((meetingsResponse as any)?.results || (meetingsResponse as any)?.data || []);
        setAllMeetings(meetingsData);

        // Filter for admin users who can be consultants
        const adminUsers = Array.isArray(users) ? users.filter((user: any) =>
          user.role_name?.toLowerCase().includes('admin') ||
          user.role_name?.toLowerCase().includes('consultant') ||
          user.department?.toLowerCase().includes('consulting') ||
          user.is_active === true
        ).map((user: any) => {
          const fullName = `${user.first_name} ${user.last_name}`.trim();
          const userMeetings = meetingsData.filter((m: any) => m.host_name === fullName);
          return {
            ...user,
            assigned_meetings: userMeetings.length,
            completed_meetings: userMeetings.filter((m: any) => m.status === 'completed').length
          };
        }) : [];

        setAllConsultants(adminUsers);
      } catch (err) {
        console.error('Failed to fetch consultants:', err);
        setError(t('consultations.error_loading_consultants'));
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, [t]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{t('consultations.consultants_page_title')}</h1>
            <p className="text-gray-400">{t('consultations.consultants_page_subtitle')}</p>
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
                <h3 className="text-xl font-semibold text-white mb-2">{t('consultations.no_consultants')}</h3>
                <p className="text-gray-400">{t('consultations.no_consultants_desc')}</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    {t('consultations.showing_consultants')} {paginatedConsultants.length} {t('consultations.of')} {allConsultants.length} {allConsultants.length !== 1 ? t('consultations.consultants_plural') : t('consultations.consultant')}
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
                          <p className="text-sm text-gray-400">{t('consultations.consultant_role')}</p>
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
                            <div className="text-xs text-gray-400">{t('consultations.assigned')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-white">
                              {consultant.completed_meetings || 0}
                            </div>
                            <div className="text-xs text-gray-400">{t('consultations.completed')}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => {
                              setSelectedConsultant(consultant);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-colors"
                          >
                            {t('consultations.view_assignments')}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteConsultant(consultant)}
                              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
                              title="Delete Consultant"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
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

                <ConsultantAssignmentsModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  consultantName={selectedConsultant ? `${selectedConsultant.first_name} ${selectedConsultant.last_name}` : ''}
                  meetings={selectedConsultant ? allMeetings.filter((m: any) => m.host_name === `${selectedConsultant.first_name} ${selectedConsultant.last_name}`.trim()) : []}
                />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
