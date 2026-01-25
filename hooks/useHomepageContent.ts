'use client';
import { useState, useEffect, useCallback } from 'react';
import { CMSService } from '../lib/cms-api';

export interface HomepageContentData {
  homepage: any;
  approachSection: any;
  businessSystemSection: any;
  orrRoleSection: any;
  messageStrip: any;
  processSection: any;
  orrReportSection: any;
  serviceCards: any[];
  faqs: any[];
  testimonials: any[];
  contactInfo: any;
}

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cmsService = new CMSService();

  const fetchAllContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `https://orr-backend.orr.solutions/admin-portal/v1/cms/all-content/`;
      console.log('🏠 Homepage fetching data from endpoint:', endpoint);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const result = await response.json();
      console.log('📊 Homepage data received:', result);
      
      const data = result.data || result;
      console.log('✅ Homepage final processed data:', data);

      setContent({
        homepage: data.homepage,
        approachSection: data.approach_section,
        businessSystemSection: data.business_system_section,
        orrRoleSection: data.orr_role_section,
        messageStrip: data.message_strip,
        processSection: data.process_section,
        orrReportSection: data.orr_report_section,
        serviceCards: data.service_cards || [],
        faqs: data.faqs || [],
        testimonials: data.testimonials || [],
        contactInfo: data.contact_info
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  const updateHomepage = useCallback(async (data: any) => {
    try {
      await cmsService.updateHomepage(data);
      // Update local state immediately for better UX
      setContent(prev => prev ? { ...prev, homepage: { ...prev.homepage, ...data } } : null);
    } catch (error) {
      console.error('Failed to update homepage:', error);
      // For now, still update local state for better UX
      setContent(prev => prev ? { ...prev, homepage: { ...prev.homepage, ...data } } : null);
    }
  }, []);

  const updateApproachSection = useCallback(async (data: any) => {
    await cmsService.updateApproachSection(data);
    setContent(prev => prev ? { ...prev, approachSection: { ...prev.approachSection, ...data } } : null);
  }, []);

  const updateBusinessSystemSection = useCallback(async (data: any) => {
    try {
      console.log('Updating business system section with:', data);
      await cmsService.updateBusinessSystemSection(data);
      // Update local state immediately
      setContent(prev => prev ? { ...prev, businessSystemSection: { ...prev.businessSystemSection, ...data } } : null);
      // Optionally refetch to ensure consistency
      // await fetchAllContent();
    } catch (error) {
      console.error('Failed to update business system section:', error);
      throw error;
    }
  }, []);

  const updateORRRoleSection = useCallback(async (data: any) => {
    await cmsService.updateORRRoleSection(data);
    setContent(prev => prev ? { ...prev, orrRoleSection: { ...prev.orrRoleSection, ...data } } : null);
  }, []);

  const updateMessageStrip = useCallback(async (data: any) => {
    await cmsService.updateMessageStrip(data);
    setContent(prev => prev ? { ...prev, messageStrip: { ...prev.messageStrip, ...data } } : null);
  }, []);

  const updateProcessSection = useCallback(async (data: any) => {
    await cmsService.updateProcessSection(data);
    setContent(prev => prev ? { ...prev, processSection: { ...prev.processSection, ...data } } : null);
  }, []);

  const updateORRReportSection = useCallback(async (data: any) => {
    await cmsService.updateORRReportSection(data);
    setContent(prev => prev ? { ...prev, orrReportSection: { ...prev.orrReportSection, ...data } } : null);
  }, []);

  const updateServiceCard = useCallback(async (id: number, data: any) => {
    await cmsService.updateServiceCard(id, data);
    await fetchAllContent();
  }, [fetchAllContent]);

  const updateFAQ = useCallback(async (id: number, data: any) => {
    try {
      await cmsService.updateFAQ(id, data);
      setContent(prev => prev ? {
        ...prev,
        faqs: (prev.faqs || []).map((f: any) => f.id === id ? { ...f, ...data } : f)
      } : null);
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      throw error;
    }
  }, []);

  return {
    content,
    loading,
    error,
    refetch: fetchAllContent,
    updateHomepage,
    updateApproachSection,
    updateBusinessSystemSection,
    updateORRRoleSection,
    updateMessageStrip,
    updateProcessSection,
    updateORRReportSection,
    updateServiceCard,
    updateFAQ
  };
}