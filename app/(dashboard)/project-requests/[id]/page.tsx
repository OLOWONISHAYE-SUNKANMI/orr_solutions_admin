"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminProjectStore } from "@/store/adminProjectStore";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Shield, Briefcase, FileText, Bot, Loader2 } from "lucide-react";

export default function ProjectReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { 
    projects, 
    isGeneratingSummary,
    approveProjectForDrafting, 
    requestClarification,
    generateConsultantSummary,
    approveConsultantSummary,
    requestPmInputForSourcing,
    sourceProjectInternally,
    sourceProjectExternally,
    selectConsultant
  } = useAdminProjectStore();
  
  const project = projects.find(p => p.id === projectId);

  const [isClarifyModalOpen, setIsClarifyModalOpen] = useState(false);
  const [clarificationNotes, setClarificationNotes] = useState("");
  
  const [isPmInputModalOpen, setIsPmInputModalOpen] = useState(false);
  const [pmInputNotes, setPmInputNotes] = useState("");
  
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [externalEmail, setExternalEmail] = useState("");
  
  const [editedConsultantSummary, setEditedConsultantSummary] = useState("");

  useEffect(() => {
    if (project?.consultantFacingSummaryDraft) {
      setEditedConsultantSummary(project.consultantFacingSummaryDraft);
    }
  }, [project?.consultantFacingSummaryDraft]);

  if (!project) {
    return (
      <div className="p-8 text-center text-white">
        <h2>Project not found</h2>
        <Link href="/project-requests" className="text-primary hover:underline">Return to Queue</Link>
      </div>
    );
  }

  const handleApproveForDrafting = () => {
    approveProjectForDrafting(project.id);
  };

  const handleRequestClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationNotes.trim()) return;
    requestClarification(project.id, clarificationNotes);
    setIsClarifyModalOpen(false);
    router.push("/project-requests");
  };

  const handleGenerateSummary = () => {
    generateConsultantSummary(project.id);
  };

  const handleApproveFinalSummary = () => {
    approveConsultantSummary(project.id, editedConsultantSummary);
    router.push("/project-requests");
  };

  const handleRequestPmInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmInputNotes.trim()) return;
    requestPmInputForSourcing(project.id, pmInputNotes);
    setIsPmInputModalOpen(false);
    router.push("/project-requests");
  };

  const handleSourceInternally = () => {
    sourceProjectInternally(project.id);
    router.push("/project-requests");
  };

  const handleSourceExternally = (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalEmail.trim()) return;
    sourceProjectExternally(project.id, externalEmail);
    setIsExternalModalOpen(false);
    router.push("/project-requests");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 text-white min-h-[90vh] pb-32 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <Link href="/project-requests" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Request Queue
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-3 py-1 bg-slate-800 border border-white/10 rounded-full font-mono font-black text-slate-300 uppercase tracking-widest">
                {project.id}
              </span>
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border ${
                project.status === 'Pending Admin Review' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                project.status === 'Needs PM Clarification' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                project.status === 'PM Input Required' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                project.status === 'Drafting Consultant Summary' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{project.projectTitle}</h1>
            <p className="text-slate-400 flex items-center gap-2 text-sm font-medium">
              <span>Client: <strong className="text-white">{project.clientName}</strong></span>
              <span>•</span>
              <span>PM: <strong className="text-white">{project.pmId}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* Review Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6 backdrop-blur-sm">
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <FileText className="text-primary" />
              Project Scope & Overview
            </h2>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Defined Scope</span>
              <p className="text-slate-300 leading-relaxed font-medium bg-black/20 p-5 rounded-2xl border border-white/5">
                {project.scope}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Primary Category</span>
                <span className="text-white font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/10 inline-block">{project.primaryCategory}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Consultants Needed</span>
                <span className="text-white font-bold text-lg">{project.consultantsNeeded}</span>
              </div>
            </div>
          </div>

          {/* Consultant Summary Drafting Section */}
          {(project.status === 'Drafting Consultant Summary' || project.status === 'PM Input Required' || project.status === 'Approved for Sourcing') && (
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-3xl p-8 space-y-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center border-b border-blue-500/20 pb-4">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <Bot className="text-blue-400" />
                  Consultant-Facing Summary
                </h2>
                {!project.consultantFacingSummaryDraft && !isGeneratingSummary && (
                  <button 
                    onClick={handleGenerateSummary}
                    className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg font-bold border border-blue-500/30 transition-colors"
                  >
                    Generate AI Draft
                  </button>
                )}
              </div>

              {isGeneratingSummary ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-sm font-mono text-blue-400 animate-pulse">AI is sanitizing client details...</p>
                </div>
              ) : project.consultantFacingSummaryDraft ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Review and edit the consultant-facing summary. Ensure no restricted client information remains.
                  </p>
                  <textarea 
                    value={editedConsultantSummary}
                    onChange={(e) => setEditedConsultantSummary(e.target.value)}
                    disabled={project.status === 'Approved for Sourcing'}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y min-h-[250px] font-mono leading-relaxed disabled:opacity-70"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Click 'Generate AI Draft' to create a sanitized version of the project scope.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm space-y-6">
            <h3 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Shield size={14} className="text-rose-400" /> Security & Access
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Confidentiality Level</span>
                <span className="font-bold text-rose-400">{project.confidentiality}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm space-y-6">
            <h3 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Clock size={14} className="text-amber-400" /> Timeline & Urgency
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Target Deadline</span>
                <span className="font-bold text-white">{project.targetDeadline}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Urgency</span>
                <span className="font-bold text-amber-400">{project.urgency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interested Consultants Section */}
      {(project.status === 'Sourcing Internally' || project.status === 'Sourcing Externally' || project.status === 'Consultant Assignment Pending') && (
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Interested Consultants</h2>
              <p className="text-xs text-slate-400">Review profiles and select the preferred consultant for this project.</p>
            </div>
          </div>

          {!project.interestedConsultants || project.interestedConsultants.length === 0 ? (
            <div className="p-8 text-center bg-black/20 border border-white/5 rounded-2xl">
              <Loader2 size={24} className="text-purple-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-slate-400">Waiting for consultants to express interest...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.interestedConsultants.map(c => {
                const isSelected = project.selectedConsultantId === c.id;
                return (
                  <div key={c.id} className={`p-5 border rounded-2xl transition-all ${isSelected ? 'bg-purple-900/20 border-purple-500/50' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white">{c.name}</h3>
                        <p className="text-xs text-slate-400">{c.expertise}</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">{c.cost}</span>
                    </div>
                    {isSelected ? (
                      <div className="w-full py-2.5 bg-purple-500/20 text-purple-300 rounded-xl text-xs font-bold text-center border border-purple-500/30">
                        Selection Pending Compliance
                      </div>
                    ) : (
                      <button
                        onClick={() => selectConsultant(project.id, c.id)}
                        disabled={!!project.selectedConsultantId}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Select Consultant
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar - Pending Admin Review */}
      {project.status === 'Pending Admin Review' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-40">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 max-w-2xl w-full">
            <div className="flex-1 px-4">
              <p className="text-sm font-bold text-white">Review Project Details</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Select an action</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsClarifyModalOpen(true)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-white/5"
              >
                Request Clarification
              </button>
              <button 
                onClick={handleApproveForDrafting}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Approve for Sourcing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar - Drafting Consultant Summary */}
      {project.status === 'Drafting Consultant Summary' && project.consultantFacingSummaryDraft && (
        <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-40">
          <div className="bg-blue-950/90 backdrop-blur-xl border border-blue-500/20 shadow-2xl p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 max-w-3xl w-full">
            <div className="flex-1 px-4">
              <p className="text-sm font-bold text-blue-100">Consultant Summary Review</p>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">Is operational detail sufficient?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsPmInputModalOpen(true)}
                className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-blue-100 rounded-xl text-xs font-bold transition-colors border border-blue-500/30"
              >
                Request PM Input
              </button>
              <button 
                onClick={handleApproveFinalSummary}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl text-xs font-black transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Approve & Finalize Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar - Approved for Sourcing */}
      {project.status === 'Approved for Sourcing' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-40">
          <div className="bg-purple-950/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 max-w-3xl w-full">
            <div className="flex-1 px-4">
              <p className="text-sm font-bold text-purple-100">Consultant Sourcing</p>
              <p className="text-[10px] text-purple-400 uppercase tracking-wider font-mono">Select sourcing strategy</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsExternalModalOpen(true)}
                className="px-6 py-3 bg-purple-900 hover:bg-purple-800 text-purple-100 rounded-xl text-xs font-bold transition-colors border border-purple-500/30"
              >
                Source Externally
              </button>
              <button 
                onClick={handleSourceInternally}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-xl text-xs font-black transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                <Bot size={16} />
                Source Internally (Auto-Match)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal (Initial Phase) */}
      {isClarifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Request PM Clarification</h2>
                <p className="text-xs text-slate-400">Return this project to the PM with notes.</p>
              </div>
            </div>

            <form onSubmit={handleRequestClarification} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Clarification Notes</label>
                <textarea 
                  required
                  rows={5}
                  value={clarificationNotes}
                  onChange={(e) => setClarificationNotes(e.target.value)}
                  placeholder="Detail what is missing or unclear..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsClarifyModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-400 text-slate-900 rounded-xl text-sm font-black transition-colors shadow-lg shadow-orange-500/20"
                >
                  Return to PM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PM Input Request Modal (Drafting Phase) */}
      {isPmInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Request PM Input</h2>
                <p className="text-xs text-slate-400">Ask the PM for missing operational details for the Consultant Summary.</p>
              </div>
            </div>

            <form onSubmit={handleRequestPmInput} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Input Needed</label>
                <textarea 
                  required
                  rows={5}
                  value={pmInputNotes}
                  onChange={(e) => setPmInputNotes(e.target.value)}
                  placeholder="e.g. 'We need more details on the exact deliverables expected from the consultant...'"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsPmInputModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-400 text-slate-900 rounded-xl text-sm font-black transition-colors shadow-lg shadow-blue-500/20"
                >
                  Request PM Input
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* External Sourcing Modal */}
      {isExternalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Source Externally</h2>
                <p className="text-xs text-slate-400">Send a restricted summary to an external consultant.</p>
              </div>
            </div>

            <form onSubmit={handleSourceExternally} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Consultant Email</label>
                <input 
                  type="email"
                  required
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  placeholder="consultant@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-2">
                  They will receive a controlled invitation. Confidential details will be excluded until they onboard.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsExternalModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-400 text-slate-900 rounded-xl text-sm font-black transition-colors shadow-lg shadow-purple-500/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
