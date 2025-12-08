"use client";

import { useState, useEffect } from 'react';
import { cmsAPI } from '../../services/api';
import { useAuthStore } from '../../../lib/hooks/auth';
import EditableText from '../../components/cms/EditableText';
import EditableImage from '../../components/cms/EditableImage';
import Image from 'next/image';

export default function ContentManagement() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<any>(null);
  const [openFAQ, setOpenFAQ] = useState(0);
  
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  const canEdit = isAuthenticated && userRole && (userRole.permissions?.can_create_content || userRole.user?.is_superuser || userRole.role?.name === 'content_editor');

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        try {
          // Fetch all content using the same endpoint as orr_frontend
          const endpoint = `https://orr-backend-web-latest.onrender.com/admin-portal/v1/cms/all-content/`;
          console.log('🏠 Admin CMS fetching data from endpoint:', endpoint);
          
          const [roleData, allContentResponse] = await Promise.all([
            cmsAPI.getUserRole(),
            fetch(endpoint)
          ]);
          
          if (!allContentResponse.ok) {
            throw new Error('Failed to fetch all content');
          }
          
          const allContentResult = await allContentResponse.json();
          console.log('📊 Admin CMS all content received:', allContentResult);
          
          const allContentData = allContentResult.data || allContentResult;
          console.log('✅ Admin CMS final processed data:', allContentData);
          
          setUserRole(roleData.data || roleData);
          setContent({
            homepage: allContentData.homepage,
            approachSection: allContentData.approach_section,
            businessSystemSection: allContentData.business_system_section,
            orrRoleSection: allContentData.orr_role_section,
            messageStrip: allContentData.message_strip,
            processSection: allContentData.process_section,
            orrReportSection: allContentData.orr_report_section,
            faqs: allContentData.faqs || []
          });
        } catch (error) {
          console.error('Failed to fetch content:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!canEdit && !loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          You need to be logged in as a content editor to access this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B2E4E]">
        <div className="text-white text-xl">Loading homepage...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B2E4E]">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Hero Section */}
      <header className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-5xl space-y-6 sm:space-y-8">
            <EditableText
              content={content?.homepage?.hero_title || "ORR Solutions – Listen. Solve. Optimise."}
              onSave={async (newTitle) => {
                  await cmsAPI.updateContent('homepage', { hero_title: newTitle });
                  setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_title: newTitle } }));
                }}
              tag="h1"
              className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl leading-tight"
              placeholder="Enter hero title..."
            />

            <EditableText
              content={content?.homepage?.hero_subtitle || "Your business GP for complex systems — digital and living."}
              onSave={async (newSubtitle) => {
                  await cmsAPI.updateContent('homepage', { hero_subtitle: newSubtitle });
                  setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_subtitle: newSubtitle } }));
                }}
              tag="p"
              className="text-slate-200 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed"
              placeholder="Enter hero subtitle..."
              multiline
            />

            <div className="pt-2">
              <a href="/contact" className="inline-block bg-gradient-primary text-[#0C294D] font-semibold px-4 sm:px-6 md:px-7 py-3 sm:py-4 rounded-lg shadow-md hover:brightness-105 transition text-sm sm:text-base md:text-lg">
                <EditableText
                  content={content?.homepage?.hero_cta_text || "Book your free initial consultation"}
                  onSave={async (newCTA) => {
                    await cmsAPI.updateContent('homepage', { hero_cta_text: newCTA });
                    setContent((prev: any) => ({ ...prev, homepage: { ...prev.homepage, hero_cta_text: newCTA } }));
                  }}
                  tag="span"
                  className=""
                  placeholder="Enter CTA text..."
                />
              </a>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden>
          </div>
        </div>
      </header>

      {/* Approach Section */}
      <section className="relative w-full flex flex-col items-start pr-4 py-20 bg-cover bg-center">
        <EditableText
          content={content?.approachSection?.title || "Supporting Copy"}
          onSave={async (newTitle) => {
            await cmsAPI.updateContent('approach-section', { title: newTitle });
            setContent((prev: any) => ({ ...prev, approachSection: { ...prev.approachSection, title: newTitle } }));
          }}
          tag="h2"
          className="text-white text-3xl md:text-5xl font-semibold text-center mb-10 font-poppins w-full flex justify-center py-7"
          placeholder="Enter section title..."
        />

        <div className="relative">
          <img
            src="/images/curl.svg"
            alt="glow"
            className="absolute -bottom-120 -right-30 w-[40rem] opacity-90 pointer-events-none select-none z-[-5]"
          />
        
          <div className="w-full max-w-7xl ml-0 bg border-t-[0.5rem] border-r-[0.5rem] border-b-[0.5rem] border-l-0 border-white/20 backdrop-blur-md bg-card z-1 rounded-tr-[91.25px] rounded-br-[91.25px] p-10 md:p-14 shadow-lg space-y-7">
            <div className="absolute right-[-28px] top-[20%] w-14 h-14 bg-[#0B2E4E] rounded-full flex items-center justify-center shadow-[0_0_25px_#3DFF7C]">
              <div className="w-9 h-9 bg-[#3DFF7C] rounded-full" />
            </div>
            <div className="absolute right-[-28px] bottom-[20%] w-14 h-14 bg-[#0B2E4E] rounded-full flex items-center justify-center shadow-[0_0_25px_#3DFF7C]">
              <div className="w-9 h-9 bg-[#3DFF7C] rounded-full" />
            </div>

            <EditableText
              content={content?.approachSection?.paragraph_1 || "Just like a skilled general practitioner, we start from your story not our framework."}
              onSave={async (newText) => {
                await cmsAPI.updateContent('approach-section', { paragraph_1: newText });
                setContent((prev: any) => ({ ...prev, approachSection: { ...prev.approachSection, paragraph_1: newText } }));
              }}
              tag="p"
              className="text-white/90 leading-relaxed text-[25px] font-poppins mb-10"
              placeholder="Enter first paragraph..."
              multiline
            />

            <div className="w-full h-[2px] bg-[#3DFF7C] mb-10" />

            <EditableText
              content={content?.approachSection?.paragraph_2 || "We're not a lone consultant — we're a central coordination layer with a distributed network behind it."}
              onSave={async (newText) => {
                await cmsAPI.updateContent('approach-section', { paragraph_2: newText });
                setContent((prev: any) => ({ ...prev, approachSection: { ...prev.approachSection, paragraph_2: newText } }));
              }}
              tag="p"
              className="text-white/90 leading-relaxed text-[25px] font-poppins mb-10"
              placeholder="Enter second paragraph..."
              multiline
            />

            <div className="w-full h-[2px] bg-[#3DFF7C] mb-10" />

            <EditableText
              content={content?.approachSection?.paragraph_3 || "We fix what's slowing you down, strengthen systems around how your people actually work."}
              onSave={async (newText) => {
                await cmsAPI.updateContent('approach-section', { paragraph_3: newText });
                setContent((prev: any) => ({ ...prev, approachSection: { ...prev.approachSection, paragraph_3: newText } }));
              }}
              tag="p"
              className="text-white/90 leading-relaxed text-[25px] font-poppins"
              placeholder="Enter third paragraph..."
              multiline
            />
          </div>
        </div>
      </section>

      {/* Business System Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/stars.png')] bg-cover opacity-8 pointer-events-none" />

        <div className="relative z-10 text-center mb-16 sm:mb-20 lg:mb-36">
          <EditableText
            content={content?.businessSystemSection?.title || "Businesses as a Living System"}
            onSave={async (newTitle) => {
              await cmsAPI.updateContent('business-system-section', { title: newTitle });
              setContent((prev: any) => ({ ...prev, businessSystemSection: { ...prev.businessSystemSection, title: newTitle } }));
            }}
            tag="h2"
            className="text-white text-4xl font-poppins sm:text-2xl md:text-3xl lg:text-5xl font-extrabold leading-snug"
            placeholder="Enter section title..."
          />
          <EditableText
            content={content?.businessSystemSection?.subtitle || "Think of your organisation like a body"}
            onSave={async (newSubtitle) => {
              await cmsAPI.updateContent('business-system-section', { subtitle: newSubtitle });
              setContent((prev: any) => ({ ...prev, businessSystemSection: { ...prev.businessSystemSection, subtitle: newSubtitle } }));
            }}
            tag="p"
            className="text-white font-poppins font-light text-[15px] sm:text-xl md:text-2xl mt-2"
            placeholder="Enter section subtitle..."
          />
        </div>

        {/* Cards in pairs like orr_frontend */}
        {Array.from({ length: Math.ceil(3 / 2) }, (_, pairIndex) => {
          const startIndex = pairIndex * 2;
          const cardNumbers = [1, 2, 3].slice(startIndex, startIndex + 2);
          
          return (
            <div key={pairIndex} className="relative z-10 w-full max-w-none mx-auto flex flex-col lg:flex-row justify-center lg:justify-between items-center lg:items-start mb-8 sm:mb-16 lg:mb-28 gap-6 lg:gap-4 lg:w-screen lg:left-1/2 lg:-translate-x-1/2 lg:px-0">
              {cardNumbers.map((cardNum, index) => (
                <div key={cardNum} className={`w-full max-w-xl lg:max-w-4xl bg-card ${index === 0 ? 'lg:rounded-tr-[4rem] lg:rounded-br-[4rem]' : 'lg:rounded-tl-[4rem] lg:rounded-bl-[4rem]'} overflow-hidden shadow-lg`}>
                  <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[450px] group">
                    <EditableImage
                      src={content?.businessSystemSection?.[`card_${cardNum}_image`] || ''}
                      alt={`Card ${cardNum}`}
                      onSave={async (newImageUrl) => {
                        const fieldName = `card_${cardNum}_image`;
                        await cmsAPI.updateContent('business-system-section', { [fieldName]: newImageUrl });
                        setContent((prev: any) => ({ 
                          ...prev, 
                          businessSystemSection: { 
                            ...prev.businessSystemSection, 
                            [fieldName]: newImageUrl 
                          } 
                        }));
                      }}
                      className="w-full h-full object-cover"
                      fill
                    />
                  </div>

                  <div className="p-4 sm:p-6 lg:p-5 text-[#8EFFD0] text-[30px] font-poppins font-semibold sm:text-base lg:text-3xl tracking-wide">
                    <EditableText
                      content={content?.businessSystemSection?.[`card_${cardNum}_title`] || `Card ${cardNum} Title`}
                      onSave={async (newTitle) => {
                        const fieldName = `card_${cardNum}_title`;
                        await cmsAPI.updateContent('business-system-section', { [fieldName]: newTitle });
                        setContent((prev: any) => ({ 
                          ...prev, 
                          businessSystemSection: { 
                            ...prev.businessSystemSection, 
                            [fieldName]: newTitle 
                          } 
                        }));
                      }}
                      tag="span"
                      className=""
                      placeholder="Enter card title..."
                    />
                  </div>
                  <div className="px-4 sm:px-6 lg:p-5 pb-4 sm:pb-6 lg:pb-5">
                    <EditableText
                      content={content?.businessSystemSection?.[`card_${cardNum}_description`] || `Card ${cardNum} description`}
                      onSave={async (newDesc) => {
                        const fieldName = `card_${cardNum}_description`;
                        await cmsAPI.updateContent('business-system-section', { [fieldName]: newDesc });
                        setContent((prev: any) => ({ 
                          ...prev, 
                          businessSystemSection: { 
                            ...prev.businessSystemSection, 
                            [fieldName]: newDesc 
                          } 
                        }));
                      }}
                      tag="p"
                      className="text-white text-sm font-poppins font-light sm:text-base lg:text-sm"
                      placeholder="Enter card description..."
                      multiline
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* ORR Role Section */}
      <section className="w-full h-[60vh] flex justify-center items-center text-white px-6 md:px-12 lg:px-24 py-24 relative overflow-hidden font-poppins">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <EditableText
            content={content?.orrRoleSection?.title || "ORR's Role"}
            onSave={async (newTitle) => {
              await cmsAPI.updateContent('orr-role-section', { title: newTitle });
              setContent((prev: any) => ({ ...prev, orrRoleSection: { ...prev.orrRoleSection, title: newTitle } }));
            }}
            tag="h2"
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            placeholder="Enter section title..."
          />
          <EditableText
            content={content?.orrRoleSection?.description || "We act like specialist doctors for your business physiology - but we start from your symptoms and your priorities. We check the health of your system, diagnosis issues, and co-design solutions that your people can actually use, keeping everything working together over time."}
            onSave={async (newDesc) => {
              await cmsAPI.updateContent('orr-role-section', { description: newDesc });
              setContent((prev: any) => ({ ...prev, orrRoleSection: { ...prev.orrRoleSection, description: newDesc } }));
            }}
            tag="p"
            className="text-gray-300 text-center text-2xl mb-16 max-w-4xl mx-auto"
            placeholder="Enter section description..."
            multiline
          />
        </div> 
      </section>

      {/* Message Strip */}
      <section className="w-full text-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden font-poppins">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <EditableText
            content={content?.messageStrip?.title || "Message Strip"}
            onSave={async (newTitle) => {
              await cmsAPI.updateContent('message-strip', { title: newTitle });
              setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, title: newTitle } }));
            }}
            tag="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10"
            placeholder="Enter section title..."
          />

          <div className="absolute top-16 sm:top-20 w-60 h-60 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-[#33FF99]/20 rounded-full blur-[100px] sm:blur-[150px]"></div>

          <div className="relative bg-card max-w-3xl w-full py-6 sm:py-8 md:py-10 px-6 sm:px-8 md:px-12 rounded-[20px] sm:rounded-[30px] shadow-xl border border-white/20">
            <div className="text-[#33FF99] text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 text-left">"</div>
            <EditableText
              content={content?.messageStrip?.message || "Businesses thrive like living organisms when all their systems work together *around real human needs*. ORR keeps your 'business physiology' in peak condition — aligning operations, communication, cash flow, compliance, data, and projects around the people you serve"}
              onSave={async (newMessage) => {
                await cmsAPI.updateContent('message-strip', { message: newMessage });
                setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, message: newMessage } }));
              }}
              tag="p"
              className="text-[#ffffff] leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-4 md:px-9"
              placeholder="Enter message..."
              multiline
            />
            <div className="text-[#33FF99] text-2xl sm:text-3xl md:text-4xl mt-3 sm:mt-4 text-right">"</div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-6">
            <span className="w-2 h-2 rounded-full bg-[#33FF99]"></span>
            <span className="w-2 h-2 rounded-full bg-[#33FF99]/40"></span>
            <span className="w-2 h-2 rounded-full bg-[#33FF99]/40"></span>
          </div>
        </div>

        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <div className="absolute left-4 xl:left-10 top-16 xl:top-20 w-20 xl:w-26 h-20 xl:h-26">
            <EditableImage
              src={content?.messageStrip?.user_image_1 || "/images/user-1.jpg"}
              alt="User 1"
              onSave={async (newImageUrl) => {
                await cmsAPI.updateContent('message-strip', { user_image_1: newImageUrl });
                setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, user_image_1: newImageUrl } }));
              }}
              className="rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
              width={80}
              height={80}
            />
          </div>
          <div className="absolute left-2 xl:left-4 top-1/2 w-16 xl:w-20 h-16 xl:h-20">
            <EditableImage
              src={content?.messageStrip?.user_image_2 || "/images/user-2.jpg"}
              alt="User 2"
              onSave={async (newImageUrl) => {
                await cmsAPI.updateContent('message-strip', { user_image_2: newImageUrl });
                setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, user_image_2: newImageUrl } }));
              }}
              className="rounded-full border-2 border-[#33FF99] shadow-[0_0_20px_#33FF99] object-cover"
              width={64}
              height={64}
            />
          </div>
          <div className="absolute left-24 xl:left-30 bottom-20 xl:bottom-24 w-24 xl:w-30 h-24 xl:h-30">
            <EditableImage
              src={content?.messageStrip?.user_image_3 || "/images/user-3.jpg"}
              alt="User 3"
              onSave={async (newImageUrl) => {
                await cmsAPI.updateContent('message-strip', { user_image_3: newImageUrl });
                setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, user_image_3: newImageUrl } }));
              }}
              className="rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
              width={96}
              height={96}
            />
          </div>
          <div className="absolute right-4 xl:right-10 top-20 xl:top-24 w-16 xl:w-20 h-16 xl:h-20">
            <EditableImage
              src={content?.messageStrip?.user_image_4 || "/images/user-4.jpg"}
              alt="User 4"
              onSave={async (newImageUrl) => {
                await cmsAPI.updateContent('message-strip', { user_image_4: newImageUrl });
                setContent((prev: any) => ({ ...prev, messageStrip: { ...prev.messageStrip, user_image_4: newImageUrl } }));
              }}
              className="rounded-full border-2 xl:border-4 border-[#33FF99] shadow-[0_0_20px_#33FF99] xl:shadow-[0_0_25px_#33FF99] object-cover"
              width={64}
              height={64}
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full text-white px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden font-poppins">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <EditableText
            content={content?.processSection?.title || "How we work: Five Stages"}
            onSave={async (newTitle) => {
              await cmsAPI.updateContent('process-section', { title: newTitle });
              setContent((prev: any) => ({ ...prev, processSection: { ...prev.processSection, title: newTitle } }));
            }}
            tag="h2"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center"
            placeholder="Enter section title..."
          />
          
          <EditableText
            content={content?.processSection?.subtitle || "Every stage is built around you – your pace, your risk appetite, your resources"}
            onSave={async (newSubtitle) => {
              await cmsAPI.updateContent('process-section', { subtitle: newSubtitle });
              setContent((prev: any) => ({ ...prev, processSection: { ...prev.processSection, subtitle: newSubtitle } }));
            }}
            tag="p"
            className="text-gray-300 text-center mb-12 sm:mb-16"
            placeholder="Enter section subtitle..."
            multiline
          />
          
          <div className="relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-[#33FF99]"></div>
            
            {[1, 2, 3, 4, 5].map((stageNum, index) => {
              const stageTitles = [
                'Discover - We listen',
                'Diagnose - We find root causes', 
                'Design - We shape solution with you',
                'Deploy - We put them to work together',
                'Grow - We optimise over time'
              ];
              const stageDescriptions = [
                'You tell us what\'s happening. We map your context, pressures, and goals – and what \'good\' looks like for you.',
                'SOPs, workflows, portals, dashboards, and AI-assisted tools designed around your team\'s habits, constraints and growth plans.',
                'We propose clear, actionable structures that fit your reality: advisory, roadmaps, systems, AI helpers, and, where relevant, living systems projects.',
                'We implement with minimal disruption, adapting to how your people work today while preparing them for tomorrow.',
                'We monitor, refine, and help you scale intelligently, keeping a feedback loop open with you and your stakeholders.'
              ];
              
              return (
                <div key={stageNum} className="relative flex items-start mb-8 sm:mb-12 last:mb-0">
                  <div className="relative z-10 w-8 sm:w-12 h-8 sm:h-12 bg-[#33FF99] rounded-full flex items-center justify-center mr-6 sm:mr-8 flex-shrink-0">
                    <div className="w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <EditableText
                      content={content?.processSection?.[`stage_${stageNum}_title`] || stageTitles[index]}
                      onSave={async (text) => {
                        const fieldName = `stage_${stageNum}_title`;
                        await cmsAPI.updateContent('process-section', { [fieldName]: text });
                        setContent((prev: any) => ({ ...prev, processSection: { ...prev.processSection, [fieldName]: text } }));
                      }}
                      tag="h3"
                      className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3"
                      placeholder="Enter stage title..."
                    />
                    <EditableText
                      content={content?.processSection?.[`stage_${stageNum}_description`] || stageDescriptions[index]}
                      onSave={async (text) => {
                        const fieldName = `stage_${stageNum}_description`;
                        await cmsAPI.updateContent('process-section', { [fieldName]: text });
                        setContent((prev: any) => ({ ...prev, processSection: { ...prev.processSection, [fieldName]: text } }));
                      }}
                      tag="p"
                      className="text-gray-300 text-sm sm:text-base leading-relaxed"
                      placeholder="Enter stage description..."
                      multiline
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ORR Report Section */}
      <section className="w-full text-white px-6 md:px-12 lg:px-24 py-24 relative overflow-hidden font-poppins">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <EditableText
            content={content?.orrReportSection?.title || "What you Get: The ORR Report"}
            onSave={async (newTitle) => {
              await cmsAPI.updateContent('orr-report-section', { title: newTitle });
              setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, title: newTitle } }));
            }}
            tag="h2"
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            placeholder="Enter section title..."
          />
          <EditableText
            content={content?.orrReportSection?.subtitle || "After your first meeting, you receive a decision-ready ORR report designed to be immediately useful inside your organisation."}
            onSave={async (newSubtitle) => {
              await cmsAPI.updateContent('orr-report-section', { subtitle: newSubtitle });
              setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, subtitle: newSubtitle } }));
            }}
            tag="p"
            className="text-gray-300 text-center mb-16 max-w-4xl mx-auto"
            placeholder="Enter section subtitle..."
            multiline
          />
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0f2a3f] rounded-3xl relative overflow-hidden h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 z-10"></div>
              <Image 
                src="/network-visualization.jpg" 
                alt="Network Visualization" 
                fill
                className="object-cover" 
              />
            </div>
            
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0f2a3f] p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_1 || "explain your situation in your language,"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_1: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_1: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_2 || "highlights key issues and risks that affect your customers and teams"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_2: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_2: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_3 || "proposes quick fixes and longer-term improvements that respect your constraints"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_3: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_3: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_4 || "shows where advisory, digital systems/AI, or living-systems work will have most impact"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_4: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_4: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0f2a3f] p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_1 || "explain your situation in your language,"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_1: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_1: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_2 || "highlights key issues and risks that affect your customers and teams"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_2: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_2: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_3 || "proposes quick fixes and longer-term improvements that respect your constraints"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_3: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_3: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-[#33FF99] rounded-full mt-1 flex-shrink-0"></div>
                  <EditableText
                    content={content?.orrReportSection?.feature_4 || "shows where advisory, digital systems/AI, or living-systems work will have most impact"}
                    onSave={async (text) => { 
                      await cmsAPI.updateContent('orr-report-section', { feature_4: text });
                      setContent((prev: any) => ({ ...prev, orrReportSection: { ...prev.orrReportSection, feature_4: text } }));
                    }}
                    tag="span"
                    className="text-gray-200"
                    placeholder="Enter feature..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0f2a3f] rounded-3xl relative overflow-hidden h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 z-10"></div>
              <Image 
                src="/team-collaboration.jpg" 
                alt="Team Collaboration" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="w-full text-white px-6 md:px-12 lg:px-24 py-24 relative overflow-hidden font-poppins">
        <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <EditableText
            content="Frequently Asked Questions"
            onSave={async (newTitle) => {
              // Handle FAQ section title update if needed
            }}
            tag="h2"
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            placeholder="Enter FAQ section title..."
          />
          
          <div className="space-y-4">
            {(() => {
              const faqs = content?.faqs || [];
              console.log('Admin CMS FAQ data:', faqs);
              return faqs.map((faq: any, index: number) => (
                <div key={faq.id || index} className={`rounded-2xl overflow-hidden border border-[#2a4a6b] ${openFAQ === index ? 'bg-primary' : 'bg-[#2a4a6b]'}`}>
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-[#2a4a6b] transition-colors"
                  >
                    <EditableText
                      content={faq.question || "FAQ Question"}
                      onSave={async (newQuestion) => {
                        await cmsAPI.updateContent(`faqs/${faq.id}`, { question: newQuestion });
                        setContent((prev: any) => ({
                          ...prev,
                          faqs: (prev?.faqs || []).map((f: any) => f.id === faq.id ? { ...f, question: newQuestion } : f)
                        }));
                      }}
                      tag="span"
                      className="text-lg font-medium"
                      placeholder="Enter FAQ question..."
                    />
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      {openFAQ === index ? (
                        <span className="w-5 h-5 text-red-500 text-xl font-bold">×</span>
                      ) : (
                        <span className="w-5 h-5 text-black text-xl font-bold">+</span>
                      )}
                    </div>
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <div className="rounded-xl p-4">
                        <EditableText
                          content={faq.answer || "FAQ Answer"}
                          onSave={async (newAnswer) => {
                            await cmsAPI.updateContent(`faqs/${faq.id}`, { answer: newAnswer });
                            setContent((prev: any) => ({
                              ...prev,
                              faqs: (prev?.faqs || []).map((f: any) => f.id === faq.id ? { ...f, answer: newAnswer } : f)
                            }));
                          }}
                          tag="p"
                          className="leading-relaxed text-white"
                          placeholder="Enter FAQ answer..."
                          multiline
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}