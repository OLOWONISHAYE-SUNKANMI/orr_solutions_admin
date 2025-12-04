"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Eye, FileText, Globe, Upload, Image } from "lucide-react";

type PageSection = {
  id: string;
  name: string;
  slug: string;
  lastModified: string;
  status: "Published" | "Draft";
  subsections?: string[];
};

const websitePages: PageSection[] = [
  {
    id: "1",
    name: "Home Page",
    slug: "/",
    lastModified: "2024-12-01",
    status: "Published",
    subsections: ["Hero Section", "Services Overview", "Testimonials", "CTA Section"],
  },
  {
    id: "2",
    name: "About Us",
    slug: "/about",
    lastModified: "2024-11-28",
    status: "Published",
    subsections: ["Company Story", "Team Section", "Mission & Vision", "Values"],
  },
  {
    id: "3",
    name: "Services",
    slug: "/services",
    lastModified: "2024-12-02",
    status: "Published",
    subsections: ["Service List", "Pricing", "Case Studies"],
  },
  {
    id: "4",
    name: "Resources/Blogs",
    slug: "/resources",
    lastModified: "2024-12-03",
    status: "Published",
    subsections: ["Blog Posts", "Whitepapers", "Guides", "FAQ"],
  },
  {
    id: "5",
    name: "Legal/Policy",
    slug: "/legal",
    lastModified: "2024-11-15",
    status: "Draft",
    subsections: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"],
  },
];

function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<PageSection | null>(null);
  const [pages, setPages] = useState<PageSection[]>(websitePages);

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (page: PageSection) => {
    // TODO: Implement preview functionality
    console.log("Previewing page:", page.name);
    alert(`Preview: ${page.name}\nURL: ${page.slug}\n\nThis will show how the page looks on the live site.`);
  };

  const handleEdit = (page: PageSection) => {
    // TODO: Navigate to content editor
    console.log("Editing page content:", page.name);
    alert(`Opening content editor for: ${page.name}\n\nYou'll be able to edit:\n- Page sections\n- Text content\n- Images\n- SEO metadata`);
  };

  const handleTogglePublish = (page: PageSection) => {
    const newStatus = page.status === "Published" ? "Draft" : "Published";
    const updatedPages = pages.map(p =>
      p.id === page.id ? { ...p, status: newStatus as "Published" | "Draft" } : p
    );
    setPages(updatedPages);
    if (selectedPage?.id === page.id) {
      setSelectedPage({ ...page, status: newStatus as "Published" | "Draft" });
    }
    console.log(`${page.name} status changed to:`, newStatus);
  };

  const handleEditSection = (sectionName: string) => {
    console.log("Editing section:", sectionName);
    alert(`Edit section: ${sectionName}\n\nYou can modify:\n- Section title\n- Section content\n- Section images\n- Section layout`);
  };

  const handleUploadMedia = () => {
    alert("Media upload functionality\n\nUpload images, videos, or documents to use in your pages.");
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 sm:p-8 md:p-10 lg:p-14">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Content Management</h1>
            <p className="text-sm text-white/70 mt-1">Manage website content and media</p>
          </div>
          <div className="flex gap-3">
            <Link href="/content-management/media">
              <button className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2">
                <Image size={18} />
                <span className="hidden sm:inline">Media Library</span>
              </button>
            </Link>
            <button 
              onClick={handleUploadMedia}
              className="bg-lemon hover:bg-lemon/90 text-black px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Upload Media</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg py-2 pl-4 pr-10 bg-card text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-lemon"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Website Pages</h2>
              
              <div className="space-y-3">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`bg-background rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPage?.id === page.id
                        ? "ring-2 ring-lemon"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          <Globe size={20} className="text-lemon" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{page.name}</h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                page.status === "Published"
                                  ? "bg-green-500/30 text-green-400"
                                  : "bg-orange-500/30 text-orange-400"
                              }`}
                            >
                              {page.status}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mb-2">{page.slug}</p>
                          <p className="text-xs text-white/50">
                            Last modified: {page.lastModified}
                          </p>
                          {page.subsections && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {page.subsections.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-secondary text-white/70 px-2 py-1 rounded"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(page);
                          }}
                          className="p-2 hover:bg-secondary rounded transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} className="text-white/70" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(page);
                          }}
                          className="p-2 hover:bg-secondary rounded transition-colors"
                          title="Edit Content"
                        >
                          <Edit size={16} className="text-white/70" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 sticky top-6">
              {selectedPage ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Page Content</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1">Page Name</p>
                      <p className="text-sm text-white font-medium">{selectedPage.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50 mb-1">URL Path</p>
                      <p className="text-sm text-white font-medium">{selectedPage.slug}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50 mb-1">Visibility Status</p>
                      <span
                        className={`inline-block text-sm px-3 py-1 rounded ${
                          selectedPage.status === "Published"
                            ? "bg-green-500/30 text-green-400"
                            : "bg-orange-500/30 text-orange-400"
                        }`}
                      >
                        {selectedPage.status}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/50 mb-1">Last Modified</p>
                      <p className="text-sm text-white">{selectedPage.lastModified}</p>
                    </div>
                    
                    {selectedPage.subsections && selectedPage.subsections.length > 0 && (
                      <div>
                        <p className="text-xs text-white/50 mb-2">Editable Sections ({selectedPage.subsections.length})</p>
                        <div className="space-y-2">
                          {selectedPage.subsections.map((sub, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-background p-2 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-white/50" />
                                <span className="text-sm text-white">{sub}</span>
                              </div>
                              <button 
                                onClick={() => handleEditSection(sub)}
                                className="p-1 hover:bg-secondary rounded"
                                title="Edit section content"
                              >
                                <Edit size={14} className="text-white/50" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 space-y-2">
                      <button 
                        onClick={() => handleEdit(selectedPage)}
                        className="w-full bg-lemon hover:bg-lemon/90 text-black py-2 rounded-lg font-medium transition-all"
                      >
                        Edit Page Content
                      </button>
                      <button 
                        onClick={() => handlePreview(selectedPage)}
                        className="w-full bg-secondary hover:bg-secondary/80 text-white py-2 rounded-lg font-medium transition-all"
                      >
                        Preview Page
                      </button>
                      {selectedPage.status === "Draft" && (
                        <button 
                          onClick={() => handleTogglePublish(selectedPage)}
                          className="w-full bg-green-500/30 hover:bg-green-500/40 text-green-400 py-2 rounded-lg font-medium transition-all border border-green-500/30"
                        >
                          Make Visible
                        </button>
                      )}
                      {selectedPage.status === "Published" && (
                        <button 
                          onClick={() => handleTogglePublish(selectedPage)}
                          className="w-full bg-orange-500/30 hover:bg-orange-500/40 text-orange-400 py-2 rounded-lg font-medium transition-all border border-orange-500/30"
                        >
                          Hide Page
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe size={48} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">
                    Select a page to edit content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
