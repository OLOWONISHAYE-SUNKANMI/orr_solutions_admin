'use client';
import { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'label';
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableText({
  content,
  onSave,
  tag = 'p',
  className = '',
  placeholder = 'Click to edit...',
  multiline = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(content);
  }, [content]);

  // Auto-save with debouncing
  useEffect(() => {
    if (value !== content && value.trim() !== '') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        if (value !== content && !isSaving) {
          setIsSaving(true);
          try {
            await onSave(value);
          } catch (error) {
            console.error('Auto-save failed:', error);
            setValue(content);
          } finally {
            setIsSaving(false);
          }
        }
      }, 500);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value, content, onSave, isSaving]);

  const handleSave = async () => {
    if (value !== content) {
      setIsSaving(true);
      try {
        await onSave(value);
      } catch (error) {
        console.error('Failed to save:', error);
        setValue(content);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const Component = tag;

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <InputComponent
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        className={`${className} border-2 border-blue-500 bg-transparent outline-none ${multiline ? 'min-h-[100px]' : ''}`}
        placeholder={placeholder}
        autoFocus
        disabled={isSaving}
      />
    );
  }

  return (
    <Component
      className={`${className} cursor-pointer hover:bg-white/10 transition-colors ${isSaving ? 'opacity-50' : ''}`}
      onClick={() => setIsEditing(true)}
    >
      {content || placeholder}
      {isSaving && <span className="ml-2 text-xs opacity-60">Saving...</span>}
    </Component>
  );
}