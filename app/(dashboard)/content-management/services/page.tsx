"use client";
import { useEffect, useState } from "react";
import { CMSService } from '../../../../lib/cms-api';
import { Save, Loader, Upload } from 'lucide-react';
import RichTextEditor from '../../../../components/RichTextEditor';
import { getRichTextContent } from '../../../../lib/rich-text-utils';
import SuccessModal from '../../../components/ui/SuccessModal';
import ErrorModal from '../../../components/ui/ErrorModal';

interface ServiceStage {
  id: number;
  stage_number: number;
  title: string;
  subtitle: string;
  description: string;
  focus_content: string;
  button_text: string;
  order: number;
  is_active: boolean;
}

interface ServicePillar {
  id: number;
  title: string;
  description: string;
  button_text: string;
  order: number;
  is_active: boolean;
}

interface ServicesPageData {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  pillars_title: string;
  business_gp_title: string;
  business_gp_subtitle: string;
  business_gp_description: string;
  business_gp_button_text: string;
  business_gp_image: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
}

interface ServicesData {
  page: ServicesPageData;
  stages: ServiceStage[];
  pillars: ServicePillar[];
}

export default function Services() {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const cmsService = new CMSService();
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Services data from backend...');
        const result = await cmsService.getServicesPageContent();
        console.log('✅ Services API Response:', result);
        if (result) {
          console.log('📊 Services Data Structure:', {
            page: result.page,
            stages: result.stages?.length + ' stages' || '0 stages',
            pillars: result.pillars?.length + ' pillars' || '0 pillars'
          });
          setData(result);
        }
      } catch (error) {
        console.error('❌ Error fetching Services data:', error);
        // Fallback data
        setData({
          page: {
            id: 1,
            hero_title: "ORR Solutions – Listen. Solve. Optimise.",
            hero_subtitle: "We diagnose your bottlenecks, treat your administrative and compliance headaches, and unlock hidden value in your data, your operations, and your projects.",
            pillars_title: "The Three Pillars",
            business_gp_title: "ORR is your Business GP for",
            business_gp_subtitle: "complex systems — digital and living.",
            business_gp_description: "We listen to the whole organisation, solve with structure and insight, and optimise so you can grow with confidence.",
            business_gp_button_text: "Contact Us",
            business_gp_image: "/images/handshake.png",
            is_active: true
          },
          stages: [
            {
              id: 1,
              stage_number: 1,
              title: "STAGE 1 - DISCOVER",
              subtitle: "Listen.",
              description: "We start simple: one calm conversation and a quick scan of your reality.",
              focus_content: "We focus on:\n• Your context, people, and pressures\n• Regulatory, operational, data, and environmental risks\n• Which questions actually matter",
              button_text: "Sign up",
              order: 1,
              is_active: true
            },
            {
              id: 2,
              stage_number: 2,
              title: "STAGE 2 - DIAGNOSE",
              subtitle: "Think. Then listen again.",
              description: "We turn symptoms into a clear map of problems and opportunities.",
              focus_content: "What happens here:\n• Bottleneck and process mapping\n• Compliance, governance, and risk review\n• Data and living systems scan",
              button_text: "Learn More",
              order: 2,
              is_active: true
            }
          ],
          pillars: [
            {
              id: 1,
              title: "Digital Systems, Automation & AI",
              description: "SOPs, workflows, portals, dashboards, and AI helpers that make work flow with less effort and fewer surprises.",
              button_text: "Learn More",
              order: 1,
              is_active: true
            },
            {
              id: 2,
              title: "Strategic Advisory & Compliance",
              description: "Short, sharp clarity on rules, risk, and direction — from regulation and ESG to biotech and environmental questions.",
              button_text: "Learn More",
              order: 2,
              is_active: true
            },
            {
              id: 3,
              title: "Living Systems & Regeneration",
              description: "Support for land, water, species, and ecosystems — from production systems to restoration and incident response.",
              button_text: "Learn More",
              order: 3,
              is_active: true
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const validateFieldLength = (value: string, maxLength: number, fieldName: string): boolean => {
    if (value && value.length > maxLength) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: `${fieldName} exceeds maximum length of ${maxLength} characters. Current length: ${value.length}`
      });
      return false;
    }
    return true;
  };

  const handleSave = async (section: string, saveData: any) => {
    setSaving(section);
    try {
      // Validate field lengths for service stages
      if (section.startsWith('stage-')) {
        const stage = saveData;
        if (!validateFieldLength(stage.title, 100, 'Title') ||
            !validateFieldLength(stage.subtitle, 100, 'Subtitle') ||
            !validateFieldLength(stage.button_text, 100, 'Button Text')) {
          return;
        }
        const stageId = parseInt(section.split('-')[1]);
        await cmsService.updateServiceStage(stageId, saveData);
      } else if (section.startsWith('pillar-')) {
        const pillar = saveData;
        if (!validateFieldLength(pillar.title, 100, 'Title') ||
            !validateFieldLength(pillar.button_text, 100, 'Button Text')) {
          return;
        }
        const pillarId = parseInt(section.split('-')[1]);
        await cmsService.updateServicePillar(pillarId, saveData);
      } else {
        await cmsService.updateServicesPageContent(saveData);
      }
      setSuccessModal({
        isOpen: true,
        title: 'Content Saved',
        message: 'Your changes have been saved successfully!'
      });
      const result = await cmsService.getServicesPageContent();
      setData(result);
    } catch (error) {
      console.error('Failed to save:', error);
      setErrorModal({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save content'
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
    } else if (section.startsWith('stage-')) {
      const stageId = parseInt(section.replace('stage-', ''));
      const newStages = data?.stages?.map((s: ServiceStage) => 
        s.id === stageId ? { ...s, [field]: value } : s
      ) || [];
      setData((prev: any) => ({ ...prev, stages: newStages }));
    } else if (section.startsWith('pillar-')) {
      const pillarId = parseInt(section.replace('pillar-', ''));
      const newPillars = data?.pillars?.map((p: ServicePillar) => 
        p.id === pillarId ? { ...p, [field]: value } : p
      ) || [];
      setData((prev: any) => ({ ...prev, pillars: newPillars }));
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading('business-gp-image');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset');
      
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url;
      
      await cmsService.updateServicesPageContent({ page: { business_gp_image: imageUrl } });
      setSuccessModal({
        isOpen: true,
        title: 'Image Uploaded',
        message: 'Image uploaded successfully!'
      });
      const result = await cmsService.getServicesPageContent();
      setData(result);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrorModal({
        isOpen: true,
        title: 'Upload Failed',
        message: 'Failed to upload image'
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">Services Content</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">Manage Services page content, stages, and pillars</p>
          </div>

          {/* Page Header Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Page Header</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('page-header', { 
                page: { 
                  hero_title: data?.page?.hero_title,
                  hero_subtitle: data?.page?.hero_subtitle,
                  meta_title: data?.page?.meta_title,
                  meta_description: data?.page?.meta_description
                } 
              }); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label="Hero Title"
                value={data?.page?.hero_title || ''}
                onChange={(value) => handleRichTextChange('page', 'hero_title', value)}
                placeholder="Enter hero title"
              />
              <RichTextEditor
                label="Hero Subtitle"
                value={data?.page?.hero_subtitle || ''}
                onChange={(value) => handleRichTextChange('page', 'hero_subtitle', value)}
                placeholder="Enter hero subtitle"
                rows={4}
              />
              <RichTextEditor
                label="Meta Title (SEO)"
                value={data?.page?.meta_title || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_title', value)}
                placeholder="Enter meta title"
              />
              <RichTextEditor
                label="Meta Description (SEO)"
                value={data?.page?.meta_description || ''}
                onChange={(value) => handleRichTextChange('page', 'meta_description', value)}
                placeholder="Enter meta description"
                rows={3}
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'page-header'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'page-header' ? 'Saving...' : 'Save Page Header'}
                </button>
              </div>
            </form>
          </div>

          {/* Service Stages */}
          {(data?.stages || []).map((stage: ServiceStage) => (
            <div key={stage.id} className={sectionClass}>
              <h2 className={titleClass}>Stage {stage.stage_number} - {getRichTextContent(stage.title)}</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleSave(`stage-${stage.id}`, stage); 
              }} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Stage Number</label>
                    <input 
                      type="number" 
                      value={stage.stage_number || ''} 
                      onChange={(e) => {
                        const newStages = data?.stages?.map((s: ServiceStage) => 
                          s.id === stage.id ? { ...s, stage_number: parseInt(e.target.value) } : s
                        ) || [];
                        setData((prev: any) => ({ ...prev, stages: newStages }));
                      }} 
                      className={inputClass} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Order</label>
                    <input 
                      type="number" 
                      value={stage.order || ''} 
                      onChange={(e) => {
                        const newStages = data?.stages?.map((s: ServiceStage) => 
                          s.id === stage.id ? { ...s, order: parseInt(e.target.value) } : s
                        ) || [];
                        setData((prev: any) => ({ ...prev, stages: newStages }));
                      }} 
                      className={inputClass} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label={`Title (${(stage.title || '').length}/100 characters)`}
                    value={stage.title || ''}
                    onChange={(value) => handleRichTextChange(`stage-${stage.id}`, 'title', value)}
                    placeholder="Enter stage title"
                  />
                  {(stage.title || '').length > 100 && (
                    <p className="text-red-400 text-xs">Title exceeds 100 character limit</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label={`Subtitle (${(stage.subtitle || '').length}/100 characters)`}
                    value={stage.subtitle || ''}
                    onChange={(value) => handleRichTextChange(`stage-${stage.id}`, 'subtitle', value)}
                    placeholder="Enter stage subtitle"
                  />
                  {(stage.subtitle || '').length > 100 && (
                    <p className="text-red-400 text-xs">Subtitle exceeds 100 character limit</p>
                  )}
                </div>

                <RichTextEditor
                  label="Description"
                  value={stage.description || ''}
                  onChange={(value) => handleRichTextChange(`stage-${stage.id}`, 'description', value)}
                  placeholder="Enter stage description"
                  rows={3}
                />

                <RichTextEditor
                  label="Focus Content"
                  value={stage.focus_content || ''}
                  onChange={(value) => handleRichTextChange(`stage-${stage.id}`, 'focus_content', value)}
                  placeholder="Use line breaks for bullet points"
                  rows={5}
                />

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label={`Button Text (${(stage.button_text || '').length}/100 characters)`}
                    value={stage.button_text || ''}
                    onChange={(value) => handleRichTextChange(`stage-${stage.id}`, 'button_text', value)}
                    placeholder="Enter button text"
                  />
                  {(stage.button_text || '').length > 100 && (
                    <p className="text-red-400 text-xs">Button text exceeds 100 character limit</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={
                      saving === `stage-${stage.id}` ||
                      (stage.title || '').length > 100 ||
                      (stage.subtitle || '').length > 100 ||
                      (stage.button_text || '').length > 100
                    } 
                    className={buttonClass}
                  >
                    <Save size={18} />
                    {saving === `stage-${stage.id}` ? 'Saving...' : `Save Stage ${stage.stage_number}`}
                  </button>
                </div>
              </form>
            </div>
          ))}

          {/* Pillars Section Title */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Pillars Section</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('pillars-title', { 
                page: { 
                  pillars_title: data?.page?.pillars_title
                } 
              }); 
            }} className="flex flex-col gap-4">
              <RichTextEditor
                label="Pillars Section Title"
                value={data?.page?.pillars_title || ''}
                onChange={(value) => handleRichTextChange('page', 'pillars_title', value)}
                placeholder="Enter pillars section title"
              />
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'pillars-title'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'pillars-title' ? 'Saving...' : 'Save Pillars Title'}
                </button>
              </div>
            </form>
          </div>

          {/* Service Pillars */}
          {(data?.pillars || []).map((pillar: ServicePillar, index: number) => (
            <div key={pillar.id} className={sectionClass}>
              <h2 className={titleClass}>Pillar {index + 1} - {getRichTextContent(pillar.title)}</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleSave(`pillar-${pillar.id}`, pillar); 
              }} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Order</label>
                  <input 
                    type="number" 
                    value={pillar.order || ''} 
                    onChange={(e) => {
                      const newPillars = data?.pillars?.map((p: ServicePillar) => 
                        p.id === pillar.id ? { ...p, order: parseInt(e.target.value) } : p
                      ) || [];
                      setData((prev: any) => ({ ...prev, pillars: newPillars }));
                    }} 
                    className={inputClass} 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label={`Title (${(pillar.title || '').length}/100 characters)`}
                    value={pillar.title || ''}
                    onChange={(value) => handleRichTextChange(`pillar-${pillar.id}`, 'title', value)}
                    placeholder="Enter pillar title"
                  />
                  {(pillar.title || '').length > 100 && (
                    <p className="text-red-400 text-xs">Title exceeds 100 character limit</p>
                  )}
                </div>

                <RichTextEditor
                  label="Description"
                  value={pillar.description || ''}
                  onChange={(value) => handleRichTextChange(`pillar-${pillar.id}`, 'description', value)}
                  placeholder="Enter pillar description"
                  rows={4}
                />

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label={`Button Text (${(pillar.button_text || '').length}/100 characters)`}
                    value={pillar.button_text || ''}
                    onChange={(value) => handleRichTextChange(`pillar-${pillar.id}`, 'button_text', value)}
                    placeholder="Enter button text"
                  />
                  {(pillar.button_text || '').length > 100 && (
                    <p className="text-red-400 text-xs">Button text exceeds 100 character limit</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={
                      saving === `pillar-${pillar.id}` ||
                      (pillar.title || '').length > 100 ||
                      (pillar.button_text || '').length > 100
                    } 
                    className={buttonClass}
                  >
                    <Save size={18} />
                    {saving === `pillar-${pillar.id}` ? 'Saving...' : `Save Pillar ${index + 1}`}
                  </button>
                </div>
              </form>
            </div>
          ))}

          {/* Business GP Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Business GP Section</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('business-gp', { 
                page: { 
                  business_gp_title: data?.page?.business_gp_title,
                  business_gp_subtitle: data?.page?.business_gp_subtitle,
                  business_gp_description: data?.page?.business_gp_description,
                  business_gp_button_text: data?.page?.business_gp_button_text,
                  business_gp_image: data?.page?.business_gp_image
                } 
              }); 
            }} className="flex flex-col gap-4">
              
              {/* Image Upload Section */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <label className={labelClass}>Business GP Image</label>
                {data?.page?.business_gp_image && (
                  <div className="mb-4">
                    <img 
                      src={data.page.business_gp_image} 
                      alt="Business GP" 
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
                    id="business-gp-image-upload"
                  />
                  <label 
                    htmlFor="business-gp-image-upload"
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    {uploading === 'business-gp-image' ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Image
                      </>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={data?.page?.business_gp_image || ''} 
                    onChange={(e) => setData((prev: any) => ({ ...prev, page: { ...prev.page, business_gp_image: e.target.value } }))}
                    placeholder="Or paste image URL"
                    className={inputClass}
                  />
                </div>
              </div>

              <RichTextEditor
                label="Title"
                value={data?.page?.business_gp_title || ''}
                onChange={(value) => handleRichTextChange('page', 'business_gp_title', value)}
                placeholder="Enter business GP title"
              />

              <RichTextEditor
                label="Subtitle"
                value={data?.page?.business_gp_subtitle || ''}
                onChange={(value) => handleRichTextChange('page', 'business_gp_subtitle', value)}
                placeholder="Enter business GP subtitle"
              />

              <RichTextEditor
                label="Description"
                value={data?.page?.business_gp_description || ''}
                onChange={(value) => handleRichTextChange('page', 'business_gp_description', value)}
                placeholder="Enter business GP description"
                rows={4}
              />

              <RichTextEditor
                label="Button Text"
                value={data?.page?.business_gp_button_text || ''}
                onChange={(value) => handleRichTextChange('page', 'business_gp_button_text', value)}
                placeholder="Enter button text"
              />

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'business-gp'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'business-gp' ? 'Saving...' : 'Save Business GP Section'}
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