'use client';
import { useState, useEffect, useCallback } from 'react';
import { unifiedAPI, CMSContent } from './api';

interface ContentState {
  [key: string]: {
    [key: string]: string;
  };
}

export function useContent() {
  const [content, setContent] = useState<ContentState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unifiedAPI.fetchContent();
      
      // Transform array to nested object structure
      const contentMap: ContentState = {};
      data.forEach((item: CMSContent) => {
        if (!contentMap[item.section]) {
          contentMap[item.section] = {};
        }
        contentMap[item.section][item.field] = item.content;
      });
      
      setContent(contentMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = useCallback(async (section: string, field: string, newContent: string, contentType: 'text' | 'image' | 'html' = 'text') => {
    try {
      // Update local state immediately for optimistic updates
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newContent
        }
      }));

      await unifiedAPI.updateContent(section, field, newContent, contentType);
    } catch (err) {
      console.error('Error updating content:', err);
      // Revert on error
      loadContent();
      throw err;
    }
  }, [loadContent]);

  const getContent = useCallback((section: string, field: string, defaultValue: string = '') => {
    return content[section]?.[field] || defaultValue;
  }, [content]);

  // Listen for content updates from other components
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      const { section, field, content: newContent } = event.detail;
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newContent
        }
      }));
    };

    const handleForceRefresh = () => {
      loadContent();
    };

    window.addEventListener('cmsContentUpdated', handleContentUpdate as EventListener);
    window.addEventListener('forceContentRefresh', handleForceRefresh);
    return () => {
      window.removeEventListener('cmsContentUpdated', handleContentUpdate as EventListener);
      window.removeEventListener('forceContentRefresh', handleForceRefresh);
    };
  }, [loadContent]);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Auto-refresh content every 3 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(loadContent, 3000);
    return () => clearInterval(interval);
  }, [loadContent]);

  // Listen for visibility changes to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadContent();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    updateContent,
    getContent,
    refreshContent: loadContent
  };
}