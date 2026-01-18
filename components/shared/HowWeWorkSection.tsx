"use client";
import { useEffect, useRef } from "react";
import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface HowWeWorkSectionProps {
  subtitle: string;
  description: string;
  sections: {
    title: string;
    subtitle?: string;
    content: string[];
  }[];
  layout?: 'grid' | 'single';
  onUpdate?: (updatedData: any) => void;
}

export default function HowWeWorkSection({ subtitle, description, sections, layout = 'grid', onUpdate }: HowWeWorkSectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = async (content: string | RichTextData, field?: string, index?: number) => {
    const contentToSave = typeof content === 'string' ? content : content.content;
    if (onUpdate) {
      // Update the data and call onUpdate
      const updatedData = { subtitle, description, sections };
      if (field === 'title') {
        // Handle title updates - this is just for the "How we work:" text
        console.log('Title updated:', contentToSave);
      } else if (field === 'subtitle') {
        updatedData.subtitle = contentToSave;
      } else if (field === 'description') {
        updatedData.description = contentToSave;
      } else if (field === 'section-title' && typeof index === 'number') {
        updatedData.sections[index].title = contentToSave;
      } else if (field === 'section-content' && typeof index === 'number') {
        const [sectionIndex, contentIndex] = index.toString().split('-').map(Number);
        updatedData.sections[sectionIndex].content[contentIndex] = contentToSave;
      }
      await onUpdate(updatedData);
    }
    console.log('Saving content:', contentToSave);
  };

  const handleSectionContentSave = async (content: string | RichTextData, sectionIndex: number, contentIndex: number) => {
    const contentToSave = typeof content === 'string' ? content : content.content;
    if (onUpdate) {
      const updatedData = { subtitle, description, sections: [...sections] };
      updatedData.sections[sectionIndex].content[contentIndex] = contentToSave;
      await onUpdate(updatedData);
    }
    console.log('Saving section content:', contentToSave);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen bg-[#0A1B2E] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16">
      <style jsx>{`
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-animate {
          opacity: 0;
          transform: translateY(40px);
        }
        
        .animate-title-glow {
          animation: titleGlow 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        .animate-subtitle-slide {
          animation: subtitleSlide 0.8s ease-out 0.7s forwards;
          opacity: 0;
          transform: translateX(-30px);
        }
        
        .animate-paragraph-fade {
          animation: paragraphFade 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        @keyframes titleGlow {
          to {
            opacity: 1;
            text-shadow: 0 0 20px rgba(71, 255, 76, 0.3);
          }
        }
        
        @keyframes subtitleSlide {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes paragraphFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <div ref={headerRef} className="text-center mb-16 fade-animate">
          <EditableText
            content="How we work:"
            onSave={(content) => handleSave(content, 'title')}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            tag="h2"
          />
          <EditableText
            content={subtitle}
            onSave={(content) => handleSave(content, 'subtitle')}
            className="text-3xl md:text-4xl font-bold text-[#47ff4c]"
            tag="h3"
          />
          <EditableText
            content={description}
            onSave={(content) => handleSave(content, 'description')}
            className="text-white text-lg mt-6 max-w-4xl mx-auto leading-relaxed"
            tag="p"
            multiline
          />
        </div>

        <div ref={contentRef} className="max-w-7xl mx-auto fade-animate">
          <div className="bg-gradient-to-br from-[#2A4A6B] to-[#1E3A5F] rounded-3xl p-1 hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-[#1E3A5F]/90 rounded-3xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-6 lg:gap-8">
                {/* Listen & Report - spans full left side */}
                <div className="lg:row-span-2 bg-[#1E3A5F]/60 p-8 lg:border-r border-[#47ff4c]/30 lg:mr-4">
                  <EditableText
                    content={sections[0]?.title || ''}
                    onSave={(content) => handleSave(content, 'section-title', 0)}
                    className="text-2xl lg:text-3xl font-bold text-white mb-6 animate-title-glow"
                    tag="h3"
                  />
                  {sections[0]?.subtitle && (
                    <EditableText
                      content={sections[0].subtitle}
                      onSave={(content) => handleSave(content, 'section-subtitle', 0)}
                      className="text-gray-300 text-lg font-semibold mb-6 animate-subtitle-slide"
                      tag="h4"
                    />
                  )}
                  <div className="space-y-4 text-gray-300 leading-relaxed">
                    {sections[0]?.content.map((paragraph, pIndex) => (
                      <EditableText
                        key={pIndex}
                        content={paragraph}
                        onSave={(content) => handleSectionContentSave(content, 0, pIndex)}
                        className="animate-paragraph-fade"
                        tag="p"
                        multiline
                      />
                    ))}
                  </div>
                </div>
                
                {/* Decide section - top right */}
                {sections[1] && (
                  <div className="bg-[#1E3A5F]/60 rounded-2xl p-8">
                    <EditableText
                      content={sections[1]?.title || ''}
                      onSave={(content) => handleSave(content, 'section-title', 1)}
                      className="text-2xl lg:text-3xl font-bold text-white mb-6 animate-title-glow"
                      tag="h3"
                    />
                    {sections[1]?.subtitle && (
                      <EditableText
                        content={sections[1].subtitle}
                        onSave={(content) => handleSave(content, 'section-subtitle', 1)}
                        className="text-gray-300 text-lg font-semibold mb-6 animate-subtitle-slide"
                        tag="h4"
                      />
                    )}
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      {sections[1]?.content.map((paragraph, pIndex) => (
                        <EditableText
                          key={pIndex}
                          content={paragraph}
                          onSave={(content) => handleSectionContentSave(content, 1, pIndex)}
                          className="animate-paragraph-fade"
                          tag="p"
                          multiline
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Optimize section - bottom right */}
                {sections[2] && (
                  <div className="bg-[#1E3A5F]/60 rounded-2xl p-8 ">
                    <EditableText
                      content={sections[2]?.title || ''}
                      onSave={(content) => handleSave(content, 'section-title', 2)}
                      className="text-2xl lg:text-3xl font-bold text-white mb-6 animate-title-glow"
                      tag="h3"
                    />
                    {sections[2]?.subtitle && (
                      <EditableText
                        content={sections[2].subtitle}
                        onSave={(content) => handleSave(content, 'section-subtitle', 2)}
                        className="text-gray-300 text-lg font-semibold mb-6 animate-subtitle-slide"
                        tag="h4"
                      />
                    )}
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      {sections[2]?.content.map((paragraph, pIndex) => (
                        <EditableText
                          key={pIndex}
                          content={paragraph}
                          onSave={(content) => handleSectionContentSave(content, 2, pIndex)}
                          className="animate-paragraph-fade"
                          tag="p"
                          multiline
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}