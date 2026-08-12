"use client";

import { useState, useEffect } from 'react';
import { Save, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import Skeleton from "@/app/components/ui/Skeleton";
import RichTextEditor from '../../../../components/RichTextEditor';
import { cleanContentObject, cleanHtmlContent } from '../../../utils/htmlCleaner';
import SuccessModal from '../../../components/ui/SuccessModal';
import ErrorModal from '../../../components/ui/ErrorModal';
import { useLanguageStore } from '@/store/languageStore';

export default function HowWeOperatePage() {
  const { t, language } = useLanguageStore();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data from backend...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/how-we-operate/`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch data:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Fetched data:', result);
      
      // Clean HTML from page content
      const cleanedPage = cleanContentObject(result.data.page);
      
      // Clean HTML from steps content
      const cleanedSteps = result.data.steps?.map((step: any) => 
        cleanContentObject(step)
      ) || [];
      
      setContent({ page: cleanedPage, steps: cleanedSteps });
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.load_failed'),
        message: `${t('content_management.load_failed')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(section);
    try {
      console.log('Saving data:', JSON.stringify(data, null, 2));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/how-we-operate/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSuccessModal({
          isOpen: true,
          title: t('content_management.content_saved'),
          message: t('content_management.success_msg')
        });
      } else {
        // Get the error details from the response
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let errorMessage = `Failed to save (${response.status})`;
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.error) {
            errorMessage += `: ${parsedError.error}`;
          } else if (parsedError.message) {
            errorMessage += `: ${parsedError.message}`;
          }
        } catch (e) {
          // If response is not JSON, show the raw text
          if (errorData) {
            errorMessage += `: ${errorData.substring(0, 200)}`;
          }
        }
        
        setErrorModal({
          isOpen: true,
          title: t('content_management.save_failed'),
          message: errorMessage
        });
      }
    } catch (error) {
      console.error('Network/fetch error:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.network_error'),
        message: `${t('content_management.network_error')}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRichTextChange = (section: string, field: string, value: any) => {
    if (section === 'page') {
      setContent((prev: any) => ({
        ...prev,
        page: {
          ...prev.page,
          [field]: value
        }
      }));
    } else if (section.startsWith('step-')) {
      const stepId = parseInt(section.replace('step-', ''));
      const newSteps = content.steps.map((s: any) => 
        s.id === stepId ? { ...s, [field]: value } : s
      );
      setContent((prev: any) => ({ ...prev, steps: newSteps }));
    }
  };

  const handleImageUpload = async (stepId: number, file: File) => {
    setUploading(`step-${stepId}`);
    try {
      // Upload to Cloudinary or your image service
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset'); // Configure this
      
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url;
      
      // Update step with new image URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app'}/admin-portal/v1/cms/process-steps/${stepId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });
      
      if (response.ok) {
        setSuccessModal({
          isOpen: true,
          title: t('content_management.image_uploaded'),
          message: t('content_management.image_success_msg')
        });
        
        // Update only the specific step's image URL without refetching all data
        const newSteps = content.steps.map((s: any) => 
          s.id === stepId ? { ...s, image_url: imageUrl } : s
        );
        setContent((prev: any) => ({ ...prev, steps: newSteps }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.save_failed'),
        message: t('content_management.save_failed')
      });
    } finally {
      setUploading(null);
    }
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">{t('content_management.how_we_operate_title')}</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">{t('content_management.how_we_operate_subtitle')}</p>
          </div>

          {/* Page Header Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.page_header')}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave('page', { page: { hero_title: content?.page?.hero_title, meta_title: content?.page?.meta_title, meta_description: content?.page?.meta_description } }); }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_section')}
                value={content?.page?.hero_title || ''}
                onChange={(value) => handleRichTextChange('page', 'hero_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label={t('content_management.meta_seo')}
                value={content?.page?.meta_title || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label={t('content_management.meta_desc_seo')}
                value={content?.page?.meta_description || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_description', value)}
                placeholder={t('content_management.enter_description')}
                rows={3}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'page'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'page' ? t('content_management.saving') : t('content_management.save_section')}
                </button>
              </div>
            </form>
          </div>

          {/* Process Steps */}
          {(content?.steps || []).map((step: any, index: number) => (
            <div key={step.id} className={sectionClass}>
              <h2 className={titleClass}>{t('content_management.step')} {cleanHtmlContent(step.step_number)} - {cleanHtmlContent(step.title)}</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleSave(`step-${step.id}`, { 
                  steps: [{ 
                    id: step.id, 
                    step_number: step.step_number,
                    title: step.title, 
                    subtitle: step.subtitle, 
                    description: step.description,
                    bullet1: step.bullet1,
                    bullet2: step.bullet2,
                    bullet3: step.bullet3,
                    bullet4: step.bullet4,
                    bullet5: step.bullet5,
                    bullet6: step.bullet6,
                    bullet7: step.bullet7,
                    bullet8: step.bullet8,
                    bullet9: step.bullet9,
                    wordbreak: step.wordbreak,
                    description1: step.description1,
                    description2: step.description2,
                    description3: step.description3,
                    description4: step.description4,
                    button_text: step.button_text,
                    button_text2: step.button_text2,
                    button_text3: step.button_text3
                  }] 
                }); 
              }} className="flex flex-col gap-4">
                
                {/* Image Upload Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <label className={labelClass}>{t('content_management.step')} {t('content_management.image_label') || 'Image'}</label>
                  {step.image_url && (
                    <div className="mb-4">
                      <img src={step.image_url} alt={step.title} className="w-full max-w-md h-48 object-cover rounded-lg" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(step.id, file);
                      }}
                      className="hidden"
                      id={`image-upload-${step.id}`}
                    />
                    <label 
                      htmlFor={`image-upload-${step.id}`}
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
                    >
                      {uploading === `step-${step.id}` ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          {t('content_management.uploading')}
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          {t('content_management.upload_image')}
                        </>
                      )}
                    </label>
                    <input 
                      type="text" 
                      value={step.image_url || ''} 
                      onChange={(e) => {
                        const newSteps = content.steps.map((s: any) => 
                          s.id === step.id ? { ...s, image_url: e.target.value } : s
                        );
                        setContent((prev: any) => ({ ...prev, steps: newSteps }));
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RichTextEditor
                    label={t('content_management.step_number')}
                    value={step.step_number || ''}
                    onChange={(value) => handleRichTextChange(`step-${step.id}`, 'step_number', value)}
                    placeholder={t('content_management.enter_title')}
                  />
                  <RichTextEditor
                    label={t('content_management.title_label')}
                    value={step.title || ''}
                    onChange={(value) => handleRichTextChange(`step-${step.id}`, 'title', value)}
                    placeholder={t('content_management.enter_title')}
                  />
                </div>

                <RichTextEditor
                  label={t('content_management.subtitle_label')}
                  value={step.subtitle || ''}
                  onChange={(value) => handleRichTextChange(`step-${step.id}`, 'subtitle', value)}
                  placeholder={t('content_management.enter_title')}
                />

                <RichTextEditor
                  label={t('content_management.description_label')}
                  value={step.description || ''}
                  onChange={(value) => handleRichTextChange(`step-${step.id}`, 'description', value)}
                  placeholder={t('content_management.enter_description')}
                  rows={3}
                />

                {/* Bullets */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.bullet_points')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <RichTextEditor
                        key={num}
                        label={`${t('content_management.bullet_points')} ${num}`}
                        value={step[`bullet${num}`] || ''}
                        onChange={(value) => handleRichTextChange(`step-${step.id}`, `bullet${num}`, value)}
                        placeholder={`${t('content_management.enter_description')} ${num}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Additional Descriptions */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.additional_content')}</h3>
                  <div className="flex flex-col gap-4">
                    <RichTextEditor
                      label={t('content_management.word_break')}
                      value={step.wordbreak || ''}
                      onChange={(value) => handleRichTextChange(`step-${step.id}`, 'wordbreak', value)}
                      placeholder={t('content_management.enter_title')}
                    />
                    {[1, 2, 3, 4].map((num) => (
                      <RichTextEditor
                        key={num}
                        label={`${t('content_management.description_label')} ${num}`}
                        value={step[`description${num}`] || ''}
                        onChange={(value) => handleRichTextChange(`step-${step.id}`, `description${num}`, value)}
                        placeholder={`${t('content_management.enter_description')} ${num}`}
                        rows={3}
                      />
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('content_management.button_label')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RichTextEditor
                      label={`${t('content_management.button_label')} 1`}
                      value={step.button_text || ''}
                      onChange={(value) => handleRichTextChange(`step-${step.id}`, 'button_text', value)}
                      placeholder={t('content_management.enter_title')}
                    />
                    <RichTextEditor
                      label={`${t('content_management.button_label')} 2`}
                      value={step.button_text2 || ''}
                      onChange={(value) => handleRichTextChange(`step-${step.id}`, 'button_text2', value)}
                      placeholder={t('content_management.enter_title')}
                    />
                    <RichTextEditor
                      label={`${t('content_management.button_label')} 3`}
                      value={step.button_text3 || ''}
                      onChange={(value) => handleRichTextChange(`step-${step.id}`, 'button_text3', value)}
                      placeholder={t('content_management.enter_title')}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving === `step-${step.id}`} className={buttonClass}>
                    <Save size={18} />
                    {saving === `step-${step.id}` ? t('content_management.saving') : `${t('content_management.save_step')} ${cleanHtmlContent(step.step_number)}`}
                  </button>
                </div>
              </form>
            </div>
          ))}
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
