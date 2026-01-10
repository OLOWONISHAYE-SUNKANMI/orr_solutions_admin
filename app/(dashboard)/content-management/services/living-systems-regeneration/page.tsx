"use client";
import { useEffect, useRef, useState } from "react";
import WhatWeOfferSection from "@/components/shared/WhatWeOfferSection";
import HowWeWorkSection from "@/components/shared/HowWeWorkSection";
import NetworkAdvantageSection from "@/components/shared/NetworkAdvantageSection";
import DigitalSolutionsSection from "@/components/shared/DigitalSolutionsSection";
import CaseExampleSection from "@/components/shared/CaseExampleSection";
import EditableText from "@/components/EditableText";

interface LivingSystemsContent {
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
  process_step_1: string;
  process_step_2: string;
  process_step_3: string;
  case_challenge: string;
  case_solution: string;
  case_result: string;
  case_image_alt: string;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
}

export default function LivingSystemsPage() {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [content, setContent] = useState<LivingSystemsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/cms/living-systems/');
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const updateContent = async (field: string, value: string) => {
    try {
      const response = await fetch('https://orr-backend-web-latest.onrender.com/admin-portal/v1/cms/living-systems/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
      
      if (response.ok) {
        setContent(prev => prev ? { ...prev, [field]: value } : null);
      }
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

  const updateOffer = (index: number, field: string, value: string) => {
    const fieldMap = {
      0: { title: 'service_1_title', description: 'service_1_description' },
      1: { title: 'service_2_title', description: 'service_2_description' },
      2: { title: 'service_3_title', description: 'service_3_description' }
    };
    const backendField = fieldMap[index as keyof typeof fieldMap]?.[field as keyof typeof fieldMap[0]];
    if (backendField) {
      updateContent(backendField, value);
    }
  };

  const updateHowWeWork = async (updatedData: any) => {
    if (updatedData.subtitle) await updateContent('process_title', updatedData.subtitle);
    if (updatedData.description) await updateContent('process_description', updatedData.description);
    if (updatedData.sections) {
      for (let index = 0; index < updatedData.sections.length; index++) {
        const section = updatedData.sections[index];
        if (section.content?.[0]) {
          await updateContent(`process_step_${index + 1}`, section.content[0]);
        }
      }
    }
  };

  const updateCaseExample = (updatedData: any) => {
    if (updatedData.challenge) updateContent('case_challenge', updatedData.challenge);
    if (updatedData.solution) updateContent('case_solution', updatedData.solution);
    if (updatedData.result) updateContent('case_result', updatedData.result);
    if (updatedData.imageAlt) updateContent('case_image_alt', updatedData.imageAlt);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative overflow-hidden bg-background z-10">
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .section-animate {
          opacity: 1;
          transform: translateY(0);
          position: relative;
          z-index: 10;
        }
      `}</style>
      <div ref={el => { sectionsRef.current[0] = el; }} className="section-animate">
        <header className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
          <div className="max-w-6xl space-y-6 sm:space-y-8">
            <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              <EditableText
                content={content.hero_title}
                onSave={(value) => updateContent('hero_title', value)}
                className="text-[#47ff4c]"
                tag="span"
              />
            </h1>

            <div className="space-y-4 max-w-4xl">
              <EditableText
                content={content.hero_subtitle}
                onSave={(value) => updateContent('hero_subtitle', value)}
                className="text-slate-200 text-base sm:text-lg md:text-xl leading-relaxed"
                tag="p"
                multiline
              />

              <EditableText
                content={content.hero_description}
                onSave={(value) => updateContent('hero_description', value)}
                className="text-slate-200 text-base sm:text-lg md:text-xl leading-relaxed"
                tag="p"
                multiline
              />
            </div>
          </div>
        </header>
      </div>
      <div ref={el => { sectionsRef.current[1] = el; }} className="section-animate">
        <WhatWeOfferSection 
          title={content.services_title}
          offers={[
            {
              title: content.service_1_title,
              description: content.service_1_description,
              icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7.5 13.5 12.5 13.5 15.5 13.5C15.5 13.5 16 13.75 16 14.25C16 14.75 15.5 15 15.5 15C12.5 15 7.5 15 3.75 18.75C3.75 18.75 5.25 20.5 8 20.5C11.5 20.5 17 16 17 8Z"
            },
            {
              title: content.service_2_title,
              description: content.service_2_description,
              icon: "M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
            },
            {
              title: content.service_3_title,
              description: content.service_3_description,
              icon: "M6.05 8.05C6.05 6.05 7.86 4.05 10.92 4.05S15.8 6.05 15.95 8.05C16.05 8.05 16.05 8.05 16.05 8.05C18.05 8.05 19.95 9.76 19.95 12.05S18.05 16.05 16.05 16.05H6.05C3.76 16.05 2.05 14.05 2.05 12.05S3.76 8.05 6.05 8.05M14.95 11.05L11.95 8.05L8.95 11.05H11.05V14.05H12.95V11.05H14.95Z"
            }
          ]}
          onUpdateOffer={updateOffer}
          onUpdateTitle={(title) => updateContent('services_title', title)}
        />
      </div>
      <div ref={el => { sectionsRef.current[2] = el; }} className="section-animate">
        <HowWeWorkSection
          subtitle={content.process_title}
          description={content.process_description}
          sections={[
            {
              title: "Listen & Report (Site & System Discovery)",
              content: [content.process_step_1]
            },
            {
              title: "Decide: Document or Partnership",
              content: [content.process_step_2]
            },
            {
              title: "Steward & Evolve (For Clients Who Continue)",
              content: [content.process_step_3]
            }
          ]}
          layout="grid"
          onUpdate={updateHowWeWork}
        />
      </div>
      <div ref={el => { sectionsRef.current[5] = el; }} className="section-animate">
        <CaseExampleSection
          caseExample={{
            challenge: content.case_challenge,
            solution: content.case_solution,
            result: content.case_result
          }}
          imageAlt={content.case_image_alt}
          onUpdate={updateCaseExample}
        />
      </div>
      <div ref={el => { sectionsRef.current[6] = el; }} className="section-animate">
        <section className="relative z-10 py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
            <EditableText
              content={content.cta_title}
              onSave={(value) => updateContent('cta_title', value)}
              className="text-4xl md:text-5xl font-bold text-white mb-8"
              tag="h2"
            />
            <EditableText
              content={content.cta_description}
              onSave={(value) => updateContent('cta_description', value)}
              className="text-slate-200 text-lg mb-12 max-w-3xl mx-auto"
              tag="p"
              multiline
            />
            <button className="bg-gradient-to-r from-[#47ff4c] to-[#0ec277] text-black px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-[#47ff4c]/25 transition-all duration-300 inline-block">
              <EditableText
                content={content.cta_button_text}
                onSave={(value) => updateContent('cta_button_text', value)}
                className=""
                tag="span"
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}