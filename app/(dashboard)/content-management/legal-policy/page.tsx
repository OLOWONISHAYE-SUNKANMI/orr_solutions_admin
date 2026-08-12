'use client';

import { useState, useEffect } from "react";
import { CMSService } from '../../../../lib/cms-api';
import { Save } from 'lucide-react';
import Skeleton from "@/app/components/ui/Skeleton";
import RichTextEditor from '../../../../components/RichTextEditor';
import { cleanContentObject } from '../../../utils/htmlCleaner';
import SuccessModal from '../../../components/ui/SuccessModal';
import ErrorModal from '../../../components/ui/ErrorModal';
import { useLanguageStore } from '@/store/languageStore';

interface PolicyItem {
  id: number;
  number: string;
  description: string;
  order: number;
  is_active: boolean;
}

interface LegalPolicyData {
  page: {
    id: number;
    hero_title: string;
    hero_description: string;
    meta_title?: string;
    meta_description?: string;
    is_active: boolean;
  };
  items: PolicyItem[];
}

export default function LegacyPolicy() {
  const [data, setData] = useState<LegalPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { t } = useLanguageStore();
  const cmsService = new CMSService();
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Legal & Policy data from backend...');
        const response = await cmsService.getLegalPolicyPageContent();
        console.log('✅ Legal & Policy API Response:', response);
        
        // Clean HTML from page content
        const cleanedPage = cleanContentObject(response.page);
        
        // Clean HTML from policy items
        const cleanedItems = response.items?.map((item: PolicyItem) => 
          cleanContentObject(item)
        ) || [];
        
        setData({ page: cleanedPage, items: cleanedItems });
      } catch (error) {
        console.error('❌ Error fetching Legal & Policy data:', error);
        setData({
          page: {
            id: 1,
            hero_title: "Legacy & Policy",
            hero_description: "Error loading content. Please try again later.",
            is_active: false
          },
          items: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (section: string, saveData: any) => {
    setSaving(section);
    try {
      if (section.startsWith('item-')) {
        const itemId = parseInt(section.split('-')[1]);
        await cmsService.updatePolicyItem(itemId, saveData);
      } else {
        await cmsService.updateLegalPolicyPageContent(saveData);
      }
      setSuccessModal({
        isOpen: true,
        title: t('content_management.content_saved'),
        message: t('content_management.success_msg')
      });
    } catch (error) {
      console.error('Failed to save:', error);
      setErrorModal({
        isOpen: true,
        title: t('content_management.save_failed'),
        message: t('content_management.save_failed')
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRichTextChange = (section: string, field: string, value: any) => {
    if (section === 'page') {
      setData((prev: any) => ({
        ...prev,
        page: {
          ...prev.page,
          [field]: value
        }
      }));
    } else if (section.startsWith('item-')) {
      const itemId = parseInt(section.replace('item-', ''));
      const newItems = data?.items?.map((i: PolicyItem) => 
        i.id === itemId ? { ...i, [field]: value } : i
      ) || [];
      setData((prev: any) => ({ ...prev, items: newItems }));
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">{t('content_management.legal_policy_title')}</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">{t('content_management.legal_policy_subtitle')}</p>
          </div>

          {/* Page Header Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>{t('content_management.page_header')}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('page-header', { 
                page: { 
                  hero_title: data?.page?.hero_title,
                  hero_description: data?.page?.hero_description,
                  meta_title: data?.page?.meta_title,
                  meta_description: data?.page?.meta_description
                } 
              }); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label={t('content_management.hero_section')}
                value={data?.page?.hero_title || ''}
                onChange={(value) => handleRichTextChange('page', 'hero_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label="Hero Description"
                value={data?.page?.hero_description || ''}
                onChange={(value) => handleRichTextChange('page', 'hero_description', value)}
                placeholder="Enter hero description"
                rows={5}
              />
              <RichTextEditor
                label={t('content_management.meta_seo')}
                value={data?.page?.meta_title || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_title', value)}
                placeholder={t('content_management.enter_title')}
              />
              <RichTextEditor
                label={t('content_management.meta_desc_seo')}
                value={data?.page?.meta_description || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_description', value)}
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

          {/* Policy Items */}
          {(data?.items || []).map((item: PolicyItem, index: number) => (
            <div key={item.id} className={sectionClass}>
              <h2 className={titleClass}>{t('content_management.stage')} {index + 1} - {item.number}</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleSave(`item-${item.id}`, item); 
              }} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RichTextEditor
                    label="Number"
                    value={item.number || ''}
                    onChange={(value) => handleRichTextChange(`item-${item.id}`, 'number', value)}
                    placeholder="01, 02, 03..."
                  />
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Order</label>
                    <input 
                      type="number" 
                      value={item.order || ''} 
                      onChange={(e) => {
                        const newItems = data?.items?.map((i: PolicyItem) => 
                          i.id === item.id ? { ...i, order: parseInt(e.target.value) } : i
                        ) || [];
                        setData((prev: any) => ({ ...prev, items: newItems }));
                      }} 
                      className={inputClass} 
                    />
                  </div>
                </div>

                <RichTextEditor
                  label="Description"
                  value={item.description || ''}
                  onChange={(value) => handleRichTextChange(`item-${item.id}`, 'description', value)}
                  placeholder={t('content_management.enter_description')}
                  rows={6}
                />

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving === `item-${item.id}`} className={buttonClass}>
                    <Save size={18} />
                    {saving === `item-${item.id}` ? t('content_management.saving') : `${t('content_management.save_stage')} ${index + 1}`}
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
