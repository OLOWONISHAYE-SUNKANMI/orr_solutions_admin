"use client";

import { FileBarChart, CheckCircle, Clock, Loader, FileText, Eye, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { contentAPI } from "@/app/services";

interface Report {
  id: number;
  title: string;
  content_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  author?: {
    first_name: string;
    last_name: string;
  };
}

export default function ConsultationReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  const handleViewReport = async (reportId: number) => {
    try {
      const response = await contentAPI.getContent(reportId);
      const reportData = response?.data || response;
      
      // Increment view count on backend
      try {
        await contentAPI.incrementViewCount(reportId);
        // Update local state to reflect the increment
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === reportId 
              ? { ...report, view_count: report.view_count + 1 }
              : report
          )
        );
      } catch (viewCountError) {
        console.warn('Failed to increment view count:', viewCountError);
      }
      
      // Create a new window/tab to display the report
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
          <html>
            <head>
              <title>${reportData.title}</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
                .meta { color: #666; margin-bottom: 20px; }
                .content { line-height: 1.6; }
              </style>
            </head>
            <body>
              <h1>${reportData.title}</h1>
              <div class="meta">
                <p><strong>Type:</strong> ${reportData.content_type}</p>
                <p><strong>Status:</strong> ${reportData.status}</p>
                <p><strong>Created:</strong> ${new Date(reportData.created_at).toLocaleDateString()}</p>
                ${reportData.author ? `<p><strong>Author:</strong> ${reportData.author.first_name} ${reportData.author.last_name}</p>` : ''}
              </div>
              <div class="content">
                ${reportData.content || 'No content available'}
              </div>
            </body>
          </html>
        `);
        reportWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to load report:', error);
      alert('Failed to load report. Please try again.');
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await contentAPI.listContent({ content_type: 'report' });
        const data = response?.data || response;
        const reportsData = Array.isArray(data) ? data : [];
        
        setReports(reportsData);
        setDraftCount(reportsData.filter(r => r.status === 'draft').length);
        setPublishedCount(reportsData.filter(r => r.status === 'published').length);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Consultation Reports</h1>
            <p className="text-gray-400">Drafts and approved reports</p>
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
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
                  <Clock size={32} className="text-orange-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Draft Reports</h3>
                  <p className="text-gray-400 text-sm mb-4">Reports in progress</p>
                  <div className="text-3xl font-bold text-white">{draftCount}</div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
                  <CheckCircle size={32} className="text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Approved Reports</h3>
                  <p className="text-gray-400 text-sm mb-4">Finalized reports</p>
                  <div className="text-3xl font-bold text-white">{publishedCount}</div>
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <FileBarChart size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
                  <p className="text-gray-400">No consultation reports available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">All Reports</h2>
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                              <p className="text-sm text-gray-400 capitalize">{report.content_type}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span>Updated: {new Date(report.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Eye className="w-4 h-4" />
                              <span>{report.view_count} views</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'published' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : report.status === 'draft'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {report.status}
                          </span>
                          <button 
                            onClick={() => handleViewReport(report.id)}
                            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary text-sm font-medium transition-colors"
                          >
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
