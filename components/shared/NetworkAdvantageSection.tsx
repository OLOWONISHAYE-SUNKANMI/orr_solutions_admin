"use client";
import { useEffect, useRef } from "react";
import NetworkCard from "../strategy_advisory/NetworkCard";
import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface NetworkCard {
  title: string;
  description: string;
  icon: string;
}

interface NetworkAdvantageSectionProps {
  title?: string;
  description: string;
  networkCards: NetworkCard[];
  layout?: 'grid' | 'flex';
  onUpdate?: (updatedData: any) => void;
}

export default function NetworkAdvantageSection({ 
  title = "The ORR Network Advantage", 
  description, 
  networkCards, 
  layout = 'flex',
  onUpdate
}: NetworkAdvantageSectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleSave = async (content: string | RichTextData, field?: string, index?: number) => {
    const contentToSave = typeof content === 'string' ? content : content.content;
    if (onUpdate) {
      const updatedData = { title, description, networkCards };
      if (field === 'title') {
        updatedData.title = contentToSave;
      } else if (field === 'description') {
        updatedData.description = contentToSave;
      } else if (field === 'card-title' && typeof index === 'number') {
        updatedData.networkCards[index] = { ...updatedData.networkCards[index], title: contentToSave };
      } else if (field === 'card-description' && typeof index === 'number') {
        updatedData.networkCards[index] = { ...updatedData.networkCards[index], description: contentToSave };
      }
      await onUpdate(updatedData);
    }
    console.log('Saving content:', contentToSave);
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
      { threshold: 0.2 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-16">
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.7s ease-out forwards;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide-animate {
          opacity: 0;
          transform: translateY(30px);
        }
      `}</style>
      <div ref={headerRef} className="text-center mb-16 slide-animate">
        <EditableText
          content={title}
          onSave={(content) => handleSave(content, 'title')}
          className="text-4xl font-bold text-white mb-4"
          tag="h2"
        />
        <EditableText
          content={description}
          onSave={(content) => handleSave(content, 'description')}
          className="text-slate-200 text-lg max-w-3xl mx-auto"
          tag="p"
          multiline
        />
      </div>

      <div ref={cardsRef} className="max-w-6xl mx-auto slide-animate">
        {layout === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {networkCards.slice(0, 3).map((card, index) => (
                <NetworkCard key={index} {...card} index={index} onUpdate={handleSave} />
              ))}
            </div>
            {networkCards.length > 3 && (
              <div className="flex justify-center">
                <NetworkCard {...networkCards[3]} index={3} onUpdate={handleSave} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {networkCards.map((card, index) => (
              <NetworkCard key={index} {...card} index={index} onUpdate={handleSave} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}