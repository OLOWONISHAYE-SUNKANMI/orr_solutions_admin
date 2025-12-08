'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../lib/hooks/auth';

interface EditableTextProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableText({
  content,
  onSave,
  className = '',
  tag = 'p',
  placeholder = 'Click to edit...',
  multiline = false
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setValue(content || '');
  }, [content]);

  useEffect(() => {
    if (isEditing && inputRef.current && value) {
      inputRef.current.focus();
      if (multiline) {
        (inputRef.current as HTMLTextAreaElement).setSelectionRange(value.length, value.length);
      } else {
        (inputRef.current as HTMLInputElement).setSelectionRange(value.length, value.length);
      }
    }
  }, [isEditing, multiline, value?.length]);

  const handleClick = () => {
    if (isAuthenticated && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (value !== (content || '')) {
      setIsSaving(true);
      try {
        await onSave(value);
      } catch (error) {
        console.error('Failed to save:', error);
        setValue(content || '');
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(content || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave();
    }
  };

  const editableProps = {
    className: `${className} ${isAuthenticated ? 'cursor-pointer hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-500 transition-all' : ''} ${isEditing ? 'bg-blue-500/20 outline outline-2 outline-blue-500' : ''}`,
    onClick: handleClick,
    title: isAuthenticated ? 'Click to edit' : undefined,
  };

  if (isEditing) {
    const baseInputProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: `${className} bg-white text-black p-2 rounded border-2 border-blue-500 focus:outline-none !text-black`,
      placeholder,
      disabled: isSaving,
    };

    if (multiline) {
      return (
        <div className="relative">
          <textarea
            {...(baseInputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={Math.max(3, (value || '').split('\n').length)}
          />
          {isSaving && (
            <div className="absolute top-2 right-2 text-blue-500">
              Saving...
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative">
          <input
            type="text"
            {...(baseInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
            ref={inputRef as React.RefObject<HTMLInputElement>}
          />
          {isSaving && (
            <div className="absolute top-2 right-2 text-blue-500 text-sm">
              Saving...
            </div>
          )}
        </div>
      );
    }
  }

  const Tag = tag;
  return (
    <Tag {...editableProps}>
      {content || placeholder}
      {isAuthenticated && (
        <span className="ml-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
          ✏️
        </span>
      )}
    </Tag>
  );
}