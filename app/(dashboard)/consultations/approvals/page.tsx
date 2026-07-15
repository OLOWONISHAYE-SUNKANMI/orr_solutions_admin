"use client";

import { useState, useEffect } from "react";
import {
  Search, CheckCircle, XCircle, UserCheck, Briefcase, Loader,
  Globe, Phone, Clock, Award, Code, FileText, DollarSign, ShieldCheck,
  MapPin, Languages, Layers, Star
} from "lucide-react";
import { consultantApprovalAPI } from "@/app/services/api";
import { useLanguageStore } from "@/store/languageStore";
import { useNotificationContext } from "@/lib/contexts/NotificationContext";

export default function ConsultantApprovalsPage() {
  const { t } = useLanguageStore();
  const { addNotification } = useNotificationContext();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await consultantApprovalAPI.listPending();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.results || []);
      setApplications(list);
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to fetch pending applications', title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedApp) return;
    if (action === "reject" && !notes.trim()) {
      addNotification({ type: 'error', message: 'Please provide rejection notes', title: 'Error' });
      return;
    }

    try {
      setActionLoading(true);
      await consultantApprovalAPI.performAction(selectedApp.id, action, notes);
      addNotification({ type: 'success', message: `Application ${action}d successfully`, title: 'Success' });
      setSelectedApp(null);
      setNotes("");
      fetchApplications();
    } catch (err) {
      addNotification({ type: 'error', message: `Failed to ${action} application`, title: 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      (app.profile?.full_name || "").toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query) ||
      (app.consultant_number || "").toLowerCase().includes(query)
    );
  });

  const renderTagList = (items: string[] | undefined, color = "white/10") => {
    if (!items || items.length === 0) return <span className="text-gray-500 text-xs italic">None specified</span>;
    return (
      <div className="flex gap-2 flex-wrap">
        {items.map((item: string, i: number) => (
          <span key={i} className={`text-xs bg-${color} bg-white/10 px-2.5 py-1 rounded-md text-gray-300 border border-white/10`}>{item}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Pending Consultant Applications</h1>
              <p className="text-gray-400 text-xs md:text-sm mt-2">Review, approve, or decline new consultant profile requests.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-primary">{applications.length}</span>
              <span className="text-gray-400 text-xs uppercase tracking-widest">Pending</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left - List */}
            <div className="lg:basis-[30%] flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, ID..."
                  className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                />
              </div>

              <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg max-h-[700px] overflow-y-auto custom-scrollbar">
                <div className="divide-y divide-white/10">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader className="animate-spin text-primary" size={24} />
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      {applications.length === 0 ? "No pending applications found." : "No results match your search."}
                    </div>
                  ) : (
                    filteredApplications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`w-full p-4 text-left transition-all duration-200 hover:bg-white/10 ${
                          selectedApp?.id === app.id ? "bg-primary/20 border-l-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate uppercase tracking-wide">
                              {app.profile?.full_name || app.first_name + ' ' + app.last_name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{app.email}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 whitespace-nowrap uppercase font-bold">
                            PENDING
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-gray-500 font-mono">{app.consultant_number}</span>
                          {app.profile?.professional_title && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-[11px] text-gray-400 truncate">{app.profile.professional_title}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right - Detail */}
            <div className="lg:basis-[70%]">
              {selectedApp ? (
                <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-4 md:p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
                  {/* Header Card */}
                  <div className="border-b border-white/10 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                          {selectedApp.profile?.full_name || `${selectedApp.first_name} ${selectedApp.last_name}`}
                        </h2>
                        {selectedApp.profile?.display_name && selectedApp.profile.display_name !== selectedApp.profile.full_name && (
                          <p className="text-gray-400 text-xs mt-0.5">Display name: {selectedApp.profile.display_name}</p>
                        )}
                        <p className="text-primary text-sm font-medium mt-1">{selectedApp.profile?.professional_title || "Consultant"}</p>
                        <p className="text-gray-400 text-xs mt-1">{selectedApp.email}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 uppercase font-bold tracking-wider">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <Globe size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Country</p>
                          <p className="text-white text-xs font-medium">{selectedApp.profile?.country || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Timezone</p>
                          <p className="text-white text-xs font-medium">{selectedApp.profile?.timezone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Phone</p>
                          <p className="text-white text-xs font-medium">{selectedApp.profile?.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Applied On</p>
                          <p className="text-white text-xs font-medium">{new Date(selectedApp.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specialization & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Specialization */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14} /> Specialization
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Primary Pillar</p>
                          <p className="text-white text-sm font-medium">{selectedApp.specialization?.primary_specialization || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Secondary Specializations</p>
                          {renderTagList(selectedApp.specialization?.secondary_specializations)}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Star size={14} /> Skills ({selectedApp.skills?.length || 0})
                      </h3>
                      {selectedApp.skills?.length > 0 ? (
                        <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                          {selectedApp.skills.map((skill: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded border border-white/5">
                              <span className="text-white font-medium">{skill.skill_name}</span>
                              <div className="flex gap-2 text-gray-400">
                                {skill.proficiency_level && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{skill.proficiency_level}</span>}
                                {skill.years_of_experience && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{skill.years_of_experience}y</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs italic">No skills listed</p>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {selectedApp.experience && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Award size={14} /> Professional Experience
                      </h3>
                      <div className="space-y-3">
                        {selectedApp.experience.professional_summary && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Professional Summary</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{selectedApp.experience.professional_summary}</p>
                          </div>
                        )}
                        {selectedApp.experience.sector_experience?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Sector Experience</p>
                            {renderTagList(selectedApp.experience.sector_experience)}
                          </div>
                        )}
                        {selectedApp.experience.professional_evidence && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Professional Evidence</p>
                            <p className="text-gray-300 text-sm">{selectedApp.experience.professional_evidence}</p>
                          </div>
                        )}
                        {selectedApp.experience.portfolio_url && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Portfolio</p>
                            <a href={selectedApp.experience.portfolio_url} target="_blank" rel="noopener noreferrer"
                              className="text-primary text-sm underline hover:text-primary/80 transition-colors">
                              {selectedApp.experience.portfolio_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IT Competence */}
                  {selectedApp.it_competence && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Code size={14} /> IT & Digital Competence
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase mb-1">IT Confidence Level</p>
                          <p className="text-white text-sm font-medium">{selectedApp.it_competence.it_confidence || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase mb-1">AI Familiarity</p>
                          <p className="text-white text-sm font-medium">{selectedApp.it_competence.ai_familiarity || 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Digital Tools</p>
                          {renderTagList(selectedApp.it_competence.digital_tools)}
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Software Experience</p>
                          {renderTagList(selectedApp.it_competence.software_experience)}
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Data Handling</p>
                          {renderTagList(selectedApp.it_competence.data_handling)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work Preferences & Commercial - side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Work Preferences */}
                    {selectedApp.work_preference && (
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MapPin size={14} /> Work Preferences
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Available</span>
                            <span className={selectedApp.work_preference.is_available ? "text-green-400" : "text-red-400"}>
                              {selectedApp.work_preference.is_available ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Weekly Capacity</span>
                            <span className="text-white">{selectedApp.work_preference.weekly_capacity || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Geo Coverage</span>
                            <span className="text-white">{selectedApp.work_preference.geo_coverage || 'N/A'}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1 mt-2">Preferred Roles</p>
                            {renderTagList(selectedApp.work_preference.preferred_roles)}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1 mt-2">Work Modes</p>
                            {renderTagList(selectedApp.work_preference.work_modes)}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1 mt-2">Languages</p>
                            {renderTagList(selectedApp.work_preference.languages)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Commercial */}
                    <div className="flex flex-col gap-5">
                      {selectedApp.commercials && (
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <DollarSign size={14} /> Commercial Terms
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Hourly Rate</span>
                              <span className="text-white font-medium">
                                {selectedApp.commercials.hourly_rate ? `${selectedApp.commercials.currency || ''} ${selectedApp.commercials.hourly_rate}` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase mb-1 mt-2">Engagement Types</p>
                              {renderTagList(selectedApp.commercials.engagement_types)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Compliance */}
                      {selectedApp.compliance && (
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} /> Compliance Declarations
                          </h3>
                          <div className="space-y-2">
                            {[
                              { label: 'Right to Work', value: selectedApp.compliance.right_to_work },
                              { label: 'Confidentiality Agreement', value: selectedApp.compliance.confidentiality },
                              { label: 'Conflict of Interest', value: selectedApp.compliance.conflict_of_interest },
                              { label: 'Data Protection', value: selectedApp.compliance.data_protection },
                            ].map((item, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-500">{item.label}</span>
                                <span className={item.value ? "text-green-400" : "text-red-400"}>
                                  {item.value ? "✓ Confirmed" : "✗ Not confirmed"}
                                </span>
                              </div>
                            ))}
                            {selectedApp.compliance.conflict_details && (
                              <div className="mt-2">
                                <p className="text-[10px] text-gray-500 uppercase mb-1">Conflict Details</p>
                                <p className="text-gray-300 text-xs">{selectedApp.compliance.conflict_details}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 border-t border-white/10 sticky bottom-0 bg-gradient-to-t from-[#1a1a2e] to-transparent pb-1">
                    <label className="text-[10px] font-bold text-gray-500 mb-2 block uppercase tracking-widest">
                      Admin Notes (Required for rejection)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any notes or reasons for rejection..."
                      className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-all duration-200 min-h-[80px] mb-4"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAction("approve")}
                        disabled={actionLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-green-500/20"
                      >
                        {actionLoading ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        Approve Profile
                      </button>
                      <button
                        onClick={() => handleAction("reject")}
                        disabled={actionLoading}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2"
                      >
                        {actionLoading ? <Loader className="animate-spin" size={18} /> : <XCircle size={18} />}
                        Decline Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
                  <UserCheck size={64} className="text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">Select an Application</h3>
                  <p className="text-gray-500 mt-2 max-w-sm">
                    Click on any pending application from the list to review their full profile and make an approval decision.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
