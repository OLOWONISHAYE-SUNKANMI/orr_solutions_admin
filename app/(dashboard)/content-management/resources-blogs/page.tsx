"use client";

import { useRef, useState, useEffect } from "react";
import { useScrollSplit } from "@/hooks/useScrollSplit";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EditableText from '../../../components/cms/EditableText';
import { CMSService } from '../../../../lib/cms-api';

gsap.registerPlugin(ScrollTrigger);

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
  useScrollSplit();
  const [data, setData] = useState<ResourcesBlogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const cmsService = new CMSService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Resources & Blogs data from backend...');
        const response = await cmsService.getResourcesBlogsPageContent();
        console.log('✅ Resources & Blogs API Response:', response);
        setData(response);
      } catch (error) {
        console.error('❌ Error fetching Resources & Blogs data:', error);
        // Fallback to default data if API fails
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

  const handleSave = async (field: string, value: string, type: 'page' | 'card' = 'page', cardId?: number) => {
    if (!data) return;
    
    try {
      if (type === 'page') {
        const updateData = { page: { [field]: value } };
        
        await cmsService.updateResourcesBlogsPageContent(updateData);
        setData({ ...data, page: { ...data.page, [field]: value } });
      } else if (type === 'card' && cardId) {
        const updateData = { [field]: value };
        
        await cmsService.updateContentCard(cardId, updateData);
        setData({
          ...data,
          cards: data.cards.map(card => 
            card.id === cardId ? { ...card, [field]: value } : card
          )
        });
      }
      console.log('✅ Saved:', field, value);
    } catch (error) {
      console.error('❌ Error saving:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-white text-xl">Error loading content</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-card rounded-lg p-4 shadow-lg">
          <h3 className="text-white font-semibold mb-3">Content Sections</h3>
          <div className="space-y-2">
            <a href="/content-management/how-we-operate" className="block text-[#33FF99] hover:text-white transition-colors text-sm">
              How We Operate
            </a>
            <div className="relative group">
              <a href="/content-management/services" className="block text-[#33FF99] hover:text-white transition-colors text-sm cursor-pointer">
                Services ▼
              </a>
              <div className="absolute left-0 top-6 bg-[#1a3a52] rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                <a href="/content-management/services/living-systems-regeneration" className="block text-gray-300 hover:text-[#33FF99] transition-colors text-xs py-1">
                  Living Systems Regeneration
                </a>
                <a href="/content-management/services/operational-systems-infrastructure" className="block text-gray-300 hover:text-[#33FF99] transition-colors text-xs py-1">
                  Operational Systems Infrastructure
                </a>
                <a href="/content-management/services/strategy-advisory-compliant" className="block text-gray-300 hover:text-[#33FF99] transition-colors text-xs py-1">
                  Strategy Advisory Compliant
                </a>
              </div>
            </div>
            <a href="/content-management/resources-blogs" className="block text-[#33FF99] hover:text-white transition-colors text-sm">
              Resources & Blogs
            </a>
            <a href="/content-management/legal-policy" className="block text-[#33FF99] hover:text-white transition-colors text-sm">
              Legal & Policy
            </a>
            <a href="/content-management/contact" className="block text-[#33FF99] hover:text-white transition-colors text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>
      <HeroSection data={data} onSave={handleSave} />
      <div className="scroll-section"><ContentSection data={data} onSave={(field, value, cardId) => handleSave(field, value, 'card', cardId)} /></div>
    </div>
  );
}

function HeroSection({ data, onSave }: { data: ResourcesBlogsData; onSave: (field: string, value: string) => Promise<void> }) {
  const titleRef = useRef(null);
  const p1Ref = useRef(null);
  const p2Ref = useRef(null);
  const p3Ref = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(titleRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo(p1Ref.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: "power2.out" });
    gsap.fromTo(p2Ref.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: "power2.out" });
    gsap.fromTo(p3Ref.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.7, ease: "power2.out" });
    gsap.fromTo(buttonsRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.9, ease: "back.out(1.7)" });
  }, []);

  return (
    <section className="relative px-6 my-20 md:px-16 py-20 min-h-screen flex flex-col items-start justify-center">
      <EditableText
        content={data.page.hero_title}
        onSave={(newText) => onSave('hero_title', newText)}
        tag="h1"
        className="text-4xl md:text-6xl font-bold mb-6"
        placeholder="Enter title..."
      />

      <EditableText
        content={data.page.hero_description1}
        onSave={(newText) => onSave('hero_description1', newText)}
        tag="p"
        className="max-w-2xl text-gray-300 text-lg mb-8 leading-relaxed"
        placeholder="Enter description..."
        multiline
      />

      <EditableText
        content={data.page.hero_description2}
        onSave={(newText) => onSave('hero_description2', newText)}
        tag="p"
        className="max-w-3xl text-gray-300 mb-12 leading-relaxed"
        placeholder="Enter description..."
        multiline
      />

      <EditableText
        content={data.page.hero_description3}
        onSave={(newText) => onSave('hero_description3', newText)}
        tag="p"
        className="max-w-3xl text-gray-300 mb-12 leading-relaxed"
        placeholder="Enter description..."
        multiline
      />

      <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-green-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-green-300 transition-colors">
          <EditableText
            content={data.page.hero_button1_text}
            onSave={(newText) => onSave('hero_button1_text', newText)}
            tag="span"
            className=""
            placeholder="Enter button text..."
          />
        </button>
        <button className="border border-green-400 text-green-400 px-8 py-3 rounded-full font-semibold hover:bg-green-400 hover:text-black transition-colors">
          <EditableText
            content={data.page.hero_button2_text}
            onSave={(newText) => onSave('hero_button2_text', newText)}
            tag="span"
            className=""
            placeholder="Enter button text..."
          />
        </button>
      </div>
    </section>
  );
}

function ContentSection({ data, onSave }: { data: ResourcesBlogsData; onSave: (field: string, value: string, cardId: number) => Promise<void> }) {
  return (
    <section className="px-6 md:px-16 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {data.cards.slice(0, 2).map((card, index) => (
          <ContentCard
            key={card.id}
            card={card}
            onSave={(field, value) => onSave(field, value, card.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-8">
        {data.cards.slice(2, 4).map((card, index) => (
          <ContentCard
            key={card.id}
            card={card}
            onSave={(field, value) => onSave(field, value, card.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ContentCard({ card, onSave }: {
  card: ContentCard;
  onSave: (field: string, value: string) => Promise<void>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(cardRef.current,
      { opacity: 0, rotateY: -15, x: -50 },
      {
        opacity: 1,
        rotateY: 0,
        x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          end: "top 15%",
          toggleActions: "play reverse play reverse"
        }
      }
    );
  }, []);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={`bg-[#1A2B3D] rounded-3xl p-6 border border-gray-700/30 cursor-pointer transition-all duration-300 ${isExpanded ? 'bg-[#1F3247]' : 'hover:bg-[#1A2B3D]/80'
        }`}
    >
      <div className="mb-6">
        <img
          src={card.image_url}
          alt={card.title}
          className="w-full h-48 object-cover rounded-2xl"
        />
      </div>

      <div className="mb-4">
        <EditableText
          content={card.badge}
          onSave={(newText) => onSave('badge', newText)}
          tag="span"
          className="bg-green-400 text-black text-xs font-semibold px-3 py-1 rounded-full"
          placeholder="Enter badge..."
        />
      </div>

      <EditableText
        content={card.title}
        onSave={(newText) => onSave('title', newText)}
        tag="h3"
        className="text-xl font-bold mb-6"
        placeholder="Enter title..."
      />

      <div className="text-gray-300 text-sm leading-relaxed">
        {!isExpanded ? (
          <div>
            <EditableText
              content={Array.isArray(card.content) ? card.content.slice(0, 2).join(' ') : card.content}
              onSave={(newText) => onSave('content', JSON.stringify([newText]))}
              tag="p"
              className="line-clamp-3"
              placeholder="Enter content preview..."
              multiline
            />
            <EditableText
              content="..."
              onSave={async (newText) => { console.log('Saved ellipsis:', newText); }}
              tag="p"
              className="text-gray-400 mt-2"
              placeholder="..."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {(Array.isArray(card.content) ? card.content : [card.content]).map((item, index) => (
              <EditableText
                key={index}
                content={item}
                onSave={async (newText) => {
                  const newContent = Array.isArray(card.content) ? [...card.content] : [card.content];
                  newContent[index] = newText;
                  await onSave('content', JSON.stringify(newContent));
                }}
                tag="p"
                className=""
                placeholder="Enter content..."
                multiline
              />
            ))}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3 mt-6">
          {[card.button1_text, card.button2_text].filter(Boolean).map((button, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${index === 0
                  ? 'bg-green-400 text-black hover:bg-green-300'
                  : 'border border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                }`}
            >
              <EditableText
                content={button || ''}
                onSave={(newText) => onSave(index === 0 ? 'button1_text' : 'button2_text', newText)}
                tag="span"
                className=""
                placeholder="Enter button text..."
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}