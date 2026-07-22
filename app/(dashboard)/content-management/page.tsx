"use client";

import { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { cmsAPI } from '../../services/api';
import { useAuthStore } from '../../../lib/hooks/auth';
import RichTextEditor from '../../../components/RichTextEditor';
import BusinessSystemCardsManagement from './BusinessSystemCardsManagement';
import SuccessModal from '../../components/ui/SuccessModal';
import ErrorModal from '../../components/ui/ErrorModal';
import { useLanguageStore } from '@/store/languageStore';
import { cleanContentObject } from "@/app/utils/htmlCleaner";

export default function ContentManagement() {
  const { t, language } = useLanguageStore();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<any>(null);
  const { isAuthenticated, logout } = useAuthStore();
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          const endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/admin-portal/v1/cms/all-content/`;
          const [roleData, allContentResponse] = await Promise.all([
            cmsAPI.getUserRole(),
            fetch(endpoint)
          ]);
          
          if (!allContentResponse.ok) throw new Error('Failed to fetch content');
          
          const allContentResult = await allContentResponse.json();
          const allContentData = allContentResult.data || allContentResult;
          
          // Convert any object values to strings
          const convertToString = (obj: any) => {
            return cleanContentObject(obj);
          };
          
          setUserRole(roleData.data || roleData);
          setContent({
            homepage: convertToString(allContentData.homepage),
            approachSection: convertToString(allContentData.approach_section),
            businessSystemSection: convertToString(allContentData.business_system_section),
            orrRoleSection: convertToString(allContentData.orr_role_section),
            messageStrip: convertToString(allContentData.message_strip),
            processSection: convertToString(allContentData.process_section),
            orrReportSection: convertToString(allContentData.orr_report_section),
            faqs: allContentData.faqs || [],
            servicesPage: convertToString(allContentData.services_page)
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
    setSaving(section);
    try {
      // Clean the data before sending to API
      const cleanedData = cleanObjectData(data);
      
      // Validate that we have some data to send
      const hasValidData = Object.values(cleanedData).some(value => 
        value && typeof value === 'string' && value.trim().length > 0
      );
      
      if (!hasValidData) {
        setErrorModal({
          isOpen: true,
          title: t('content_management.validation_error_title'),
          message: t('content_management.validation_error_msg')
        });
        return;
      }
      
      console.log('Sending data to API:', { section, cleanedData });
      
      await cmsAPI.updateContent(section, cleanedData);
      setSuccessModal({
        isOpen: true,
        title: t('content_management.success_save_title'),
        message: t('content_management.success_save_msg')
      });
    } catch (error: any) {
      console.error('Failed to save:', error);
      
      // Try to get detailed error information
      let errorDetails = t('content_management.unknown_error') || 'Unknown error occurred';
      
      if (error?.details) {
        // If we have detailed error information from the API
        if (typeof error.details === 'object') {
          errorDetails = JSON.stringify(error.details, null, 2);
        } else {
          errorDetails = error.details;
        }
      } else if (error?.response) {
        // If it's a fetch response error
        try {
          const errorText = await error.response.text();
          errorDetails = `${error.response.status}: ${errorText}`;
        } catch {
          errorDetails = `${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error?.message) {
        errorDetails = error.message;
      }
      
      console.error('Detailed error:', errorDetails);
      
      // Show a more user-friendly error message
      if (errorDetails.includes('Validation failed')) {
        setErrorModal({
          isOpen: true,
          title: t('content_management.validation_error_title'),
          message: t('content_management.validation_detailed_msg', { details: errorDetails })
        });
      } else {
        setErrorModal({
          isOpen: true,
          title: t('content_management.error_save_title'),
          message: errorDetails
        });
      }
    } finally {
      setSaving(null);
    }
  };

  const handleRichTextChange = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object' && value !== null) {
      if (value.content) return String(value.content);
      if (value.format !== undefined) return String(value.content || '');
      return '';
    }
    return String(value || '');
  };

  const cleanObjectData = (obj: any) => {
    if (!obj) return {};
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value === null || value === undefined) {
        cleaned[key] = '';
      } else if (typeof value === 'string') {
        // Trim whitespace and ensure it's a valid string
        cleaned[key] = value.trim();
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (value.content && typeof value.content === 'string') {
          cleaned[key] = value.content.trim();
        } else {
          // For rich text editor objects, try to extract text content
          try {
            cleaned[key] = JSON.stringify(value);
          } catch {
            cleaned[key] = '';
          }
        }
      } else {
        cleaned[key] = String(value).trim();
      }
    });
    
    // Log the cleaned data for debugging
    console.log('Cleaned data:', cleaned);
    return cleaned;
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200";
  const labelClass = "text-white text-sm mb-2 block";
  const buttonClass = "bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const sectionClass = "bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 shadow-lg p-6";
  const titleClass = "text-2xl font-semibold text-white mb-6";

  return (
    <div className="min-h-screen text-white relative overflow-hidden star">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-card backdrop-blur-sm rounded-2xl p-4 md:p-8 flex flex-col gap-6 md:gap-8 border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{t('content_management.page_title')}</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">{t('content_management.page_subtitle')}</p>
          </div>

          {/* Hero Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.hero_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('homepage', { hero_title: getStringValue(content?.homepage?.hero_title), hero_subtitle: getStringValue(content?.homepage?.hero_subtitle), hero_cta_text: getStringValue(content?.homepage?.hero_cta_text) }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_title')}
                value={getStringValue(content?.homepage?.hero_title)}
                onChange={(value) => handleRichTextChange('homepage', 'hero_title', value)}
                placeholder={t('content_management.placeholder_hero_title')}
              />
              <RichTextEditor
                label={t('content_management.hero_subtitle')}
                value={getStringValue(content?.homepage?.hero_subtitle)}
                onChange={(value) => handleRichTextChange('homepage', 'hero_subtitle', value)}
                placeholder={t('content_management.placeholder_hero_subtitle')}
                rows={3}
              />
              <RichTextEditor
                label={t('content_management.hero_cta')}
                value={getStringValue(content?.homepage?.hero_cta_text)}
                onChange={(value) => handleRichTextChange('homepage', 'hero_cta_text', value)}
                placeholder={t('content_management.placeholder_cta')}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'homepage'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'homepage' ? t('content_management.saving') : t('content_management.save_hero')}
                </button>
              </div>
            </form>
          </div>

          {/* Pillars Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.pillars_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('services-page', { pillars_title: getStringValue(content?.servicesPage?.pillars_title) }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.pillars_title')}
                value={getStringValue(content?.servicesPage?.pillars_title)}
                onChange={(value) => handleRichTextChange('servicesPage', 'pillars_title', value)}
                placeholder={t('content_management.placeholder_section_title')}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services-page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services-page' ? t('content_management.saving') : t('content_management.save_pillars_title')}
                </button>
              </div>
            </form>
          </div>

          {/* Pillar 1 - Digital Systems, Automation & AI */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.pillar_1')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('services-page', { pillar_1_title: getStringValue(content?.servicesPage?.pillar_1_title), pillar_1_description: getStringValue(content?.servicesPage?.pillar_1_description) }); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>{t('content_management.order')}</label>
                <input type="number" value="1" readOnly className={inputClass} />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.char_limit', { count: getStringValue(content?.servicesPage?.pillar_1_title).length })}
                  value={getStringValue(content?.servicesPage?.pillar_1_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'pillar_1_title', value)}
                  placeholder={t('content_management.placeholder_card_title')}
                />
                {getStringValue(content?.servicesPage?.pillar_1_title).length > 100 && (
                  <p className="text-red-400 text-xs">{t('content_management.char_exceeded')}</p>
                )}
              </div>
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(content?.servicesPage?.pillar_1_description)}
                onChange={(value) => handleRichTextChange('servicesPage', 'pillar_1_description', value)}
                placeholder={t('content_management.placeholder_description')}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.button_text')}
                  value={t('content_management.learn_more')}
                  onChange={() => {}}
                  placeholder={t('content_management.learn_more')}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services-page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services-page' ? t('content_management.saving') : t('content_management.save_pillar', { num: 1 })}
                </button>
              </div>
            </form>
          </div>

          {/* Pillar 2 - Strategic Advisory & Compliance */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.pillar_2')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('services-page', { pillar_2_title: getStringValue(content?.servicesPage?.pillar_2_title), pillar_2_description: getStringValue(content?.servicesPage?.pillar_2_description) }); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>{t('content_management.order')}</label>
                <input type="number" value="2" readOnly className={inputClass} />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.char_limit', { count: getStringValue(content?.servicesPage?.pillar_2_title).length })}
                  value={getStringValue(content?.servicesPage?.pillar_2_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'pillar_2_title', value)}
                  placeholder={t('content_management.placeholder_card_title')}
                />
                {getStringValue(content?.servicesPage?.pillar_2_title).length > 100 && (
                  <p className="text-red-400 text-xs">{t('content_management.char_exceeded')}</p>
                )}
              </div>
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(content?.servicesPage?.pillar_2_description)}
                onChange={(value) => handleRichTextChange('servicesPage', 'pillar_2_description', value)}
                placeholder={t('content_management.placeholder_description')}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.button_text')}
                  value={t('content_management.learn_more')}
                  onChange={() => {}}
                  placeholder={t('content_management.learn_more')}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services-page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services-page' ? t('content_management.saving') : t('content_management.save_pillar', { num: 2 })}
                </button>
              </div>
            </form>
          </div>

          {/* Pillar 3 - Living Systems & Regeneration */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.pillar_3')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('services-page', { pillar_3_title: getStringValue(content?.servicesPage?.pillar_3_title), pillar_3_description: getStringValue(content?.servicesPage?.pillar_3_description) }); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>{t('content_management.order')}</label>
                <input type="number" value="3" readOnly className={inputClass} />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.char_limit', { count: getStringValue(content?.servicesPage?.pillar_3_title).length })}
                  value={getStringValue(content?.servicesPage?.pillar_3_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'pillar_3_title', value)}
                  placeholder={t('content_management.placeholder_card_title')}
                />
                {getStringValue(content?.servicesPage?.pillar_3_title).length > 100 && (
                  <p className="text-red-400 text-xs">{t('content_management.char_exceeded')}</p>
                )}
              </div>
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(content?.servicesPage?.pillar_3_description)}
                onChange={(value) => handleRichTextChange('servicesPage', 'pillar_3_description', value)}
                placeholder={t('content_management.placeholder_description')}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label={t('content_management.button_text')}
                  value={t('content_management.learn_more')}
                  onChange={() => {}}
                  placeholder={t('content_management.learn_more')}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services-page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services-page' ? t('content_management.saving') : t('content_management.save_pillar', { num: 3 })}
                </button>
              </div>
            </form>
          </div>

          {/* Business System Cards Management */}
          <BusinessSystemCardsManagement 
            inputClass={inputClass}
            labelClass={labelClass}
            buttonClass={buttonClass}
            sectionClass={sectionClass}
            titleClass={titleClass}
            saving={saving}
            setSaving={setSaving}
          />

          {/* Approach Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.approach_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('approach-section', { title: getStringValue(content?.approachSection?.title), paragraph_1: getStringValue(content?.approachSection?.paragraph_1), paragraph_2: getStringValue(content?.approachSection?.paragraph_2), paragraph_3: getStringValue(content?.approachSection?.paragraph_3) }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(content?.approachSection?.title)}
                onChange={(value) => handleRichTextChange('approachSection', 'title', value)}
                placeholder={t('content_management.placeholder_section_title')}
              />
              <RichTextEditor
                label={t('content_management.message') + ' 1'}
                value={getStringValue(content?.approachSection?.paragraph_1)}
                onChange={(value) => handleRichTextChange('approachSection', 'paragraph_1', value)}
                placeholder={t('content_management.placeholder_message')}
                rows={4}
              />
              <RichTextEditor
                label={t('content_management.message') + ' 2'}
                value={getStringValue(content?.approachSection?.paragraph_2)}
                onChange={(value) => handleRichTextChange('approachSection', 'paragraph_2', value)}
                placeholder={t('content_management.placeholder_message')}
                rows={4}
              />
              <RichTextEditor
                label={t('content_management.message') + ' 3'}
                value={getStringValue(content?.approachSection?.paragraph_3)}
                onChange={(value) => handleRichTextChange('approachSection', 'paragraph_3', value)}
                placeholder={t('content_management.placeholder_message')}
                rows={4}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'approach-section'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'approach-section' ? t('content_management.saving') : t('content_management.save_business_system')}
                </button>
              </div>
            </form>
          </div>

          {/* Business System Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.business_system_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('business-system-section', { title: content?.businessSystemSection?.title, subtitle: content?.businessSystemSection?.subtitle, card_1_title: content?.businessSystemSection?.card_1_title, card_1_description: content?.businessSystemSection?.card_1_description, card_2_title: content?.businessSystemSection?.card_2_title, card_2_description: content?.businessSystemSection?.card_2_description, card_3_title: content?.businessSystemSection?.card_3_title, card_3_description: content?.businessSystemSection?.card_3_description }); }} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label={t('content_management.section_title')}
                  value={getStringValue(content?.businessSystemSection?.title)}
                  onChange={(value) => handleRichTextChange('businessSystemSection', 'title', value)}
                  placeholder={t('content_management.placeholder_section_title')}
                />
                <RichTextEditor
                  label={t('content_management.section_subtitle')}
                  value={getStringValue(content?.businessSystemSection?.subtitle)}
                  onChange={(value) => handleRichTextChange('businessSystemSection', 'subtitle', value)}
                  placeholder={t('content_management.placeholder_section_subtitle')}
                />
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 1 })}</h3>
                <div className="flex flex-col gap-3">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 1 })}
                    value={getStringValue(content?.businessSystemSection?.card_1_title)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_1_title', value)}
                    placeholder={t('content_management.placeholder_card_title')}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 1 })}
                    value={getStringValue(content?.businessSystemSection?.card_1_description)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_1_description', value)}
                    placeholder={t('content_management.placeholder_card_description')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 2 })}</h3>
                <div className="flex flex-col gap-3">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 2 })}
                    value={getStringValue(content?.businessSystemSection?.card_2_title)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_2_title', value)}
                    placeholder={t('content_management.placeholder_card_title')}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 2 })}
                    value={getStringValue(content?.businessSystemSection?.card_2_description)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_2_description', value)}
                    placeholder={t('content_management.placeholder_card_description')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 3 })}</h3>
                <div className="flex flex-col gap-3">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 3 })}
                    value={getStringValue(content?.businessSystemSection?.card_3_title)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_3_title', value)}
                    placeholder={t('content_management.placeholder_card_title')}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 3 })}
                    value={getStringValue(content?.businessSystemSection?.card_3_description)}
                    onChange={(value) => handleRichTextChange('businessSystemSection', 'card_3_description', value)}
                    placeholder={t('content_management.placeholder_card_description')}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'business-system-section'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'business-system-section' ? t('content_management.saving') : t('content_management.save_business_system')}
                </button>
              </div>
            </form>
          </div>

          {/* ORR Role Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.orr_role_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('orr-role-section', { title: content?.orrRoleSection?.title, description: content?.orrRoleSection?.description }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(content?.orrRoleSection?.title)}
                onChange={(value) => handleRichTextChange('orrRoleSection', 'title', value)}
                placeholder={t('content_management.placeholder_section_title')}
              />
              <RichTextEditor
                label={t('content_management.description')}
                value={getStringValue(content?.orrRoleSection?.description)}
                onChange={(value) => handleRichTextChange('orrRoleSection', 'description', value)}
                placeholder={t('content_management.placeholder_description')}
                rows={5}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'orr-role-section'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'orr-role-section' ? t('content_management.saving') : t('content_management.save_orr_role')}
                </button>
              </div>
            </form>
          </div>

          {/* Message Strip Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.message_strip_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('message-strip', { title: content?.messageStrip?.title, message: content?.messageStrip?.message }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(content?.messageStrip?.title)}
                onChange={(value) => handleRichTextChange('messageStrip', 'title', value)}
                placeholder={t('content_management.placeholder_section_title')}
              />
              <RichTextEditor
                label={t('content_management.message')}
                value={getStringValue(content?.messageStrip?.message)}
                onChange={(value) => handleRichTextChange('messageStrip', 'message', value)}
                placeholder={t('content_management.placeholder_message')}
                rows={5}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'message-strip'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'message-strip' ? t('content_management.saving') : t('content_management.save_message_strip')}
                </button>
              </div>
            </form>
          </div>

          {/* Process Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.process_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('process-section', { title: content?.processSection?.title, subtitle: content?.processSection?.subtitle, stage_1_title: content?.processSection?.stage_1_title, stage_1_description: content?.processSection?.stage_1_description, stage_2_title: content?.processSection?.stage_2_title, stage_2_description: content?.processSection?.stage_2_description, stage_3_title: content?.processSection?.stage_3_title, stage_3_description: content?.processSection?.stage_3_description, stage_4_title: content?.processSection?.stage_4_title, stage_4_description: content?.processSection?.stage_4_description, stage_5_title: content?.processSection?.stage_5_title, stage_5_description: content?.processSection?.stage_5_description }); }} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label={t('content_management.section_title')}
                  value={getStringValue(content?.processSection?.title)}
                  onChange={(value) => handleRichTextChange('processSection', 'title', value)}
                  placeholder={t('content_management.placeholder_section_title')}
                />
                <RichTextEditor
                  label={t('content_management.section_subtitle')}
                  value={getStringValue(content?.processSection?.subtitle)}
                  onChange={(value) => handleRichTextChange('processSection', 'subtitle', value)}
                  placeholder={t('content_management.placeholder_section_subtitle')}
                />
              </div>

              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.stage', { num })}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RichTextEditor
                      label={t('content_management.stage_title', { num })}
                      value={getStringValue(content?.processSection?.[`stage_${num}_title`])}
                      onChange={(value) => handleRichTextChange('processSection', `stage_${num}_title`, value)}
                      placeholder={t('content_management.placeholder_stage_title', { num })}
                    />
                    <RichTextEditor
                      label={t('content_management.stage_description', { num })}
                      value={getStringValue(content?.processSection?.[`stage_${num}_description`])}
                      onChange={(value) => handleRichTextChange('processSection', `stage_${num}_description`, value)}
                      placeholder={t('content_management.placeholder_stage_description', { num })}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'process-section'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'process-section' ? t('content_management.saving') : t('content_management.save_process_section')}
                </button>
              </div>
            </form>
          </div>

          {/* ORR Report Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.orr_report_section')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('orr-report-section', { title: content?.orrReportSection?.title, subtitle: content?.orrReportSection?.subtitle, feature_1: content?.orrReportSection?.feature_1, feature_2: content?.orrReportSection?.feature_2, feature_3: content?.orrReportSection?.feature_3, feature_4: content?.orrReportSection?.feature_4 }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.section_title')}
                value={getStringValue(content?.orrReportSection?.title)}
                onChange={(value) => handleRichTextChange('orrReportSection', 'title', value)}
                placeholder={t('content_management.placeholder_section_title')}
              />
              <RichTextEditor
                label={t('content_management.section_subtitle')}
                value={getStringValue(content?.orrReportSection?.subtitle)}
                onChange={(value) => handleRichTextChange('orrReportSection', 'subtitle', value)}
                placeholder={t('content_management.placeholder_section_subtitle')}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label={t('content_management.feature', { num: 1 })}
                  value={getStringValue(content?.orrReportSection?.feature_1)}
                  onChange={(value) => handleRichTextChange('orrReportSection', 'feature_1', value)}
                  placeholder={t('content_management.placeholder_feature', { num: 1 })}
                  rows={2}
                />
                <RichTextEditor
                  label={t('content_management.feature', { num: 2 })}
                  value={getStringValue(content?.orrReportSection?.feature_2)}
                  onChange={(value) => handleRichTextChange('orrReportSection', 'feature_2', value)}
                  placeholder={t('content_management.placeholder_feature', { num: 2 })}
                  rows={2}
                />
                <RichTextEditor
                  label={t('content_management.feature', { num: 3 })}
                  value={getStringValue(content?.orrReportSection?.feature_3)}
                  onChange={(value) => handleRichTextChange('orrReportSection', 'feature_3', value)}
                  placeholder={t('content_management.placeholder_feature', { num: 3 })}
                  rows={2}
                />
                <RichTextEditor
                  label={t('content_management.feature', { num: 4 })}
                  value={getStringValue(content?.orrReportSection?.feature_4)}
                  onChange={(value) => handleRichTextChange('orrReportSection', 'feature_4', value)}
                  placeholder={t('content_management.placeholder_feature', { num: 4 })}
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'orr-report-section'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'orr-report-section' ? t('content_management.saving') : t('content_management.save_orr_report')}
                </button>
              </div>
            </form>
          </div>

          {/* FAQs Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.faqs_section')}</h2>
            <div className="flex flex-col gap-4">
              {(content?.faqs || []).map((faq: any, index: number) => (
                <div key={faq.id || index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(`faqs/${faq.id}`, { question: getStringValue(faq.question), answer: getStringValue(faq.answer) }); }} className="flex flex-col gap-3">
                    <RichTextEditor
                      label={t('content_management.question', { num: index + 1 })}
                      value={getStringValue(faq.question)}
                      onChange={(value) => setContent((prev: any) => ({ ...prev, faqs: (prev?.faqs || []).map((f: any, i: number) => i === index ? { ...f, question: value } : f) }))}
                      placeholder={t('content_management.placeholder_question')}
                    />
                    <RichTextEditor
                      label={t('content_management.answer', { num: index + 1 })}
                      value={getStringValue(faq.answer)}
                      onChange={(value) => setContent((prev: any) => ({ ...prev, faqs: (prev?.faqs || []).map((f: any, i: number) => i === index ? { ...f, answer: value } : f) }))}
                      placeholder={t('content_management.placeholder_answer')}
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <button type="submit" disabled={saving === `faqs/${faq.id}`} className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2">
                        <Save size={16} />
                        {saving === `faqs/${faq.id}` ? t('content_management.saving') : t('content_management.save_faq', { num: index + 1 })}
                      </button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>

          {/* Services Page Content */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.services_page')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('services-page', { 
              hero_title: content?.servicesPage?.hero_title,
              hero_subtitle: content?.servicesPage?.hero_subtitle,
              pillars_title: content?.servicesPage?.pillars_title,
              pillar_1_title: content?.servicesPage?.pillar_1_title,
              pillar_1_description: content?.servicesPage?.pillar_1_description,
              pillar_2_title: content?.servicesPage?.pillar_2_title,
              pillar_2_description: content?.servicesPage?.pillar_2_description,
              pillar_3_title: content?.servicesPage?.pillar_3_title,
              pillar_3_description: content?.servicesPage?.pillar_3_description,
              services_overview_title: content?.servicesPage?.services_overview_title,
              service_1_title: content?.servicesPage?.service_1_title,
              service_1_description: content?.servicesPage?.service_1_description,
              service_2_title: content?.servicesPage?.service_2_title,
              service_2_description: content?.servicesPage?.service_2_description,
              business_gp_title: content?.servicesPage?.business_gp_title,
              business_gp_subtitle: content?.servicesPage?.business_gp_subtitle,
              business_gp_description: content?.servicesPage?.business_gp_description,
              data_intelligence_title: content?.servicesPage?.data_intelligence_title,
              data_intelligence_description: content?.servicesPage?.data_intelligence_description
            }); }} className="flex flex-col gap-6">
              
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.three_pillars_section')}</h3>
                <RichTextEditor
                  label={t('content_management.pillars_title')}
                  value={getStringValue(content?.servicesPage?.pillars_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'pillars_title', value)}
                  placeholder={t('content_management.placeholder_section_title')}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <RichTextEditor
                      label={t('content_management.pillar_1') + ' ' + t('content_management.section_title')}
                      value={getStringValue(content?.servicesPage?.pillar_1_title)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_1_title', value)}
                      placeholder={t('content_management.placeholder_card_title')}
                    />
                    <RichTextEditor
                      label={t('content_management.pillar_1') + ' ' + t('content_management.description')}
                      value={getStringValue(content?.servicesPage?.pillar_1_description)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_1_description', value)}
                      placeholder={t('content_management.placeholder_description')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label={t('content_management.pillar_2') + ' ' + t('content_management.section_title')}
                      value={getStringValue(content?.servicesPage?.pillar_2_title)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_2_title', value)}
                      placeholder={t('content_management.placeholder_card_title')}
                    />
                    <RichTextEditor
                      label={t('content_management.pillar_2') + ' ' + t('content_management.description')}
                      value={getStringValue(content?.servicesPage?.pillar_2_description)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_2_description', value)}
                      placeholder={t('content_management.placeholder_description')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label={t('content_management.pillar_3') + ' ' + t('content_management.section_title')}
                      value={getStringValue(content?.servicesPage?.pillar_3_title)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_3_title', value)}
                      placeholder={t('content_management.placeholder_card_title')}
                    />
                    <RichTextEditor
                      label={t('content_management.pillar_3') + ' ' + t('content_management.description')}
                      value={getStringValue(content?.servicesPage?.pillar_3_description)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'pillar_3_description', value)}
                      placeholder={t('content_management.placeholder_description')}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.services_overview')}</h3>
                <RichTextEditor
                  label={t('content_management.overview_title')}
                  value={getStringValue(content?.servicesPage?.services_overview_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'services_overview_title', value)}
                  placeholder={t('content_management.placeholder_section_title')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <RichTextEditor
                      label={t('content_management.service') + ' 1 ' + t('content_management.section_title')}
                      value={getStringValue(content?.servicesPage?.service_1_title)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'service_1_title', value)}
                      placeholder={t('content_management.placeholder_card_title')}
                    />
                    <RichTextEditor
                      label={t('content_management.service') + ' 1 ' + t('content_management.description')}
                      value={getStringValue(content?.servicesPage?.service_1_description)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'service_1_description', value)}
                      placeholder={t('content_management.placeholder_description')}
                      rows={4}
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label={t('content_management.service') + ' 2 ' + t('content_management.section_title')}
                      value={getStringValue(content?.servicesPage?.service_2_title)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'service_2_title', value)}
                      placeholder={t('content_management.placeholder_card_title')}
                    />
                    <RichTextEditor
                      label={t('content_management.service') + ' 2 ' + t('content_management.description')}
                      value={getStringValue(content?.servicesPage?.service_2_description)}
                      onChange={(value) => handleRichTextChange('servicesPage', 'service_2_description', value)}
                      placeholder={t('content_management.placeholder_description')}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.business_gp')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RichTextEditor
                    label={t('content_management.business_gp') + ' ' + t('content_management.section_title')}
                    value={getStringValue(content?.servicesPage?.business_gp_title)}
                    onChange={(value) => handleRichTextChange('servicesPage', 'business_gp_title', value)}
                    placeholder={t('content_management.placeholder_section_title')}
                  />
                  <RichTextEditor
                    label={t('content_management.business_gp') + ' ' + t('content_management.section_subtitle')}
                    value={getStringValue(content?.servicesPage?.business_gp_subtitle)}
                    onChange={(value) => handleRichTextChange('servicesPage', 'business_gp_subtitle', value)}
                    placeholder={t('content_management.placeholder_section_subtitle')}
                  />
                </div>
                <RichTextEditor
                  label={t('content_management.description')}
                  value={getStringValue(content?.servicesPage?.business_gp_description)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'business_gp_description', value)}
                  placeholder={t('content_management.placeholder_description')}
                  rows={3}
                />
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.data_intelligence')}</h3>
                <RichTextEditor
                  label={t('content_management.data_intelligence') + ' ' + t('content_management.section_title')}
                  value={getStringValue(content?.servicesPage?.data_intelligence_title)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'data_intelligence_title', value)}
                  placeholder={t('content_management.placeholder_section_title')}
                />
                <RichTextEditor
                  label={t('content_management.description')}
                  value={getStringValue(content?.servicesPage?.data_intelligence_description)}
                  onChange={(value) => handleRichTextChange('servicesPage', 'data_intelligence_description', value)}
                  placeholder={t('content_management.placeholder_description')}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services-page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services-page' ? t('content_management.saving') : t('content_management.save_services_page')}
                </button>
              </div>
            </form>
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
