"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminClientRequestStore } from "@/store/adminClientRequestStore";
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertCircle, FileText, Briefcase, Zap, Building2, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useNotificationContext } from "@/lib/contexts/NotificationContext";

export default function ClientRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  
  const { success: successContext } = useNotificationContext();
  const { currentRequest, pms, fetchRequestDetail, fetchProjectManagers, reviewRequest, convertToProject, isLoading, error } = useAdminClientRequestStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<string>("");
  const [assignedPmId, setAssignedPmId] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchRequestDetail(id);
      fetchProjectManagers();
    }
  }, [id, fetchRequestDetail, fetchProjectManagers]);

  if (isLoading && !currentRequest) {
    return <div className="p-8 text-white text-center">Loading request details...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-white">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error Loading Request</h2>
        <p className="text-rose-400 text-sm mb-4">{error}</p>
        <Link href="/client-requests" className="text-primary hover:underline mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  if (!currentRequest || !currentRequest.status) {
    return (
      <div className="p-8 text-center text-white">
        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold">Request Not Found</h2>
        <Link href="/client-requests" className="text-primary hover:underline mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'clarification_requested': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'approved_for_pm_assignment': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'approved_for_meeting': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'converted_to_project': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'rejected': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const handleReview = async () => {
    setIsSubmitting(true);
    
    const pmIdNumber = reviewAction === 'approve_for_pm_assignment' && assignedPmId 
      ? parseInt(assignedPmId, 10) 
      : undefined;

    const successResult = await reviewRequest(id, reviewAction, reviewNotes, undefined, pmIdNumber);
    setIsSubmitting(false);
    if (successResult) {
      successContext(`Request ${reviewAction.replace(/_/g, ' ')} successfully!`);
      setShowReviewModal(false);
      setReviewNotes("");
      setAssignedPmId("");
    }
  };

  const handleConvertToProject = async () => {
    setIsSubmitting(true);
    const result = await convertToProject(id, currentRequest.request_title, currentRequest.orr_service_area);
    setIsSubmitting(false);
    
    if (result && result.projectId) {
      successContext(`Converted to PM Project: ${result.projectId}`);
      // Redirect to the PM projects page where they can see the new project
      router.push('/project-requests');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-[90vh] pb-32 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/client-requests" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black">{currentRequest.request_title}</h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border tracking-wider uppercase ${getStatusColor(currentRequest.status)}`}>
              {currentRequest.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono mt-1 flex items-center gap-2">
            {currentRequest.request_id} • 
            <Clock size={12} className="inline" /> 
            Submitted {currentRequest.submission_date ? formatDistanceToNow(new Date(currentRequest.submission_date), { addSuffix: true }) : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="text-lg font-black flex items-center gap-2 text-primary border-b border-white/10 pb-4">
              <FileText size={20} />
              Problem Brief
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Short Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  {currentRequest.short_description || 'Not provided'}
                </p>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Background Context</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  {currentRequest.background_context || 'Not provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Main Question</h3>
                  <p className="text-slate-300 text-sm">{currentRequest.main_question || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Current Challenge</h3>
                  <p className="text-slate-300 text-sm">{currentRequest.current_challenge || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
            <h2 className="text-lg font-black flex items-center gap-2 text-primary border-b border-white/10 pb-4">
              <Zap size={20} />
              Scope & Expectations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Expected Deliverable</h3>
                <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-white/5">{currentRequest.expected_deliverable || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Desired Outcome</h3>
                <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-white/5">{currentRequest.desired_outcome || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-black flex items-center gap-2 text-white border-b border-white/10 pb-3 mb-4">
              <Briefcase size={16} className="text-primary" />
              Client Details
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Client Name</span>
                <span className="text-sm font-bold text-slate-200">{currentRequest.client_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Submitted By</span>
                <span className="text-sm font-bold text-slate-200">{currentRequest.submitted_by_name}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-black flex items-center gap-2 text-white border-b border-white/10 pb-3 mb-4">
              <Building2 size={16} className="text-primary" />
              Project Meta
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Service Area</span>
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">
                  {currentRequest.orr_service_area?.replace(/_/g, ' ') || 'TBD'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Urgency</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded border inline-block mt-1 ${currentRequest.urgency === 'high' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-slate-300 bg-white/5 border-white/10'}`}>
                  {currentRequest.urgency?.toUpperCase() || 'NORMAL'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Target Date</span>
                <span className="text-sm text-slate-300 block mt-1">{currentRequest.target_date || 'None'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-black flex items-center gap-2 text-white border-b border-white/10 pb-3 mb-4">
              <ShieldCheck size={16} className="text-primary" />
              Compliance & Security
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {currentRequest.confidentiality_agreed ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                Confidentiality Agreed
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {currentRequest.confirm_accuracy ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                Accuracy Confirmed
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex gap-3 shadow-2xl z-40">
        
        {currentRequest.status === 'submitted' && (
          <>
            <button 
              onClick={() => { setReviewAction('request_clarification'); setShowReviewModal(true); }}
              className="px-6 py-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 font-black text-sm transition-colors"
            >
              Request Clarification
            </button>
            <button 
              onClick={() => { setReviewAction('approve_for_pm_assignment'); setShowReviewModal(true); }}
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Approve for PM
            </button>
          </>
        )}

        {(currentRequest.status === 'approved_for_pm_assignment' || currentRequest.status === 'approved_for_meeting') && (
          <button 
            onClick={handleConvertToProject}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-primary text-slate-950 hover:brightness-110 font-black text-sm transition-all shadow-[0_0_20px_rgba(0,255,194,0.4)] disabled:opacity-50 flex items-center gap-2"
          >
            <Briefcase size={16} />
            {isSubmitting ? 'Converting...' : 'Convert to PM Project'}
          </button>
        )}

        {currentRequest.status === 'converted_to_project' && (
          <div className="px-6 py-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            Already Converted (Project: {currentRequest.converted_project})
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-xl font-black mb-2 text-white capitalize">
              {reviewAction.replace(/_/g, ' ')}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Please provide any notes or classification details before confirming this action.
            </p>
            
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add your review notes here..."
              className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary resize-none mb-6"
            />

            {reviewAction === 'approve_for_pm_assignment' && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Assign Project Manager</label>
                <select
                  value={assignedPmId}
                  onChange={(e) => setAssignedPmId(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Select a Project Manager...</option>
                  {pms.map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReview}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 hover:brightness-110 text-sm font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
