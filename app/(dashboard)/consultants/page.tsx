"use client";

import React, { useEffect, useState } from "react";
import { API } from "@/app/services";
import { Users, Search, Mail, Phone, Briefcase, Star, Clock } from "lucide-react";

export default function ConsultantDirectoryPage() {
    const [consultants, setConsultants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchConsultants();
    }, []);

    const fetchConsultants = async () => {
        try {
            setLoading(true);
            const response = await API.get("/admin-portal/v1/consultant-directory/");
            setConsultants(response.data || response);
        } catch (error) {
            console.error("Failed to load consultants", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = Array.isArray(consultants) 
        ? consultants.filter(c => 
            (c.user?.first_name || "").toLowerCase().includes(search.toLowerCase()) || 
            (c.user?.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.expertise_areas || []).join(" ").toLowerCase().includes(search.toLowerCase())
          )
        : [];

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                        <Users className="text-primary" /> Consultant Directory
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        Browse and manage network consultants
                    </p>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search consultants..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-500 placeholder:uppercase placeholder:tracking-widest"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((c) => (
                        <div key={c.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-black uppercase border border-primary/30">
                                    {(c.user?.first_name?.[0] || "") + (c.user?.last_name?.[0] || "") || "?"}
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                    c.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                    c.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                                    'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                }`}>
                                    {c.status}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white">{c.user?.first_name} {c.user?.last_name}</h3>
                            <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">{c.title || "Consultant"}</p>
                            
                            <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Mail size={14} className="text-slate-500" />
                                    <span>{c.user?.email}</span>
                                </div>
                                {c.phone_number && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Phone size={14} className="text-slate-500" />
                                        <span>{c.phone_number}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Briefcase size={14} className="text-slate-500" />
                                    <span>{c.years_of_experience} Years Exp.</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock size={14} className="text-slate-500" />
                                    <span>${c.hourly_rate}/hr</span>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {(c.expertise_areas || []).slice(0, 3).map((area: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 text-slate-300 rounded text-[10px] font-bold">
                                            {area}
                                        </span>
                                    ))}
                                    {(c.expertise_areas?.length || 0) > 3 && (
                                        <span className="px-2 py-1 bg-white/5 text-slate-500 rounded text-[10px] font-bold">
                                            +{(c.expertise_areas?.length || 0) - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center p-12 bg-white/5 border border-white/10 rounded-2xl">
                            <Users size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white">No consultants found</h3>
                            <p className="text-sm text-slate-400 mt-2">Adjust your search or add new consultants to the network.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
