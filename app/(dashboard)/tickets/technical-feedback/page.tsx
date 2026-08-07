"use client";

import React, { useEffect, useState } from "react";
import { API } from "@/app/services";
import { Bug, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function TechnicalFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await API.get("/admin/feedback/");
            setFeedbacks(response.data);
        } catch (error) {
            console.error("Failed to load technical feedback", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            await API.patch(`/admin/feedback/${id}/`, { status: newStatus });
            // Update local state
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-red-500/20 text-red-400 border-red-500/30";
            case "in_progress": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "resolved": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "closed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
            default: return "bg-white/10 text-white";
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                        <Bug className="text-primary" /> Technical Feedback
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        Manage bug reports and technical issues
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {feedbacks.map((fb) => (
                        <div key={fb.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-white/10 transition-colors">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white">{fb.subject}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(fb.status)}`}>
                                        {fb.status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300">{fb.description}</p>
                                
                                <div className="grid grid-cols-2 text-xs text-slate-400 gap-2 bg-black/20 p-4 rounded-xl">
                                    <p><strong className="text-white">User:</strong> {fb.user_name || fb.user}</p>
                                    <p><strong className="text-white">Date:</strong> {new Date(fb.created_at).toLocaleString()}</p>
                                    <p><strong className="text-white">Browser:</strong> {fb.browser_info}</p>
                                    <p><strong className="text-white">OS:</strong> {fb.os_info}</p>
                                    <p className="col-span-2 truncate"><strong className="text-white">Path:</strong> {fb.url_path}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Update Status</h4>
                                {fb.status !== "open" && (
                                    <button onClick={() => updateStatus(fb.id, "open")} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                        <AlertCircle size={14} /> Mark Open
                                    </button>
                                )}
                                {fb.status !== "in_progress" && (
                                    <button onClick={() => updateStatus(fb.id, "in_progress")} className="px-4 py-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                        <Clock size={14} /> Mark In Progress
                                    </button>
                                )}
                                {fb.status !== "resolved" && (
                                    <button onClick={() => updateStatus(fb.id, "resolved")} className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                        <CheckCircle size={14} /> Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {feedbacks.length === 0 && (
                        <div className="text-center p-12 bg-white/5 border border-white/10 rounded-2xl">
                            <CheckCircle size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white">No technical feedback found</h3>
                            <p className="text-sm text-slate-400 mt-2">All caught up!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
