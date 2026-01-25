"use client";

import { useState, useEffect } from "react";
import { Save, Loader, AlertCircle, Eye, Edit } from "lucide-react";
import { cmsAPI } from "@/app/services";
import SuccessModal from "../../../components/ui/SuccessModal";
import ErrorModal from "../../../components/ui/ErrorModal";

interface StrategicAdvisoryContent {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image: string;
  services_title: string;
  service_1_title: string;
  service_1_description: string;
  service_2_title: string;
  service_2_description: string;
  service_3_title: string;
  service_3_description: string;
  process_title: string;
  process_step_1: string;
  process_step_2: string;
  process_step_3: string;
  process_step_4: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  meta_title: string;
  meta_description: string;
}

export default function StrategicAdvisoryAdminPage() {
  const [content, setContent] = useState<StrategicAdvisoryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await cmsAPI.getStrategicAdvisoryContent();
      setContent((response as any).data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Strategic Advisory content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setError(null);
      await cmsAPI.updateStrategicAdvisoryContent(content);
      setSuccessModal({
        isOpen: true,
        title: 'Content Saved',
        message: 'Your changes have been saved successfully!'
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: 'Save Failed',
        message: err.message || "Failed to save content"
      });
      setError(err.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof StrategicAdvisoryContent, value: string) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
          <p className="text-gray-400">Unable to load Strategic Advisory content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Strategic Advisory & Compliance</h1>
              <p className="text-gray-400">Edit page content and settings</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-300">Content saved successfully!</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Edit size={20} />
                Hero Section
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={content.hero_title}
                    onChange={(e) => handleInputChange("hero_title", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Subtitle</label>
                  <textarea
                    value={content.hero_subtitle}
                    onChange={(e) => handleInputChange("hero_subtitle", e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={content.hero_description}
                    onChange={(e) => handleInputChange("hero_description", e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Hero Image URL</label>
                  <input
                    type="url"
                    value={content.hero_image}
                    onChange={(e) => handleInputChange("hero_image", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Services Section</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Services Title</label>
                  <input
                    type="text"
                    value={content.services_title}
                    onChange={(e) => handleInputChange("services_title", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Service 1 Title</label>
                    <input
                      type="text"
                      value={content.service_1_title}
                      onChange={(e) => handleInputChange("service_1_title", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                    <label className="text-sm text-gray-400 mb-2 block mt-3">Service 1 Description</label>
                    <textarea
                      value={content.service_1_description}
                      onChange={(e) => handleInputChange("service_1_description", e.target.value)}
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Service 2 Title</label>
                    <input
                      type="text"
                      value={content.service_2_title}
                      onChange={(e) => handleInputChange("service_2_title", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                    <label className="text-sm text-gray-400 mb-2 block mt-3">Service 2 Description</label>
                    <textarea
                      value={content.service_2_description}
                      onChange={(e) => handleInputChange("service_2_description", e.target.value)}
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Service 3 Title</label>
                    <input
                      type="text"
                      value={content.service_3_title}
                      onChange={(e) => handleInputChange("service_3_title", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                    <label className="text-sm text-gray-400 mb-2 block mt-3">Service 3 Description</label>
                    <textarea
                      value={content.service_3_description}
                      onChange={(e) => handleInputChange("service_3_description", e.target.value)}
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Call to Action Section</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">CTA Title</label>
                  <input
                    type="text"
                    value={content.cta_title}
                    onChange={(e) => handleInputChange("cta_title", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">CTA Description</label>
                  <textarea
                    value={content.cta_description}
                    onChange={(e) => handleInputChange("cta_description", e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">CTA Button Text</label>
                  <input
                    type="text"
                    value={content.cta_button_text}
                    onChange={(e) => handleInputChange("cta_button_text", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
      
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </div>
  );
}