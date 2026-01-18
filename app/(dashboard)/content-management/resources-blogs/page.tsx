"use client";

import { useState, useEffect } from "react";
import { CMSService } from '../../../../lib/cms-api';
import { Save, Loader, Upload } from 'lucide-react';
import RichTextEditor from '../../../../components/RichTextEditor';
import { cleanContentObject } from '../../../utils/htmlCleaner';

interface ContentCard {
  id: number;
  badge: string;
  title: string;
  content: string[];
  image_url: string;
  button1_text?: string;
  button2_text?: string;
  order: number;
  is_active: boolean;
}

interface ResourcesBlogsData {
  page: {
    id: number;
    hero_title: string;
    hero_description1: string;
    hero_description2: string;
    hero_description3: string;
    hero_button1_text: string;
    hero_button2_text: string;
    meta_title?: string;
    meta_description?: string;
    is_active: boolean;
  };
  cards: ContentCard[];
}

export default function ResourcesBlogs() {
  const [data, setData] = useState<ResourcesBlogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const cmsService = new CMSService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Resources & Blogs data from backend...');
        const response = await cmsService.getResourcesBlogsPageContent();
        console.log('✅ Resources & Blogs API Response:', response);
        
        // Clean HTML from page content
        const cleanedPage = cleanContentObject(response.page);
        
        // Clean HTML from cards content
        const cleanedCards = response.cards?.map((card: ContentCard) => {
          const cleanedCard = cleanContentObject(card);
          // Also clean the content array if it exists
          if (cleanedCard.content && Array.isArray(cleanedCard.content)) {
            cleanedCard.content = cleanedCard.content.map((item: string) => 
              typeof item === 'string' ? item.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').trim() : item
            );
          }
          return cleanedCard;
        }) || [];
        
        setData({ page: cleanedPage, cards: cleanedCards });
      } catch (error) {
        console.error('❌ Error fetching Resources & Blogs data:', error);
        setData({
          page: {
            id: 1,
            hero_title: "Resources & Client Portal",
            hero_description1: "Your digital HQ for business clarity, timelines, and real-time status. This isn't a traditional blog.",
            hero_description2: "Our resources are organized around the ORR client portal — a dashboard where you can read FAQs, download material, request meetings, and chat with a live operator or consultant.",
            hero_description3: "Instead of scattered articles, you get structured guidance that follows our live project — following blogs have insight, how-to — and real-time alerts. Everything is organized around live project management, AI marketing systems & implementation.",
            hero_button1_text: "Request access to the client portal",
            hero_button2_text: "Learn how we operate",
            is_active: true
          },
          cards: []
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
      if (section.startsWith('card-')) {
        const cardId = parseInt(section.split('-')[1]);
        await cmsService.updateContentCard(cardId, saveData);
      } else {
        await cmsService.updateResourcesBlogsPageContent(saveData);
      }
      alert('Saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const handleImageUpload = async (cardId: number, file: File) => {
    setUploading(`card-${cardId}`);
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
      
      await cmsService.updateContentCard(cardId, { image_url: imageUrl });
      alert('Image uploaded successfully!');
      
      // Update only the specific card's image URL without refetching all data
      const newCards = data?.cards?.map((c: ContentCard) => 
        c.id === cardId ? { ...c, image_url: imageUrl } : c
      ) || [];
      setData((prev: any) => ({ ...prev, cards: newCards }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(null);
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
    } else if (section.startsWith('card-')) {
      const cardId = parseInt(section.split('-')[1]);
      const newCards = data?.cards?.map((c: ContentCard) => 
        c.id === cardId ? { ...c, [field]: value } : c
      ) || [];
      setData((prev: any) => ({ ...prev, cards: newCards }));
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">Resources & Blogs Content</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-2">Manage Resources & Blogs page content and cards</p>
          </div>

          {/* Page Header Section */}
          <div className={sectionClass}>
            <h2 className={titleClass}>Page Header</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSave('page-header', { 
                page: { 
                  hero_title: data?.page?.hero_title,
                  hero_description1: data?.page?.hero_description1,
                  hero_description2: data?.page?.hero_description2,
                  hero_description3: data?.page?.hero_description3,
                  hero_button1_text: data?.page?.hero_button1_text,
                  hero_button2_text: data?.page?.hero_button2_text,
                  meta_title: data?.page?.meta_title,
                  meta_description: data?.page?.meta_description
                } 
              }); 
            }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Hero Title"
                  value={data?.page?.hero_title || ''}
                  onChange={(value) => handleRichTextChange('page', 'hero_title', value)}
                  placeholder="Enter hero title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Hero Description 1"
                  value={data?.page?.hero_description1 || ''}
                  onChange={(value) => handleRichTextChange('page', 'hero_description1', value)}
                  placeholder="Enter first description"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Hero Description 2"
                  value={data?.page?.hero_description2 || ''}
                  onChange={(value) => handleRichTextChange('page', 'hero_description2', value)}
                  placeholder="Enter second description"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Hero Description 3"
                  value={data?.page?.hero_description3 || ''}
                  onChange={(value) => handleRichTextChange('page', 'hero_description3', value)}
                  placeholder="Enter third description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label="Button 1 Text"
                    value={data?.page?.hero_button1_text || ''}
                    onChange={(value) => handleRichTextChange('page', 'hero_button1_text', value)}
                    placeholder="Enter button 1 text"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label="Button 2 Text"
                    value={data?.page?.hero_button2_text || ''}
                    onChange={(value) => handleRichTextChange('page', 'hero_button2_text', value)}
                    placeholder="Enter button 2 text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Meta Title (SEO)"
                  value={data?.page?.meta_title || ''}
                  onChange={(value) => handleRichTextChange('page', 'meta_title', value)}
                  placeholder="Enter meta title"
                />
              </div>
              <div className="flex flex-col gap-2">
                <RichTextEditor
                  label="Meta Description (SEO)"
                  value={data?.page?.meta_description || ''}
                  onChange={(value) => handleRichTextChange('page', 'meta_description', value)}
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving === 'page-header'} className={buttonClass}>
                  <Save size={18} />
                  {saving === 'page-header' ? 'Saving...' : 'Save Page Header'}
                </button>
              </div>
            </form>
          </div>

          {/* Content Cards */}
          {(data?.cards || []).map((card: ContentCard, index: number) => (
            <div key={card.id} className={sectionClass}>
              <h2 className={titleClass}>Card {index + 1} - {card.title}</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleSave(`card-${card.id}`, card); 
              }} className="flex flex-col gap-4">
                
                {/* Image Upload Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <label className={labelClass}>Card Image</label>
                  {card.image_url && (
                    <div className="mb-4">
                      <img 
                        src={card.image_url} 
                        alt={card.title} 
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
                        if (file) handleImageUpload(card.id, file);
                      }}
                      className="hidden"
                      id={`card-image-upload-${card.id}`}
                    />
                    <label 
                      htmlFor={`card-image-upload-${card.id}`}
                      className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
                    >
                      {uploading === `card-${card.id}` ? (
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
                      value={card.image_url || ''} 
                      onChange={(e) => {
                        const newCards = data?.cards?.map((c: ContentCard) => 
                          c.id === card.id ? { ...c, image_url: e.target.value } : c
                        ) || [];
                        setData((prev: any) => ({ ...prev, cards: newCards }));
                      }}
                      placeholder="Or paste image URL"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <RichTextEditor
                      label="Badge"
                      value={card.badge || ''}
                      onChange={(value) => handleRichTextChange(`card-${card.id}`, 'badge', value)}
                      placeholder="Enter badge text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>Order</label>
                    <input 
                      type="number" 
                      value={card.order || ''} 
                      onChange={(e) => {
                        const newCards = data?.cards?.map((c: ContentCard) => 
                          c.id === card.id ? { ...c, order: parseInt(e.target.value) } : c
                        ) || [];
                        setData((prev: any) => ({ ...prev, cards: newCards }));
                      }} 
                      className={inputClass} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    label="Title"
                    value={card.title || ''}
                    onChange={(value) => handleRichTextChange(`card-${card.id}`, 'title', value)}
                    placeholder="Enter card title"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Content (JSON array format)</label>
                  <textarea 
                    value={JSON.stringify(card.content, null, 2) || ''} 
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const newCards = data?.cards?.map((c: ContentCard) => 
                          c.id === card.id ? { ...c, content: parsed } : c
                        ) || [];
                        setData((prev: any) => ({ ...prev, cards: newCards }));
                      } catch (err) {
                        // Invalid JSON, just update the raw value
                      }
                    }} 
                    rows={8} 
                    className={inputClass}
                    placeholder='["Paragraph 1", "Paragraph 2", "Paragraph 3"]'
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <RichTextEditor
                      label="Button 1 Text"
                      value={card.button1_text || ''}
                      onChange={(value) => handleRichTextChange(`card-${card.id}`, 'button1_text', value)}
                      placeholder="Enter button 1 text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <RichTextEditor
                      label="Button 2 Text"
                      value={card.button2_text || ''}
                      onChange={(value) => handleRichTextChange(`card-${card.id}`, 'button2_text', value)}
                      placeholder="Enter button 2 text"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving === `card-${card.id}`} className={buttonClass}>
                    <Save size={18} />
                    {saving === `card-${card.id}` ? 'Saving...' : `Save Card ${index + 1}`}
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
