"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdminProjectStore } from "@/store/adminProjectStore";
import { Clock, Search, Filter, ShieldCheck, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectRequestsPage() {
  const { projects } = useAdminProjectStore();
  const [filter, setFilter] = useState<"ALL" | "Pending Admin Review" | "Needs PM Clarification" | "Drafting Consultant Summary" | "PM Input Required" | "Approved for Sourcing">("Pending Admin Review");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === "ALL" || p.status === filter;
    const matchesSearch = 
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Admin Review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Needs PM Clarification': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Drafting Consultant Summary': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PM Input Required': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Approved for Sourcing': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 backdrop-blur-md p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Project Governance
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Project Requests Review</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Review new projects submitted by Project Managers. Ensure scope and confidentiality requirements are met before approving them for consultant sourcing.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap bg-slate-900/60 p-1 border border-white/5 rounded-2xl w-full md:w-auto">
          {(["Pending Admin Review", "Needs PM Clarification", "Drafting Consultant Summary", "PM Input Required", "Approved for Sourcing", "ALL"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                filter === tab 
                  ? "bg-primary text-slate-950 shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" ? "All Projects" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search projects by ID, Title, Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-primary/40 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-3xl">
            <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4 stroke-1" />
            <h3 className="font-bold text-lg text-slate-300">All caught up!</h3>
            <p className="text-slate-500 text-xs mt-1">No projects currently matching this filter.</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <Link href={`/project-requests/${project.id}`} key={project.id} className="block">
              <div className="bg-slate-900/20 border border-white/5 hover:border-white/10 transition-all rounded-3xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group backdrop-blur-sm cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-800 border border-white/5 group-hover:scale-105 transition-transform">
                    <FileText className="text-primary" size={24} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-400">{project.id}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-wider ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors">
                      {project.projectTitle}
                    </h4>
                    <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
                      <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{project.clientName}</span>
                      <span>•</span>
                      <span>PM: {project.pmId}</span>
                      <span>•</span>
                      <span className="text-rose-400 font-mono">Due: {project.targetDeadline}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-stretch lg:self-auto justify-between lg:justify-end border-t border-white/5 lg:border-none pt-4 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors text-slate-400">
                    <ChevronRight size={20} />
                  </div>
                </div>

              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
