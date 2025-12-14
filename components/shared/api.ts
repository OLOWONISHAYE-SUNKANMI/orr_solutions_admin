const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-web-latest.onrender.com';

export interface CMSContent {
  id: string;
  section: string;
  field: string;
  content: string;
  content_type: 'text' | 'image' | 'html';
  created_at: string;
  updated_at: string;
}

class UnifiedAPIService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth-token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async fetchContent(): Promise<CMSContent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-portal/v1/cms/content/`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  }

  async updateContent(section: string, field: string, content: string, contentType: 'text' | 'image' | 'html' = 'text'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-portal/v1/cms/content/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          section,
          field,
          content,
          content_type: contentType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update content');
      }

      // Trigger immediate refresh across all components
      window.dispatchEvent(new CustomEvent('cmsContentUpdated', {
        detail: { section, field, content, contentType }
      }));
      
      // Force immediate refresh
      window.dispatchEvent(new CustomEvent('forceContentRefresh'));
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/admin-portal/v1/cms/upload-image/`, {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('auth-token') || localStorage.getItem('token')) && {
            'Authorization': `Bearer ${localStorage.getItem('auth-token') || localStorage.getItem('token')}`
          }
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.image_url || data.data?.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export const unifiedAPI = new UnifiedAPIService();