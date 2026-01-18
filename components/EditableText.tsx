'use client';
import { useState, useRef, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import { Bold, Italic, Type } from 'lucide-react';

interface RichTextData {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

interface EditableTextProps {
  content: string | RichTextData;
  onSave: (newContent: string | RichTextData) => Promise<void>;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  enableRichText?: boolean;
}

function EditableText({
  content,
  onSave,
  className = '',
  tag = 'p',
  placeholder = 'Click to edit...',
  multiline = false,
  style,
  enableRichText = true
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [richTextData, setRichTextData] = useState<RichTextData>(() => {
    if (typeof content === 'string') {
      return {
        content: content || '',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal'
      };
    }
    return content || {
      content: '',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal'
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(true); // Always allow editing in admin
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof content === 'string') {
      setRichTextData({
        content: content || '',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal'
      });
    } else {
      setRichTextData(content || {
        content: '',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal'
      });
    }
  }, [content]);

  useEffect(() => {
    if (isEditing) {
      const length = richTextData.content.length;
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(length, length);
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(length, length);
      }
    }
  }, [isEditing, multiline, richTextData.content]);

  const handleClick = () => {
    if (canEdit && !isEditing && !isSaving) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const currentContent = typeof content === 'string' ? content : content?.content || '';
    if (richTextData.content !== currentContent && !isSaving) {
      setIsSaving(true);
      try {
        if (enableRichText) {
          await onSave(richTextData);
        } else {
          await onSave(richTextData.content);
        }
      } catch (error) {
        console.error('Failed to save:', error);
        // Revert to original content
        if (typeof content === 'string') {
          setRichTextData({
            content: content || '',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal'
          });
        } else {
          setRichTextData(content || {
            content: '',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal'
          });
        }
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (typeof content === 'string') {
      setRichTextData({
        content: content || '',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal'
      });
    } else {
      setRichTextData(content || {
        content: '',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal'
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleBold = () => {
    setRichTextData(prev => ({
      ...prev,
      fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold'
    }));
  };

  const toggleItalic = () => {
    setRichTextData(prev => ({
      ...prev,
      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic'
    }));
  };

  const handleFontSizeChange = (fontSize: number) => {
    setRichTextData(prev => ({
      ...prev,
      fontSize
    }));
  };

  const editableProps = {
    className: `${className} ${canEdit ? 'cursor-pointer hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-500 transition-all' : ''} ${isEditing ? 'bg-blue-500/20 outline outline-2 outline-blue-500' : ''}`,
    onClick: handleClick,
    title: canEdit ? 'Click to edit' : undefined,
    style: {
      ...style,
      ...(typeof content !== 'string' ? {
        fontSize: `${content?.fontSize || 16}px`,
        fontWeight: content?.fontWeight || 'normal',
        fontStyle: content?.fontStyle || 'normal'
      } : {})
    }
  };

  if (isEditing) {
    const inputStyles = {
      fontSize: `${richTextData.fontSize}px`,
      fontWeight: richTextData.fontWeight,
      fontStyle: richTextData.fontStyle
    };

    return (
      <div className="relative space-y-2">
        {enableRichText && (
          <div className="flex items-center gap-2 p-2 bg-white/10 border border-white/20 rounded-lg">
            <div className="flex items-center gap-1">
              <Type size={14} className="text-gray-400" />
              <input
                type="number"
                min="10"
                max="72"
                value={richTextData.fontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 16)}
                className="w-12 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white text-xs"
              />
              <span className="text-gray-400 text-xs">px</span>
            </div>
            
            <div className="w-px h-4 bg-white/20" />
            
            <button
              type="button"
              onClick={toggleBold}
              className={`p-1 rounded border border-white/20 transition-all duration-200 ${
                richTextData.fontWeight === 'bold' 
                  ? 'bg-blue-500/30 border-blue-500/50 text-blue-400' 
                  : 'hover:bg-white/10 text-gray-400'
              }`}
            >
              <Bold size={14} />
            </button>
            
            <button
              type="button"
              onClick={toggleItalic}
              className={`p-1 rounded border border-white/20 transition-all duration-200 ${
                richTextData.fontStyle === 'italic' 
                  ? 'bg-blue-500/30 border-blue-500/50 text-blue-400' 
                  : 'hover:bg-white/10 text-gray-400'
              }`}
            >
              <Italic size={14} />
            </button>
          </div>
        )}
        
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={richTextData.content}
            onChange={(e) => setRichTextData(prev => ({ ...prev, content: e.target.value }))}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${className} bg-white text-black p-2 rounded border-2 border-blue-500 focus:outline-none !text-black`}
            style={inputStyles}
            placeholder={placeholder}
            disabled={isSaving}
            rows={Math.max(3, (richTextData.content || '').split('\n').length)}
          />
        ) : (
          <input
            type="text"
            ref={inputRef}
            value={richTextData.content}
            onChange={(e) => setRichTextData(prev => ({ ...prev, content: e.target.value }))}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`${className} bg-white text-black p-2 rounded border-2 border-blue-500 focus:outline-none !text-black`}
            style={inputStyles}
            placeholder={placeholder}
            disabled={isSaving}
          />
        )}
        
        {isSaving && (
          <div className="absolute top-2 right-2 text-blue-500 text-sm bg-white px-2 py-1 rounded">
            Saving...
          </div>
        )}
      </div>
    );
  }

  const Tag = tag;
  const displayContent = typeof content === 'string' ? content : content?.content || '';
  
  return (
    <Tag {...editableProps}>
      {displayContent || placeholder}
      {canEdit && !isSaving && (
        <span className="ml-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
          ✏️
        </span>
      )}
      {isSaving && (
        <span className="ml-2 text-green-400 text-sm">
          💾
        </span>
      )}
    </Tag>
  );
}

export default EditableText;