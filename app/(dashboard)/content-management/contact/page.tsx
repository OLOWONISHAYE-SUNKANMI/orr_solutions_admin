'use client';

import { useState, useEffect } from "react";
import { CMSService } from '../../../../lib/cms-api';
import { Save } from 'lucide-react';
import Skeleton from "@/app/components/ui/Skeleton";
import RichTextEditor from '../../../../components/RichTextEditor';
import SuccessModal from '../../../components/ui/SuccessModal';
import ErrorModal from '../../../components/ui/ErrorModal';
import { useLanguageStore } from '@/store/languageStore';
import { cleanContentObject } from "@/app/utils/htmlCleaner";

interface ContactPageData {
  id: number;
  hero_title: string;
  contact_info_title: string;
  contact_info_subtitle: string;
  phone_number: string;
  email_address: string;
  address: string;
  first_name_label: string;
  last_name_label: string;
  email_label: string;
  phone_label: string;
  subject_label: string;
  message_label: string;
  first_name_placeholder: string;
  last_name_placeholder: string;
  email_placeholder: string;
  phone_placeholder: string;
  message_placeholder: string;
  subject_option_1: string;
  subject_option_2: string;
  subject_option_3: string;
  subject_option_4: string;
  submit_button_text: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
}

export default function Contact() {
  const [data, setData] = useState<ContactPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { t } = useLanguageStore();
  const cmsService = new CMSService();
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Contact page data from backend...');
        const response = await cmsService.getContactPageContent();
        console.log('✅ Contact API Response:', response);
        const cleanedData = cleanContentObject(response);
        setData(cleanedData);
      } catch (error) {
        // No dummy fallback: on error leave the form empty (every field reads
        // `data?.field || ''`) rather than seeding placeholder contact details
        // that an admin could unknowingly save back to the live CMS.
        console.error('❌ Error fetching Contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (section: string) => {
    setSaving(section);
    try {
      // Check if we have an auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        console.error('❌ No auth token found');
        setErrorModal({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Authentication required. Please log in again.'
        });
        return;
      }
      
      // Clean the payload - remove undefined/null values and ensure proper structure
      const cleanPayload = {
        id: data?.id || 1,
        hero_title: data?.hero_title || '',
        contact_info_title: data?.contact_info_title || '',
        contact_info_subtitle: data?.contact_info_subtitle || '',
        phone_number: data?.phone_number || '',
        email_address: data?.email_address || '',
        address: data?.address || '',
        first_name_label: data?.first_name_label || '',
        last_name_label: data?.last_name_label || '',
        email_label: data?.email_label || '',
        phone_label: data?.phone_label || '',
        subject_label: data?.subject_label || '',
        message_label: data?.message_label || '',
        first_name_placeholder: data?.first_name_placeholder || '',
        last_name_placeholder: data?.last_name_placeholder || '',
        email_placeholder: data?.email_placeholder || '',
        phone_placeholder: data?.phone_placeholder || '',
        message_placeholder: data?.message_placeholder || '',
        subject_option_1: data?.subject_option_1 || '',
        subject_option_2: data?.subject_option_2 || '',
        subject_option_3: data?.subject_option_3 || '',
        subject_option_4: data?.subject_option_4 || '',
        submit_button_text: data?.submit_button_text || '',
        meta_title: data?.meta_title || '',
        meta_description: data?.meta_description || '',
        is_active: data?.is_active ?? true
      };
      
      console.log('🔄 Sending Contact page data:', cleanPayload);
      console.log('🔑 Using auth token:', token ? 'Present' : 'Missing');
      
      await cmsService.updateContactPageContent(cleanPayload);
      setSuccessModal({
        isOpen: true,
        title: t('content_management.content_saved'),
        message: t('content_management.success_msg')
      });
      const result = await cmsService.getContactPageContent();
      setData(result);
    } catch (error) {
      console.error('Failed to save:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.save_failed'),
        message: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRichTextChange = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white p-4 md:p-8 flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-secondary/40 bg-white/5 p-6 flex flex-col gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">{t('content_management.contact_title')}</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">{t('content_management.contact_subtitle')}</p>
          </div>

          {/* Page Header Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.page_header')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('page-header'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_section')}
                value={data?.hero_title || ''}
                onChange={(value) => handleRichTextChange('hero_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label={t('content_management.meta_seo')}
                value={data?.meta_title || ''}
                onChange={(value) => handleRichTextChange('meta_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label={t('content_management.meta_desc_seo')}
                value={data?.meta_description || ''}
                onChange={(value) => handleRichTextChange('meta_description', value)}
                placeholder={t('content_management.enter_description')}
                rows={3}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'page-header'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'page-header' ? t('content_management.saving') : t('content_management.save_section')}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Contact Information</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('contact-info'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label="Contact Info Title"
                value={data?.contact_info_title || ''}
                onChange={(value) => handleRichTextChange('contact_info_title', value)}
                placeholder="Enter contact info title"
              />
              <RichTextEditor
                label="Contact Info Subtitle"
                value={data?.contact_info_subtitle || ''}
                onChange={(value) => handleRichTextChange('contact_info_subtitle', value)}
                placeholder="Enter contact info subtitle"
              />
              <RichTextEditor
                label="Phone Number"
                value={data?.phone_number || ''}
                onChange={(value) => handleRichTextChange('phone_number', value)}
                placeholder="Enter phone number"
              />
              <RichTextEditor
                label="Email Address"
                value={data?.email_address || ''}
                onChange={(value) => handleRichTextChange('email_address', value)}
                placeholder="Enter email address"
              />
              <RichTextEditor
                label="Address"
                value={data?.address || ''}
                onChange={(value) => handleRichTextChange('address', value)}
                placeholder="Enter address"
                rows={3}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'contact-info'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'contact-info' ? t('content_management.saving') : t('content_management.save_section')}
                </button>
              </div>
            </form>
          </div>

          {/* Form Labels Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Form Labels</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('form-labels'); 
            }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="First Name Label"
                  value={data?.first_name_label || ''}
                  onChange={(value) => handleRichTextChange('first_name_label', value)}
                  placeholder="Enter first name label"
                />
                <RichTextEditor
                  label="Last Name Label"
                  value={data?.last_name_label || ''}
                  onChange={(value) => handleRichTextChange('last_name_label', value)}
                  placeholder="Enter last name label"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="Email Label"
                  value={data?.email_label || ''}
                  onChange={(value) => handleRichTextChange('email_label', value)}
                  placeholder="Enter email label"
                />
                <RichTextEditor
                  label="Phone Label"
                  value={data?.phone_label || ''}
                  onChange={(value) => handleRichTextChange('phone_label', value)}
                  placeholder="Enter phone label"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="Subject Label"
                  value={data?.subject_label || ''}
                  onChange={(value) => handleRichTextChange('subject_label', value)}
                  placeholder="Enter subject label"
                />
                <RichTextEditor
                  label="Message Label"
                  value={data?.message_label || ''}
                  onChange={(value) => handleRichTextChange('message_label', value)}
                  placeholder="Enter message label"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'form-labels'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'form-labels' ? t('content_management.saving') : t('content_management.save_section')}
                </button>
              </div>
            </form>
          </div>

          {/* Form Placeholders Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Form Placeholders</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('form-placeholders'); 
            }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="First Name Placeholder"
                  value={data?.first_name_placeholder || ''}
                  onChange={(value) => handleRichTextChange('first_name_placeholder', value)}
                  placeholder="Enter first name placeholder"
                />
                <RichTextEditor
                  label="Last Name Placeholder"
                  value={data?.last_name_placeholder || ''}
                  onChange={(value) => handleRichTextChange('last_name_placeholder', value)}
                  placeholder="Enter last name placeholder"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="Email Placeholder"
                  value={data?.email_placeholder || ''}
                  onChange={(value) => handleRichTextChange('email_placeholder', value)}
                  placeholder="Enter email placeholder"
                />
                <RichTextEditor
                  label="Phone Placeholder"
                  value={data?.phone_placeholder || ''}
                  onChange={(value) => handleRichTextChange('phone_placeholder', value)}
                  placeholder="Enter phone placeholder"
                />
              </div>
              <RichTextEditor
                label="Message Placeholder"
                value={data?.message_placeholder || ''}
                onChange={(value) => handleRichTextChange('message_placeholder', value)}
                placeholder="Enter message placeholder"
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'form-placeholders'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'form-placeholders' ? 'Saving...' : 'Save Form Placeholders'}
                </button>
              </div>
            </form>
          </div>

          {/* Subject Options Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Subject Options</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('subject-options'); 
            }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="Subject Option 1"
                  value={data?.subject_option_1 || ''}
                  onChange={(value) => handleRichTextChange('subject_option_1', value)}
                  placeholder="Enter subject option 1"
                />
                <RichTextEditor
                  label="Subject Option 2"
                  value={data?.subject_option_2 || ''}
                  onChange={(value) => handleRichTextChange('subject_option_2', value)}
                  placeholder="Enter subject option 2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RichTextEditor
                  label="Subject Option 3"
                  value={data?.subject_option_3 || ''}
                  onChange={(value) => handleRichTextChange('subject_option_3', value)}
                  placeholder="Enter subject option 3"
                />
                <RichTextEditor
                  label="Subject Option 4"
                  value={data?.subject_option_4 || ''}
                  onChange={(value) => handleRichTextChange('subject_option_4', value)}
                  placeholder="Enter subject option 4"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'subject-options'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'subject-options' ? t('content_management.saving') : t('content_management.save_section')}
                </button>
              </div>
            </form>
          </div>

          {/* Submit Button Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Submit Button</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('submit-button'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label="Submit Button Text"
                value={data?.submit_button_text || ''}
                onChange={(value) => handleRichTextChange('submit_button_text', value)}
                placeholder="Enter submit button text"
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'submit-button'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'submit-button' ? t('content_management.saving') : t('content_management.save_section')}
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
