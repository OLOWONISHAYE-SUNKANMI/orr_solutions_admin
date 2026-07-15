"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Link as LinkIcon,
    MessageCircle,
    Share,
    Users,
    Plus,
    CheckCircle
} from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useAdminProjectStore } from "@/store/adminProjectStore";
import { formatDistanceToNow } from "date-fns";

function ProjectManagementPage() {
  const { t, language } = useLanguageStore();
  const { projects, fetchProjects, completeProject } = useAdminProjectStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => 
    p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todoProjects = filteredProjects.filter(p => p.status === 'Pending Admin Review' || p.status === 'Needs PM Clarification' || p.status === 'Drafting Consultant Summary' || p.status === 'PM Input Required' || p.status === 'Approved for Sourcing');
  const inProgressProjects = filteredProjects.filter(p => p.status === 'Sourcing Internally' || p.status === 'Sourcing Externally' || p.status === 'Consultant Assignment Pending' || p.status === 'Active');
  const completedProjects = filteredProjects.filter(p => p.status === 'Completed' || p.status.toLowerCase() === 'completed');

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData("projectId", projectId);
  };

  const handleDropToComplete = async (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    if (projectId) {
      await completeProject(projectId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const ProjectCard = ({ p }: { p: any }) => (
    <div 
      draggable
      onDragStart={(e) => handleDragStart(e, p.id)}
      className="flex flex-col gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group cursor-grab active:cursor-grabbing shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{p.projectTitle}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1"> 
                <Users size={12} className="text-gray-600"/> {p.clientName}
              </div>
          </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        <span className="bg-white/10 px-2 py-1 rounded text-[10px] uppercase font-bold">{p.status}</span>
      </div>
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400"><LinkIcon size={12}/> <span>{p.consultantsNeeded} C</span></div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg border border-orange-400/20">
            <Clock size={12} /> {p.createdAt ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : 'N/A'}
          </div>
      </div>
      {p.status !== 'Completed' && p.status.toLowerCase() !== 'completed' && (
        <button 
          onClick={(e) => { e.stopPropagation(); completeProject(p.id); }}
          className="mt-2 w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={14} /> Mark Completed
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="min-h-screen text-white relative overflow-hidden star">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 p-4 md:p-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight italic">
                  {t('project_mgmt.title')}
                </h1>
                <p className="text-gray-500 text-[10px] md:text-sm mt-1 uppercase tracking-[0.2em] font-bold">
                  Drag and drop projects to update their status
                </p>
              </div>
            </div>

            <hr className="border-white/10" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:min-w-[240px]">
                  <input
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search projects by title or client..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {/* To Do Column */}
              <div className="rounded-2xl bg-white/5 h-fit min-w-[300px] md:min-w-[350px] flex-1 border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 bg-white/10 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">To Do / Pending</span>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20">{todoProjects.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {todoProjects.map(p => <ProjectCard key={p.id} p={p} />)}
                  {todoProjects.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-black">No pending projects</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="rounded-2xl bg-white/5 h-fit min-w-[300px] md:min-w-[350px] flex-1 border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 bg-white/10 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Active / Sourcing</span>
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">{inProgressProjects.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {inProgressProjects.map(p => <ProjectCard key={p.id} p={p} />)}
                  {inProgressProjects.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-black">No active projects</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div 
                onDrop={handleDropToComplete}
                onDragOver={handleDragOver}
                className="rounded-2xl bg-white/5 h-fit min-w-[300px] md:min-w-[350px] flex-1 border border-white/10 overflow-hidden shadow-xl transition-colors hover:bg-green-500/5"
              >
                 <div className="p-4 bg-white/10 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">COMPLETED</span>
                  <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-500/20">{completedProjects.length}</span>
                </div>
                <div className="p-4 flex flex-col gap-4 min-h-[200px]">
                  {completedProjects.map(p => <ProjectCard key={p.id} p={p} />)}
                  {completedProjects.length === 0 && (
                    <div className="p-12 text-center h-full flex items-center justify-center">
                       <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black italic">Drop projects here to complete</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectManagementPage;
