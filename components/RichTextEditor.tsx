"use client";
import { useState } from 'react';
import { Bold, Italic, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string | any;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  rows = 3,
  className = "",
  label
}: RichTextEditorProps) {
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');

  // Internal function to convert any value to string
  const getStringValue = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return '';
    if (typeof val === 'object' && val !== null) {
      if (val.content) return String(val.content);
      if (val.format !== undefined) return String(val.content || '');
      return '';
    }
    return String(val || '');
  };

  const stringValue = getStringValue(value);

  const handleContentChange = (content: string) => {
    // Apply current formatting to the content when saving
    let formattedContent = content;
    
    if (fontWeight === 'bold' || fontStyle === 'italic' || fontSize !== 16) {
      const styles = [];
      if (fontWeight === 'bold') styles.push('font-weight: bold');
      if (fontStyle === 'italic') styles.push('font-style: italic');
      if (fontSize !== 16) styles.push(`font-size: ${fontSize}px`);
      
      if (styles.length > 0) {
        formattedContent = `<span style="${styles.join('; ')}">${content}</span>`;
      }
    }
    
    onChange(formattedContent);
  };

  const toggleBold = () => {
    const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
    setFontWeight(newWeight);
    
    // Re-apply formatting to current content
    if (stringValue) {
      const plainText = stringValue.replace(/<[^>]*>/g, ''); // Strip existing HTML
      const styles = [];
      if (newWeight === 'bold') styles.push('font-weight: bold');
      if (fontStyle === 'italic') styles.push('font-style: italic');
      if (fontSize !== 16) styles.push(`font-size: ${fontSize}px`);
      
      const formattedContent = styles.length > 0 
        ? `<span style="${styles.join('; ')}">${plainText}</span>`
        : plainText;
      
      onChange(formattedContent);
    }
  };

  const toggleItalic = () => {
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(newStyle);
    
    // Re-apply formatting to current content
    if (stringValue) {
      const plainText = stringValue.replace(/<[^>]*>/g, ''); // Strip existing HTML
      const styles = [];
      if (fontWeight === 'bold') styles.push('font-weight: bold');
      if (newStyle === 'italic') styles.push('font-style: italic');
      if (fontSize !== 16) styles.push(`font-size: ${fontSize}px`);
      
      const formattedContent = styles.length > 0 
        ? `<span style="${styles.join('; ')}">${plainText}</span>`
        : plainText;
      
      onChange(formattedContent);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all duration-200";
  const labelClass = "text-white text-sm mb-2 block";
  const buttonClass = "p-2 rounded border border-white/20 transition-all duration-200 flex items-center justify-center";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className={labelClass}>{label}</label>}
      
      {/* Formatting Controls */}
      <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center gap-1">
          <Type size={16} className="text-gray-400" />
          <input
            type="number"
            min="10"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 16)}
            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
          />
          <span className="text-gray-400 text-sm">px</span>
        </div>
        
        <div className="w-px h-6 bg-white/20" />
        
        <button
          type="button"
          onClick={toggleBold}
          className={`${buttonClass} ${
            fontWeight === 'bold' 
              ? 'bg-primary/30 border-primary/50 text-primary' 
              : 'hover:bg-white/10 text-gray-400'
          }`}
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`${buttonClass} ${
            fontStyle === 'italic' 
              ? 'bg-primary/30 border-primary/50 text-primary' 
              : 'hover:bg-white/10 text-gray-400'
          }`}
        >
          <Italic size={16} />
        </button>
      </div>

      {/* Text Input */}
      <textarea
        value={stringValue ? stringValue.replace(/<[^>]*>/g, '') : ''} // Show plain text in editor
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={inputClass}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          fontStyle: fontStyle
        }}
      />
      
      {/* Preview */}
      {stringValue && (
        <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Preview:</div>
          <div
            style={{ color: 'white' }}
            dangerouslySetInnerHTML={{ __html: String(getStringValue(stringValue) || '') }}
          />
        </div>
      )}
    </div>
  );
}