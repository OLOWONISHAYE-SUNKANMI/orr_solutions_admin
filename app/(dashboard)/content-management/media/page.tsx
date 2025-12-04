"use client";

import { useState } from "react";
import { Search, Upload, FolderPlus, Trash2, Download, Eye, X } from "lucide-react";
import Image from "next/image";

type MediaItem = {
  id: string;
  url: string;
  name: string;
  type: "image" | "video" | "document";
  size: string;
  uploadedAt: string;
  folder?: string;
};

const mediaItems: MediaItem[] = [
  { id: "1", url: "/images/media-placeholder.jpg", name: "abstract-art.jpg", type: "image", size: "2.4 MB", uploadedAt: "2024-12-01", folder: "All Media" },
  { id: "2", url: "/images/media-placeholder.jpg", name: "tree-illustration.jpg", type: "image", size: "1.8 MB", uploadedAt: "2024-11-30", folder: "All Media" },
  { id: "3", url: "/images/media-placeholder.jpg", name: "city-skyline.jpg", type: "image", size: "3.2 MB", uploadedAt: "2024-11-28", folder: "All Media" },
  { id: "4", url: "/images/media-placeholder.jpg", name: "portrait-1.jpg", type: "image", size: "2.1 MB", uploadedAt: "2024-11-27", folder: "All Media" },
  { id: "5", url: "/images/media-placeholder.jpg", name: "product-shot.jpg", type: "image", size: "1.5 MB", uploadedAt: "2024-11-26", folder: "All Media" },
  { id: "6", url: "/images/media-placeholder.jpg", name: "document.pdf", type: "document", size: "890 KB", uploadedAt: "2024-11-25", folder: "All Media" },
  { id: "7", url: "/images/media-placeholder.jpg", name: "leaf-design.jpg", type: "image", size: "1.2 MB", uploadedAt: "2024-11-24", folder: "All Media" },
  { id: "8", url: "/images/media-placeholder.jpg", name: "shell-art.jpg", type: "image", size: "2.0 MB", uploadedAt: "2024-11-23", folder: "All Media" },
  { id: "9", url: "/images/media-placeholder.jpg", name: "interior.jpg", type: "image", size: "2.8 MB", uploadedAt: "2024-11-22", folder: "All Media" },
  { id: "10", url: "/images/media-placeholder.jpg", name: "architecture.jpg", type: "image", size: "3.5 MB", uploadedAt: "2024-11-21", folder: "All Media" },
  { id: "11", url: "/images/media-placeholder.jpg", name: "portrait-2.jpg", type: "image", size: "1.9 MB", uploadedAt: "2024-11-20", folder: "All Media" },
  { id: "12", url: "/images/media-placeholder.jpg", name: "workspace.jpg", type: "image", size: "2.3 MB", uploadedAt: "2024-11-19", folder: "All Media" },
];

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedItems.length} selected item(s)?`)) {
      console.log("Deleting items:", selectedItems);
      setSelectedItems([]);
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    alert("Upload functionality will open file picker");
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      console.log("Creating folder:", folderName);
      alert(`Folder "${folderName}" created`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 sm:p-8 md:p-10 lg:p-14">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Media</h1>
            <p className="text-sm text-white/70 mt-1">Manage images, videos, and documents</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              className="bg-lemon hover:bg-lemon/90 text-black px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Add New</span>
            </button>
            <button
              onClick={handleCreateFolder}
              className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FolderPlus size={18} />
              <span className="hidden sm:inline">Create Folder</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg py-2 pl-4 pr-10 bg-card text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-lemon"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-white/70">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete selected"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </>
            )}
            <button
              onClick={handleSelectAll}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {selectedItems.length === filteredMedia.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* All Media Section */}
        <div className="bg-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Media</h2>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className={`relative group bg-background rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedItems.includes(item.id)
                    ? "ring-2 ring-lemon"
                    : "hover:ring-2 hover:ring-white/30"
                }`}
              >
                {/* Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem(item.id);
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.id)
                        ? "bg-lemon border-lemon"
                        : "bg-background/50 border-white/30 group-hover:border-white/60"
                    }`}
                  >
                    {selectedItems.includes(item.id) && (
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Media Preview */}
                <div className="aspect-square relative bg-secondary/30">
                  {item.type === "image" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/40 to-secondary/20">
                      <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/40 to-secondary/20">
                      <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(item);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={16} className="text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Download:", item.name);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-2">
                  <p className="text-xs text-white font-medium truncate">{item.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{item.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Detail Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
            <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">{selectedMedia.name}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preview */}
                  <div className="bg-secondary/30 rounded-lg aspect-square flex items-center justify-center">
                    <div className="w-32 h-32 rounded-lg bg-white/10 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">File Name</p>
                      <p className="text-sm text-white">{selectedMedia.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">File Size</p>
                      <p className="text-sm text-white">{selectedMedia.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Type</p>
                      <p className="text-sm text-white capitalize">{selectedMedia.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Uploaded</p>
                      <p className="text-sm text-white">{selectedMedia.uploadedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-1">Folder</p>
                      <p className="text-sm text-white">{selectedMedia.folder}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button className="flex-1 bg-lemon hover:bg-lemon/90 text-black py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                        <Download size={16} />
                        Download
                      </button>
                      <button className="flex-1 bg-red-500/30 hover:bg-red-500/40 text-red-400 py-2 rounded-lg font-medium transition-all border border-red-500/30">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
