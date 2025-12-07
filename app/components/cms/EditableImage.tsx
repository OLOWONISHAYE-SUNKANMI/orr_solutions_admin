'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../lib/hooks/auth';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newImageUrl: string) => Promise<void>;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

const API_BASE_URL = 'https://orr-backend-web-latest.onrender.com';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuthStore();
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const handleImageClick = () => {
    if (isAuthenticated && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isAuthenticated) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(
        `${API_BASE_URL}/admin-portal/v1/cms/upload-image/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
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
      <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm`}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Image</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                disabled={isSaving}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUrlSave}
                disabled={isSaving || !newImageUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert relative paths to full URLs
  const imageUrl = src && src.startsWith('/') ? `${API_BASE_URL}${src}` : (src || '');

  // Don't render if no image URL
  if (!imageUrl) {
    return isAuthenticated ? (
      <div 
        className={`${className} ${fill ? 'absolute inset-0' : ''} border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors`}
        style={fill ? undefined : { width, height }}
        onClick={handleImageClick}
      >
        <span className="text-gray-500 text-sm">📷 Add Image</span>
      </div>
    ) : null;
  }

  if (fill) {
    return (
      <div className="absolute inset-0 group">
        <img
          src={imageUrl}
          alt={alt}
          className={`${className} ${isAuthenticated ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
          title={isAuthenticated ? 'Click to change image' : undefined}
        />
        {isAuthenticated && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center" onClick={handleImageClick}>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              📷 Edit Image
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block group">
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isAuthenticated ? 'cursor-pointer' : ''}`}
        style={{ width, height }}
        onClick={handleImageClick}
        title={isAuthenticated ? 'Click to change image' : undefined}
      />
      {isAuthenticated && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          📷 Edit
        </div>
      )}
    </div>
  );
}