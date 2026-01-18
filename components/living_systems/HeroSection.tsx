import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export default function LivingSystemsHeroSection() {
  const handleSave = async (content: string | RichTextData) => {
    // TODO: Implement API call to save content
    const contentToSave = typeof content === 'string' ? content : content.content;
    console.log('Saving content:', contentToSave);
  };

  return (
    <header className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="max-w-6xl space-y-6 sm:space-y-8">
        <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
          <EditableText
            content="Living Systems"
            onSave={handleSave}
            className="text-[#47ff4c]"
            tag="span"
          /><br />
          <EditableText
            content="& Regeneration"
            onSave={handleSave}
            className="text-white"
            tag="span"
          />
        </h1>

        <div className="space-y-4 max-w-4xl">
          <EditableText
            content="We work with living systems — landscapes, forests, oceans, and ecosystems — to design regenerative solutions that bring life back to degraded environments."
            onSave={handleSave}
            className="text-slate-200 text-base sm:text-lg md:text-xl leading-relaxed"
            tag="p"
            multiline
          />

          <EditableText
            content="From farms and urban plots to coastlines, regenerative agriculture and circular economy design, we help organizations create systems that restore biodiversity, sequester carbon, and build resilience."
            onSave={handleSave}
            className="text-slate-200 text-base sm:text-lg md:text-xl leading-relaxed"
            tag="p"
            multiline
          />

          <EditableText
            content="Whether you're enhancing a living farm functionality, planning a restoration project, or designing regenerative infrastructure, we provide the expertise to create systems that regenerate rather than extract."
            onSave={handleSave}
            className="text-slate-200 text-base sm:text-lg md:text-xl leading-relaxed"
            tag="p"
            multiline
          />
        </div>
      </div>
    </header>
  )
}