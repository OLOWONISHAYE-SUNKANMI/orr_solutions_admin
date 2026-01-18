"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface CaseExample {
  challenge: string;
  solution: string;
  result: string;
}

interface CaseExampleSectionProps {
  caseExample: CaseExample;
  imageAlt: string;
  onUpdate?: (updatedData: any) => void;
}

export default function CaseExampleSection({ caseExample, imageAlt, onUpdate }: CaseExampleSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleSave = async (content: string | RichTextData, field?: string) => {
    const contentToSave = typeof content === 'string' ? content : content.content;
    if (onUpdate) {
      const updatedData = { ...caseExample, imageAlt };
      if (field === 'challenge') updatedData.challenge = contentToSave;
      else if (field === 'solution') updatedData.solution = contentToSave;
      else if (field === 'result') updatedData.result = contentToSave;
      await onUpdate(updatedData);
    }
    console.log('Saving content:', contentToSave);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    if (cardsRef.current) observer.observe(cardsRef.current);
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-10 py-16 bg-gradient-to-br from-slate-700 to-slate-900">
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-animate {
          opacity: 0;
          transform: translateY(30px);
        }
        
        .animate-card-title {
          animation: cardTitle 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(-10px);
        }
        
        .animate-card-text {
          animation: cardText 1s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes cardTitle {
          to {
            opacity: 1;
            transform: translateY(0);
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        }
        
        @keyframes cardText {
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="relative">
          {/* Left Content */}
          <div className="max-w-3xl relative">
            <EditableText
              content="Case Example"
              onSave={(content) => handleSave(content, 'title')}
              className="text-5xl font-bold text-primary mb-6 fade-animate"
              tag="h2"
            />
          
            {/* Three Cards */}
            <div ref={cardsRef} className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6 fade-animate hover:scale-[1.02] transition-transform duration-300">
              {/* Challenge Card */}
              <div className="text-left">
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7L12 12L22 7L12 2M2 17L12 22L22 17M2 12L12 17L22 12"/>
                  </svg>
                </div>
                <EditableText
                  content="Challenge"
                  onSave={(content) => handleSave(content, 'challenge-title')}
                  className="text-lg font-bold text-gray-900 mb-3 animate-card-title"
                  tag="h3"
                />
                <EditableText
                  content={caseExample.challenge}
                  onSave={(content) => handleSave(content, 'challenge')}
                  className="text-gray-700 text-sm leading-relaxed animate-card-text"
                  tag="p"
                  multiline
                />
              </div>
              
              {/* Solution Card */}
              <div className="text-left">
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21C9 22.1 9.9 23 11 23H13C14.1 23 15 22.1 15 21V20H9V21M12 2A7 7 0 0 0 5 9C5 11.38 6.19 13.47 8 14.74V17A1 1 0 0 0 9 18H15A1 1 0 0 0 16 17V14.74C17.81 13.47 19 11.38 19 9A7 7 0 0 0 12 2Z"/>
                  </svg>
                </div>
                <EditableText
                  content="Solution"
                  onSave={(content) => handleSave(content, 'solution-title')}
                  className="text-lg font-bold text-gray-900 mb-3 animate-card-title"
                  tag="h3"
                />
                <EditableText
                  content={caseExample.solution}
                  onSave={(content) => handleSave(content, 'solution')}
                  className="text-gray-700 text-sm leading-relaxed animate-card-text"
                  tag="p"
                  multiline
                  style={{animationDelay: '0.3s'}}
                />
              </div>
              
              {/* Result Card */}
              <div className="text-left">
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L20.71 8.71L23 11V6H16Z"/>
                  </svg>
                </div>
                <EditableText
                  content="Result"
                  onSave={(content) => handleSave(content, 'result-title')}
                  className="text-lg font-bold text-gray-900 mb-3 animate-card-title"
                  tag="h3"
                />
                <EditableText
                  content={caseExample.result}
                  onSave={(content) => handleSave(content, 'result')}
                  className="text-gray-700 text-sm leading-relaxed animate-card-text"
                  tag="p"
                  multiline
                  style={{animationDelay: '0.5s'}}
                />
              </div>
            </div>
          </div>
          
          {/* Right Image - Positioned absolutely */}
          <div ref={imageRef} className="absolute top-0 right-0 w-96 h-[620px] hidden lg:block -z-10 fade-animate">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full flex items-center justify-center transform -skew-x-12">
              <Image 
                src="/team-collaboration.jpg"
                alt={imageAlt}
                className="w-full h-full object-cover rounded-xl"
                width={300}
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}