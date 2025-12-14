"use client";

import { useState } from "react";
import { X, FileText, Loader, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { contentAPI } from "@/app/services";
import type { ContentType, ContentStatus, ClientStage } from "@/app/services/types";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContentModal({ isOpen, onClose }: CreateContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    content_type: "article" as ContentType,
    status: "draft" as ContentStatus,
    stage: "discover" as ClientStage,
    pillars: "",
    attachment: null as File | null,
  });

  const contentTypes = [
    { value: "faq", label: "FAQ" },
    { value: "article", label: "Article" },
    { value: "checklist", label: "Checklist" },
    { value: "template", label: "Template" },
    { value: "guide", label: "Guide" },
  ];

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  const stages = [
    { value: "discover", label: "Discover" },
    { value: "diagnose", label: "Diagnose" },
    { value: "design", label: "Design" },
    { value: "deploy", label: "Deploy" },
    { value: "grow", label: "Grow" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const contentData = new FormData();
      contentData.append("title", formData.title);
      contentData.append("summary", formData.summary);
      contentData.append("content", formData.content);
      contentData.append("content_type", formData.content_type);
      contentData.append("status", formData.status);
      contentData.append("stage", formData.stage);
      contentData.append("pillars", formData.pillars);
      
      if (formData.attachment) {
        contentData.append("attachment", formData.attachment);
      }

      console.log('📝 Creating content with data:', contentData instanceof FormData ? 'FormData with files' : contentData);
      const result = await contentAPI.createContent(contentData);
      console.log('✅ Content created successfully:', result);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({
          title: "",
          summary: "",
          content: "",
          content_type: "article" as ContentType,
          status: "draft" as ContentStatus,
          stage: "discover" as ClientStage,
          pillars: "",
          attachment: null,
        });
      }, 2000);
    } catch (err: any) {
      console.error("❌ Failed to create content:", err);
      let errorMessage = err.message || "Failed to create content";
      
      // Handle specific error types
      if (errorMessage.includes('duplicate key')) {
        errorMessage = "Content with this title or slug already exists. Please use a different title.";
      } else if (errorMessage.includes('validation')) {
        errorMessage = "Please check your input. Title and content are required fields.";
      } else if (errorMessage.includes('file')) {
        errorMessage = "There was an issue uploading the file. Please try with a different file or without attachments.";
      } else if (errorMessage.includes('permission')) {
        errorMessage = "You don't have permission to create content. Please contact your administrator.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange("attachment", file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Content</h2>
              <p className="text-gray-400 text-sm">Add new content or resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-red-300">Error</p>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-green-400" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-green-300">Success</p>
                <p className="text-green-200">Content created successfully!</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter content title"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Brief summary of the content"
                rows={2}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Content Type</label>
                <select
                  value={formData.content_type}
                  onChange={(e) => handleInputChange("content_type", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value} className="bg-gray-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Target Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange("stage", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value} className="bg-gray-800">
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Relevant Pillars</label>
              <input
                type="text"
                value={formData.pillars}
                onChange={(e) => handleInputChange("pillars", e.target.value)}
                placeholder="Comma-separated list of relevant pillars"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Enter the main content here..."
                rows={8}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Attachment (Optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/80"
                />
                {formData.attachment && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Upload size={16} />
                    {formData.attachment.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <FileText size={16} />
                )}
                {loading ? "Creating..." : "Create Content"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}