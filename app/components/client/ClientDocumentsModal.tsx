"use client";

import { useState, useEffect } from "react";
import { X, FileText, Upload, Download, Eye, Edit, Trash2, Loader, AlertCircle, Plus, Save } from "lucide-react";
import { clientAPI } from "@/app/services";
import type { Document } from "@/app/services/types";

interface ClientDocumentsModalProps {
  clientId: number | null;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientDocumentsModal({ clientId, clientName, isOpen, onClose }: ClientDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editData, setEditData] = useState<Partial<Document>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    document_type: "",
    is_visible_to_client: true,
  });

  useEffect(() => {
    if (isOpen && clientId) {
      fetchDocuments();
    }
  }, [isOpen, clientId]);

  const fetchDocuments = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await clientAPI.listDocuments(clientId);
      setDocuments(Array.isArray(response) ? response : (response.results || []));
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!clientId) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("document", file);
      formData.append("title", uploadData.title || file.name);
      formData.append("description", uploadData.description);
      formData.append("document_type", uploadData.document_type);
      formData.append("is_visible_to_client", uploadData.is_visible_to_client.toString());

      await clientAPI.uploadDocument(clientId, formData);
      
      setShowUpload(false);
      setUploadData({
        title: "",
        description: "",
        document_type: "",
        is_visible_to_client: true,
      });
      
      fetchDocuments();
    } catch (err: any) {
      console.error("Failed to upload document:", err);
      setError("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setEditData({
      title: doc.title,
      description: doc.description,
      document_type: doc.document_type,
      is_visible_to_client: doc.is_visible_to_client,
    });
  };

  const handleSaveEdit = async () => {
    if (!clientId || !editingDoc) return;

    try {
      setLoading(true);
      setError(null);
      
      await clientAPI.partialUpdateDocument(clientId, editingDoc.id, editData);
      
      setEditingDoc(null);
      setEditData({});
      fetchDocuments();
    } catch (err: any) {
      console.error("Failed to update document:", err);
      setError("Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!clientId || !confirm("Are you sure you want to delete this document?")) return;

    try {
      setLoading(true);
      setError(null);
      
      await clientAPI.deleteDocument(clientId, docId);
      fetchDocuments();
    } catch (err: any) {
      console.error("Failed to delete document:", err);
      setError("Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (sizeStr: string) => {
    if (!sizeStr) return "Unknown size";
    const size = parseInt(sizeStr);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isOpen || !clientId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Documents</h2>
            <p className="text-gray-400 text-sm">{clientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200"
            >
              <Plus size={16} />
              Upload Document
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Error</p>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {showUpload && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upload New Document</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Document title"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Document Type</label>
                  <input
                    type="text"
                    value={uploadData.document_type}
                    onChange={(e) => setUploadData({ ...uploadData, document_type: e.target.value })}
                    placeholder="e.g., Contract, Report, Proposal"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Document description"
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={uploadData.is_visible_to_client}
                    onChange={(e) => setUploadData({ ...uploadData, is_visible_to_client: e.target.checked })}
                    className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                  />
                  Visible to client
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!uploadData.title) {
                        setUploadData({ ...uploadData, title: file.name });
                      }
                      handleUpload(file);
                    }
                  }}
                  className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/80"
                  disabled={uploading}
                />
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                  <Loader className="animate-spin" size={16} />
                  Uploading document...
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No documents found</p>
              <p className="text-sm mt-1">Upload the first document for this client</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  {editingDoc?.id === doc.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Title</label>
                          <input
                            type="text"
                            value={editData.title || ""}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Document Type</label>
                          <input
                            type="text"
                            value={editData.document_type || ""}
                            onChange={(e) => setEditData({ ...editData, document_type: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Description</label>
                        <textarea
                          value={editData.description || ""}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={3}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={editData.is_visible_to_client || false}
                            onChange={(e) => setEditData({ ...editData, is_visible_to_client: e.target.checked })}
                            className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary/50"
                          />
                          Visible to client
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingDoc(null)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="text-blue-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                            {doc.document_type && (
                              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded border border-primary/30">
                                {doc.document_type}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded border ${
                              doc.is_visible_to_client 
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                            }`}>
                              {doc.is_visible_to_client ? "Client Visible" : "Internal Only"}
                            </span>
                          </div>
                          
                          {doc.description && (
                            <p className="text-sm text-gray-400 mb-2">{doc.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Size: {formatFileSize(doc.file_size)}</span>
                            <span>Uploaded: {formatDate(doc.created_at)}</span>
                            <span>Downloads: {doc.download_count}</span>
                            {doc.last_accessed && (
                              <span>Last accessed: {formatDate(doc.last_accessed)}</span>
                            )}
                            {doc.uploaded_by_name && (
                              <span>By: {doc.uploaded_by_name}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(doc.document, '_blank')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
                            title="View document"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.document;
                              link.download = doc.title;
                              link.click();
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
                            title="Download document"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
                            title="Edit document"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400"
                            title="Delete document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}