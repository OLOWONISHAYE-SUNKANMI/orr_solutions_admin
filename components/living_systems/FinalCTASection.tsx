import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export default function LivingSystemsFinalCTASection() {
  const handleSave = async (content: string | RichTextData) => {
    // TODO: Implement API call to save content
    const contentToSave = typeof content === 'string' ? content : content.content;
    console.log('Saving content:', contentToSave);
  };

  return (
    <section className="relative z-10 py-24 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <EditableText
          content="Ready to Work With Your Living Systems,"
          onSave={handleSave}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          tag="h2"
        />
        <EditableText
          content="Not Against Them?"
          onSave={handleSave}
          className="text-4xl md:text-5xl font-bold text-[#47ff4c] mb-8"
          tag="h2"
        />
        <EditableText
          content="Let's help your business discover and design systems that regenerate rather than deplete."
          onSave={handleSave}
          className="text-slate-200 text-lg mb-12 max-w-3xl mx-auto"
          tag="p"
          multiline
        />
        <EditableText
          content="Book a free Living Systems assessment"
          onSave={handleSave}
          className="bg-gradient-to-r from-[#47ff4c] to-[#0ec277] text-black px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-[#47ff4c]/25 transition-all duration-300 inline-block"
          tag="span"
        />
      </div>
    </section>
  )
}