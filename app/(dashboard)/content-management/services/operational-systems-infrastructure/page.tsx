"use client";

import { useState, useEffect } from "react";
import { Save, Loader, Upload } from 'lucide-react';
import RichTextEditor from '../../../../../components/RichTextEditor';
import { cleanContentObject } from '../../../../utils/htmlCleaner';
import SuccessModal from '../../../../components/ui/SuccessModal';
import ErrorModal from '../../../../components/ui/ErrorModal';
import { useLanguageStore } from "@/store/languageStore";

interface OperationalSystemsContent {
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  services_title: string;
  service_1_title: string;
  service_1_description: string;
  service_2_title: string;
  service_2_description: string;
  service_3_title: string;
  service_3_description: string;
  process_title: string;
  process_description: string;
  process_step_1_title: string;
  process_step_1: string;
  process_step_2_title: string;
  process_step_2: string;
  process_step_3_title: string;
  process_step_3: string;
  case_challenge: string;
  case_solution: string;
  case_result: string;
  case_image_url?: string;
  case_image_alt: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export default function OperationalSystemsPage() {
  const { t, language } = useLanguageStore();
  const [content, setContent] = useState<OperationalSystemsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/operational-systems/`);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        const cleanedContent = cleanContentObject(data.data);
        setContent(cleanedContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [t]);

  const handleSave = async (section: string) => {
    setSaving(section);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/operational-systems/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      
      if (response.ok) {
        setSuccessModal({
          isOpen: true,
          title: t('content_management.success_save_title'),
          message: t('content_management.success_save_msg')
        });
      }
    } catch (err) {
      console.error('Failed to update content:', err);
      setErrorModal({
        isOpen: true,
        title: t('content_management.error_save_title'),
        message: t('content_management.error_save_msg')
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRichTextChange = (field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading('case-image');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset');
      
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed');
      
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url;
      
      setContent((prev: any) => ({ ...prev, case_image_url: imageUrl }));
      setSuccessModal({
        isOpen: true,
        title: t('content_management.upload_success_title'),
        message: t('content_management.upload_success_msg')
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.upload_failed_title'),
        message: t('content_management.upload_failed_msg')
      });
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('common.error')}</h1>
          <p className="text-gray-400">{error}</p>
        </div>
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">{t('content_management.operational_systems_title')}</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">{t('content_management.operational_systems_subtitle')}</p>
          </div>

          {/* Hero Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.hero_section')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('hero'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_title')}
                value={content.hero_title || ''}
                onChange={(value) => handleRichTextChange('hero_title', value)}
                placeholder={t('content_management.hero_title')}
              />
              <RichTextEditor
                label={t('content_management.hero_subtitle')}
                value={content.hero_subtitle || ''}
                onChange={(value) => handleRichTextChange('hero_subtitle', value)}
                placeholder={t('content_management.hero_subtitle')}
                rows={3}
              />
              <RichTextEditor
                label={t('content_management.description')}
                value={content.hero_description || ''}
                onChange={(value) => handleRichTextChange('hero_description', value)}
                placeholder={t('content_management.description')}
                rows={4}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'hero'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'hero' ? t('content_management.saving') : t('content_management.save_hero')}
                </button>
              </div>
            </form>
          </div>

          {/* Services Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.what_we_offer')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('services'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.section_title')}
                value={content.services_title || ''}
                onChange={(value) => handleRichTextChange('services_title', value)}
                placeholder={t('content_management.section_title')}
              />
              
              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 1 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 1 })}
                    value={content.service_1_title || ''}
                    onChange={(value) => handleRichTextChange('service_1_title', value)}
                    placeholder={t('content_management.card_title', { num: 1 })}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 1 })}
                    value={content.service_1_description || ''}
                    onChange={(value) => handleRichTextChange('service_1_description', value)}
                    placeholder={t('content_management.card_description', { num: 1 })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 2 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 2 })}
                    value={content.service_2_title || ''}
                    onChange={(value) => handleRichTextChange('service_2_title', value)}
                    placeholder={t('content_management.card_title', { num: 2 })}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 2 })}
                    value={content.service_2_description || ''}
                    onChange={(value) => handleRichTextChange('service_2_description', value)}
                    placeholder={t('content_management.card_description', { num: 2 })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.card', { num: 3 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 3 })}
                    value={content.service_3_title || ''}
                    onChange={(value) => handleRichTextChange('service_3_title', value)}
                    placeholder={t('content_management.card_title', { num: 3 })}
                  />
                  <RichTextEditor
                    label={t('content_management.card_description', { num: 3 })}
                    value={content.service_3_description || ''}
                    onChange={(value) => handleRichTextChange('service_3_description', value)}
                    placeholder={t('content_management.card_description', { num: 3 })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'services'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'services' ? t('content_management.saving') : t('content_management.save')}
                </button>
              </div>
            </form>
          </div>

          {/* Process Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.how_we_work')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('process'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.network_title')}
                value={content.process_title || ''}
                onChange={(value) => handleRichTextChange('process_title', value)}
                placeholder={t('content_management.network_title')}
              />
              <RichTextEditor
                label={t('content_management.process_description')}
                value={content.process_description || ''}
                onChange={(value) => handleRichTextChange('process_description', value)}
                placeholder={t('content_management.process_description')}
                rows={3}
              />
              
              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{content.process_step_1_title || t('content_management.process_step', { num: 1 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 1 })}
                    value={content.process_step_1_title || ''}
                    onChange={(value) => handleRichTextChange('process_step_1_title', value)}
                    placeholder={t('content_management.card_title', { num: 1 })}
                  />
                  <RichTextEditor
                    label={t('content_management.description')}
                    value={content.process_step_1 || ''}
                    onChange={(value) => handleRichTextChange('process_step_1', value)}
                    placeholder={t('content_management.description')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{content.process_step_2_title || t('content_management.process_step', { num: 2 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 2 })}
                    value={content.process_step_2_title || ''}
                    onChange={(value) => handleRichTextChange('process_step_2_title', value)}
                    placeholder={t('content_management.card_title', { num: 2 })}
                  />
                  <RichTextEditor
                    label={t('content_management.description')}
                    value={content.process_step_2 || ''}
                    onChange={(value) => handleRichTextChange('process_step_2', value)}
                    placeholder={t('content_management.description')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-4 text-white">{content.process_step_3_title || t('content_management.process_step', { num: 3 })}</h3>
                <div className="flex flex-col gap-4">
                  <RichTextEditor
                    label={t('content_management.card_title', { num: 3 })}
                    value={content.process_step_3_title || ''}
                    onChange={(value) => handleRichTextChange('process_step_3_title', value)}
                    placeholder={t('content_management.card_title', { num: 3 })}
                  />
                  <RichTextEditor
                    label={t('content_management.description')}
                    value={content.process_step_3 || ''}
                    onChange={(value) => handleRichTextChange('process_step_3', value)}
                    placeholder={t('content_management.description')}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'process'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'process' ? t('content_management.saving') : t('content_management.save')}
                </button>
              </div>
            </form>
          </div>

          {/* Case Example Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.case_example_section')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('case'); 
            }} className="flex flex-col gap-4">
              
              {/* Image Upload Section */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <label className={labelClass}>{t('content_management.case_image_url')}</label>
                {content.case_image_url && (
                  <div className="mb-4">
                    <img 
                      src={content.case_image_url} 
                      alt={content.case_image_alt || 'Case Example'} 
                      className="w-full max-w-md h-48 object-cover rounded-lg" 
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    id="case-image-upload"
                  />
                  <label 
                    htmlFor="case-image-upload"
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    {uploading === 'case-image' ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        {t('content_management.saving')}
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        {t('common.view')}
                      </>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={content.case_image_url || ''} 
                    onChange={(e) => setContent((prev: any) => ({ ...prev, case_image_url: e.target.value }))}
                    placeholder="URL"
                    className={inputClass}
                  />
                </div>
              </div>

              <RichTextEditor
                label={t('content_management.case_challenge')}
                value={content.case_challenge || ''}
                onChange={(value) => handleRichTextChange('case_challenge', value)}
                placeholder={t('content_management.case_challenge')}
                rows={4}
              />
              <RichTextEditor
                label={t('content_management.case_solution')}
                value={content.case_solution || ''}
                onChange={(value) => handleRichTextChange('case_solution', value)}
                placeholder={t('content_management.case_solution')}
                rows={4}
              />
              <RichTextEditor
                label={t('content_management.case_result')}
                value={content.case_result || ''}
                onChange={(value) => handleRichTextChange('case_result', value)}
                placeholder={t('content_management.case_result')}
                rows={4}
              />
              <RichTextEditor
                label={t('content_management.case_image_alt')}
                value={content.case_image_alt || ''}
                onChange={(value) => handleRichTextChange('case_image_alt', value)}
                placeholder={t('content_management.case_image_alt')}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'case'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'case' ? t('content_management.saving') : t('content_management.save')}
                </button>
              </div>
            </form>
          </div>

          {/* CTA Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.orr_role_section')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('cta'); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_title')}
                value={content.cta_title || ''}
                onChange={(value) => handleRichTextChange('cta_title', value)}
                placeholder={t('content_management.hero_title')}
              />
              <RichTextEditor
                label={t('content_management.description')}
                value={content.cta_description || ''}
                onChange={(value) => handleRichTextChange('cta_description', value)}
                placeholder={t('content_management.description')}
                rows={3}
              />
              <RichTextEditor
                label={t('content_management.button_text')}
                value={content.cta_button_text || ''}
                onChange={(value) => handleRichTextChange('cta_button_text', value)}
                placeholder={t('content_management.button_text')}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'cta'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'cta' ? t('content_management.saving') : t('content_management.save')}
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
