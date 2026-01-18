"use client";

import { useState, useEffect } from 'react';
import { cmsAPI } from '../../services/api';
import { useAuthStore } from '../../../lib/hooks/auth';

export default function ContentManagement() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<any>(null);
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          const endpoint = `https://orr-backend-web-latest.onrender.com/admin-portal/v1/cms/all-content/`;
          const [roleData, allContentResponse] = await Promise.all([
            cmsAPI.getUserRole(),
            fetch(endpoint)
          ]);
          
          if (!allContentResponse.ok) throw new Error('Failed to fetch content');
          
          const allContentResult = await allContentResponse.json();
          const allContentData = allContentResult.data || allContentResult;
          
          setUserRole(roleData.data || roleData);
          setContent({
            homepage: allContentData.homepage,
            approachSection: allContentData.approach_section,
            businessSystemSection: allContentData.business_system_section,
            orrRoleSection: allContentData.orr_role_section,
            messageStrip: allContentData.message_strip,
            processSection: allContentData.process_section,
            orrReportSection: allContentData.orr_report_section,
            faqs: allContentData.faqs || []
          });
        } catch (error) {
          console.error('Failed to fetch content:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      await cmsAPI.updateContent(section, data);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <button onClick={() => { logout(); window.location.href = '/login'; }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
        </div>

        {/* Hero Section Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Hero Section</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSave('homepage', { hero_title: content?.homepage?.hero_title, hero_subtitle: content?.homepage?.hero_subtitle, hero_cta_text: content?.homepage?.hero_cta_text }); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input type="text" value={content?.homepage?.hero_title || ''} onChange={(e) => setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_title: e.target.value } }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter hero title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea value={content?.homepage?.hero_subtitle || ''} onChange={(e) => setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_subtitle: e.target.value } }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter hero subtitle" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
                <input type="text" value={content?.homepage?.hero_cta_text || ''} onChange={(e) => setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_cta_text: e.target.value } }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter CTA text" />
              </div>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Hero Section'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
