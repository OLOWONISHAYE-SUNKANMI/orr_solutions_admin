'use client';
import { useState, useRef, useEffect } from 'react';
import { AuthService } from '../lib/auth';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newImageUrl: string) => Promise<void>;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend.orr.solutions/';

export default function EditableImage({
  src,
  alt,
  onSave,
  className = '',
  width,
  height,
  fill = false
}: EditableImageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = AuthService.getInstance();

  useEffect(() => {
    const updateCanEdit = () => {
      setCanEdit(auth.canEdit());
    };
    
    updateCanEdit();
    
    // Update canEdit status every 2 seconds to catch auth changes
    const interval = setInterval(updateCanEdit, 2000);
    
    return () => clearInterval(interval);
  }, [auth]);

  const handleImageClick = () => {
    if (canEdit && !isEditing) {
      if (!auth.isAuthenticated()) {
        console.error('User not authenticated');
        return;
      }
      setIsEditing(true);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!auth.isAuthenticated()) {
      console.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await auth.makeAuthenticatedRequest(
        `${API_BASE_URL}/admin-portal/v1/cms/upload-image/`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      const imageUrl = data.image_url || data.data?.image_url;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }
      await onSave(imageUrl);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUrlSave = async () => {
    if (newImageUrl.trim()) {
      setIsSaving(true);
      try {
        await onSave(newImageUrl.trim());
        setIsEditing(false);
        setNewImageUrl('');
      } catch (error) {
        console.error('Failed to save image URL:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewImageUrl('');
  };

  if (isEditing) {
    return (
      <div className={`${className} border-2 border-blue-500 rounded p-4 bg-white/90`}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isSaving}
            />
          </div>
          
          <div className="text-center text-gray-500">or</div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded text-black"
              disabled={isSaving}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleUrlSave}
              disabled={isSaving || !newImageUrl.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save URL'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageStyle = fill ? { width: '100%', height: '100%', objectFit: 'cover' as const } : { width, height };
  
  // Convert relative paths to full URLs
  const imageUrl = src && src.startsWith('/') ? `${API_BASE_URL}${src}` : (src || '');

  // Don't render if no image URL
  if (!imageUrl) {
    return canEdit ? (
      <div 
        className={`${className} border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors`}
        style={imageStyle}
        onClick={handleImageClick}
      >
        <span className="text-gray-500 text-sm">📷 Add Image</span>
      </div>
    ) : null;
  }

  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${canEdit ? 'cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
        style={imageStyle}
        onClick={handleImageClick}
        title={canEdit ? 'Click to change image' : undefined}
      />
      {canEdit && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity z-10">
          📷 Edit
        </div>
      )}
    </div>
  );
}