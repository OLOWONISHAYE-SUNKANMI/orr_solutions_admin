"use client";
import { useEffect, useRef } from "react";
import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface OfferCard {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

interface WhatWeOfferSectionProps {
  title?: string;
  offers: OfferCard[];
  layout?: 'grid' | 'flex';
  onUpdateOffer?: (index: number, field: string, value: string) => void;
  onUpdateTitle?: (title: string) => void;
}

function OfferCard({ title, description, icon, features, onUpdate, index }: OfferCard & { onUpdate: (index: number, field: string, value: string) => void, index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = (field: string) => async (content: string | RichTextData) => {
    const contentString = typeof content === 'string' ? content : content.content;
    onUpdate(index, field, contentString);
    console.log('Saving content:', contentString);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-card-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className="bg-card dark:bg-transparent rounded-lg p-6 dark:border dark:border-primary relative pt-20 flex-1 min-w-0 basis-full md:basis-[calc(50%-1.5rem)] xl:basis-[calc(33.333%-2rem)] max-w-md card-animate hover:scale-105 transition-transform duration-300"
    >
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-32 h-24 bg-card dark:bg-black flex items-center justify-center shadow-2xl border border-slate-600 dark:border-[#0ec277]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)'}}>
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d={icon}/>
        </svg>
      </div>
      <EditableText
        content={title}
        onSave={handleSave('title')}
        className="text-xl font-semibold text-white mb-3 animate-text-slide"
        tag="h3"
      />
      <EditableText
        content={description}
        onSave={handleSave('description')}
        className="text-slate-300 text-sm mb-4 animate-text-fade"
        tag="p"
        multiline
      />
      {features && (
        <ul className="text-slate-300 text-sm space-y-1">
          {features.map((feature, featureIndex) => (
            <li key={featureIndex} className="animate-text-pop" style={{animationDelay: `${featureIndex * 0.1}s`}}>
              • <EditableText
                content={feature}
                onSave={async (content: string | RichTextData) => {
                  const contentString = typeof content === 'string' ? content : content.content;
                  const newFeatures = [...features];
                  newFeatures[featureIndex] = contentString;
                  onUpdate(index, 'features', JSON.stringify(newFeatures));
                  console.log('Saving feature:', contentString);
                }}
                className="inline"
                tag="span"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function WhatWeOfferSection({ title, offers, layout = 'flex', onUpdateOffer, onUpdateTitle }: WhatWeOfferSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleTitleSave = async (content: string | RichTextData) => {
    if (onUpdateTitle) {
      const contentString = typeof content === 'string' ? content : content.content;
      onUpdateTitle(contentString);
    }
  };

  const handleOfferUpdate = (index: number, field: string, value: string) => {
    if (onUpdateOffer) {
      onUpdateOffer(index, field, value);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-title-in');
          }
        });
      },
      { threshold: 0.5 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16">
      <style jsx>{`
        .animate-title-in {
          animation: titleIn 0.8s ease-out forwards;
        }
        
        .animate-card-in {
          animation: cardIn 0.6s ease-out forwards;
        }
        
        @keyframes titleIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .card-animate {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        
        h2 {
          opacity: 0;
          transform: translateY(-20px);
        }
        
        .animate-text-slide {
          animation: textSlide 0.8s ease-out 0.3s forwards;
          opacity: 0;
          transform: translateX(-20px);
        }
        
        .animate-text-fade {
          animation: textFade 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        .animate-text-pop {
          animation: textPop 0.6s ease-out forwards;
          opacity: 0;
          transform: scale(0.8);
        }
        
        @keyframes textSlide {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes textFade {
          to {
            opacity: 1;
          }
        }
        
        @keyframes textPop {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <h2 
        ref={titleRef}
        className="text-4xl font-bold text-white text-center mb-16"
      >
        <EditableText
          content={title || "What We Offer"}
          onSave={handleTitleSave}
          className="text-[#47ff4c] inline"
          tag="span"
        />
      </h2>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-32 mb-24">
          {offers.map((offer, index) => (
            <OfferCard key={index} {...offer} onUpdate={handleOfferUpdate} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}