"use client";

import React, { useEffect, useState } from "react";
import { consultantAPI } from "@/app/services";
import { 
    Users, Search, Mail, Phone, Briefcase, Star, Clock, X, 
    MapPin, Globe, Shield, Award, Activity, CheckCircle2 
} from "lucide-react";

export default function ConsultantDirectoryPage() {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedConsultant, setSelectedConsultant] = useState<any | null>(null);

    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        try {
            setLoading(true);
            const response = await consultantAPI.getDirectory();
            setConsultants(response.data || response);
        } catch (error) {
            console.error("Failed to load consultants", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = Array.isArray(consultants) 
        ? consultants.filter(c => {
            const firstName = c.first_name || "";
            const lastName = c.last_name || "";
            const skills = c.skills?.map((s: any) => s.skill_name).join(" ") || "";
            const spec = c.specialization?.areas_of_specialization?.join(" ") || "";
            
            return firstName.toLowerCase().includes(search.toLowerCase()) || 
                   lastName.toLowerCase().includes(search.toLowerCase()) ||
                   skills.toLowerCase().includes(search.toLowerCase()) ||
                   spec.toLowerCase().includes(search.toLowerCase());
          })
        : [];

    return (
        <div className="p-8 min-h-screen bg-[#060b13] text-slate-100">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
                        <Users className="text-primary w-8 h-8" /> Consultant Network
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        Browse, inspect, and manage approved consultants
                    </p>
                </div>
                
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, skill, specialization..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all placeholder:text-slate-500 placeholder:font-medium"
                    />
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex justify-center items-center p-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((c) => {
                        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Consultant";
                        const initials = (c.first_name?.[0] || "") + (c.last_name?.[0] || "");
                        const skillsList = c.skills?.map((s: any) => s.skill_name) || [];
                        const expertise = c.specialization?.areas_of_specialization || skillsList;
                        
                        return (
                            <div 
                                key={c.id} 
                                onClick={() => setSelectedConsultant(c)}
                                className="bg-[#0c1420]/60 border border-white/5 hover:border-primary/30 p-6 rounded-2xl flex flex-col hover:bg-[#111c2c]/80 transition-all duration-300 group cursor-pointer shadow-lg shadow-black/10 hover:shadow-primary/5"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-black uppercase border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                                        {initials || "?"}
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                        {c.status}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">{fullName}</h3>
                                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4 mt-1">{c.profile?.professional_title || "Consultant"}</p>
                                
                                <div className="space-y-2 mb-6 flex-1 text-slate-300">
                                    <div className="flex items-center gap-2.5 text-xs">
                                        <Mail size={14} className="text-slate-500" />
                                        <span className="truncate">{c.email}</span>
                                    </div>
                                    {c.profile?.phone && (
                                        <div className="flex items-center gap-2.5 text-xs">
                                            <Phone size={14} className="text-slate-500" />
                                            <span>{c.profile.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5 text-xs">
                                        <Briefcase size={14} className="text-slate-500" />
                                        <span>{c.experience?.years_of_experience || "N/A"} Years Exp.</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-400">
                                        <Clock size={14} className="text-emerald-500" />
                                        <span>${c.commercials?.hourly_rate || "0"}/hr</span>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Expertise</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {expertise.slice(0, 3).map((area: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-white/5 text-slate-300 rounded-lg text-[10px] font-semibold hover:bg-white/10 transition-colors">
                                                {area}
                                            </span>
                                        ))}
                                        {expertise.length > 3 && (
                                            <span className="px-2 py-1 bg-white/5 text-slate-500 rounded-lg text-[10px] font-semibold">
                                                +{expertise.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center p-16 bg-[#0c1420]/40 border border-white/5 rounded-2xl">
                            <Users size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white">No consultants found</h3>
                            <p className="text-sm text-slate-400 mt-2">Adjust your search or add new consultants to the network.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Profile Detail Modal */}
            {selectedConsultant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-[#0b121e] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedConsultant(null)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 md:p-8">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-white/5 mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-3xl font-black uppercase">
                                    {(selectedConsultant.first_name?.[0] || "") + (selectedConsultant.last_name?.[0] || "")}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-bold text-white">
                                            {selectedConsultant.first_name} {selectedConsultant.last_name}
                                        </h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {selectedConsultant.status}
                                        </span>
                                    </div>
                                    <p className="text-primary font-bold uppercase tracking-widest text-sm mt-1">
                                        {selectedConsultant.profile?.professional_title || "Consultant"}
                                    </p>
                                    <p className="text-slate-500 text-xs mt-2 font-mono uppercase">
                                        ID: {selectedConsultant.consultant_number} | Rating: {selectedConsultant.internal_rating || "Not Rated"}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Contact & Commercials */}
                                <div className="space-y-6">
                                    {/* Contact Section */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                            <Mail size={16} className="text-primary" /> Contact Details
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Email</span>
                                                <span className="text-white font-medium">{selectedConsultant.email}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Phone</span>
                                                <span className="text-white font-medium">{selectedConsultant.profile?.phone || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Country</span>
                                                <span className="text-white font-medium flex items-center gap-1">
                                                    <MapPin size={12} className="text-slate-500" />
                                                    {selectedConsultant.profile?.country || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1.5">
                                                <span className="text-slate-500">Timezone</span>
                                                <span className="text-white font-medium flex items-center gap-1">
                                                    <Globe size={12} className="text-slate-500" />
                                                    {selectedConsultant.profile?.timezone || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Commercials & Work Preferences */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                            <Clock size={16} className="text-primary" /> Commercials & Availability
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Hourly Rate</span>
                                                <span className="text-emerald-400 font-bold">${selectedConsultant.commercials?.hourly_rate || "0"}/hr</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Work Preference</span>
                                                <span className="text-white font-medium uppercase tracking-wider text-xs">
                                                    {selectedConsultant.work_preference?.preference_type || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1.5">
                                                <span className="text-slate-500">Weekly Availability</span>
                                                <span className="text-white font-medium">
                                                    {selectedConsultant.work_preference?.hourly_availability || "N/A"} hrs/week
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Expertise & Compliance */}
                                <div className="space-y-6">
                                    {/* Skills & Specialization */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                            <Award size={16} className="text-primary" /> Specialization & Skills
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-xs text-slate-500 block mb-1">Primary Pillar</span>
                                                <span className="text-white text-sm font-semibold">
                                                    {selectedConsultant.specialization?.primary_specialization || "N/A"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-500 block mb-2">Expertise Tags & Skills</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedConsultant.skills?.map((skill: any, idx: number) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/5 text-slate-300 rounded-lg text-xs font-medium">
                                                            {skill.skill_name} ({skill.proficiency_level || "No Level"})
                                                        </span>
                                                    ))}
                                                    {selectedConsultant.skills?.length === 0 && (
                                                        <span className="text-slate-500 text-sm">No skills added</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compliance Section */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                            <Shield size={16} className="text-primary" /> Compliance Status
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">ID Verification</span>
                                                {selectedConsultant.compliance?.id_verified ? (
                                                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle2 size={14} /> Verified</span>
                                                ) : (
                                                    <span className="text-yellow-400 text-xs font-bold uppercase">Pending</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                                                <span className="text-slate-500">Contract Signed</span>
                                                {selectedConsultant.compliance?.contract_signed ? (
                                                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle2 size={14} /> Signed</span>
                                                ) : (
                                                    <span className="text-yellow-400 text-xs font-bold uppercase">Pending</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-1.5">
                                                <span className="text-slate-500">Background Check</span>
                                                {selectedConsultant.compliance?.background_check ? (
                                                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle2 size={14} /> Passed</span>
                                                ) : (
                                                    <span className="text-yellow-400 text-xs font-bold uppercase">Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {selectedConsultant.admin_notes && (
                                <div className="mt-6 bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                                        <Activity size={14} /> Admin Notes
                                    </h4>
                                    <p className="text-slate-300 text-sm italic font-medium">
                                        {selectedConsultant.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
