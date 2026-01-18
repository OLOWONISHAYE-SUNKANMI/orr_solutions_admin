import EditableText from '../EditableText';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface NetworkCardProps {
  title: string;
  description: string;
  icon: string;
  index?: number;
  onUpdate?: (content: string, field: string, index: number) => void;
}

export default function NetworkCard({ title, description, icon, index = 0, onUpdate }: NetworkCardProps) {
  const handleSave = async (content: string | RichTextData, field: string) => {
    const contentString = typeof content === 'string' ? content : content.content;
    if (onUpdate) {
      await onUpdate(contentString, field, index);
    }
    console.log('Saving content:', contentString);
  };

  return (
    <div className="bg-primary flex flex-col items-start justify-between rounded-lg px-8 pt-8 pb-16 w-full md:w-86 lg:w-82">
      <div className="w-16 h-16 mb-6 bg-white/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d={icon}/>
        </svg>
      </div>
      <EditableText
        content={title}
        onSave={(content) => handleSave(content, 'card-title')}
        className="text-xl font-bold text-white mb-4"
        tag="h3"
      />
      <EditableText
        content={description}
        onSave={(content) => handleSave(content, 'card-description')}
        className="text-white/90 text-sm mb-6"
        tag="p"
        multiline
      />
      <EditableText
        content="Join Now"
        onSave={async (content) => handleSave(content, 'button-text')}
        className="bg-white text-black px-6 py-2 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
        tag="span"
      />
    </div>
  );
}